import { MOCK_CUSTOM_PRODUCTS } from "./supabase";
import liveShopifyProducts from "../data/shopify_products.json";
import liveShopifyCatalog from "../data/live_shopify_catalog.json";

export let dynamicLiveProducts = liveShopifyProducts && liveShopifyProducts.length > 0 ? liveShopifyProducts : MOCK_CUSTOM_PRODUCTS;
export let dynamicLiveCatalog = liveShopifyCatalog || [];

export function mapRawShopifyProduct(p) {
  const firstVariant = p.variants?.[0] || {};
  const price = parseFloat(firstVariant.price || 0);

  let category = (p.product_type || "merch").toLowerCase();
  const tags = (p.tags || []).map((t) => (typeof t === "string" ? t.toLowerCase() : ""));
  const fullText = `${p.title} ${p.body_html || ""} ${tags.join(" ")}`.toLowerCase();

  if (tags.includes("hoodie") || tags.includes("hoodies") || fullText.includes("hoodie") || fullText.includes("sweatshirt")) {
    category = "hoodies";
  } else if (tags.includes("v-neck") || tags.includes("vneck") || fullText.includes("v-neck")) {
    category = "vnecks";
  } else if (tags.includes("tank") || tags.includes("tanks") || fullText.includes("tank") || fullText.includes("crop")) {
    category = "tanks";
  } else if (tags.includes("tumbler") || tags.includes("tumblers") || fullText.includes("tumbler") || fullText.includes("drinkware")) {
    category = "tumblers";
  } else if (tags.includes("beanie") || tags.includes("hat") || tags.includes("accessories") || fullText.includes("beanie")) {
    category = "accessories";
  } else if (category === "merch" || tags.includes("shirts") || fullText.includes("tee") || fullText.includes("shirt")) {
    category = "shirts";
  }

  const sizeOpt = p.options?.find((o) => o.name.toLowerCase() === "size");
  const colorOpt = p.options?.find((o) => o.name.toLowerCase() === "color");
  const sizes = sizeOpt ? sizeOpt.values : ["S", "M", "L", "XL", "2XL"];
  const colors = colorOpt ? colorOpt.values : ["Black", "White"];

  let dbGender = "unisex";
  if (fullText.includes("women's") || fullText.includes("womens") || fullText.includes("women") || fullText.includes("ladies") || fullText.includes("racerback")) {
    dbGender = "women";
  } else if (fullText.includes("men's") || fullText.includes("mens")) {
    dbGender = "men";
  }

  const imageUrl = p.images?.[0]?.src || "";

  return {
    id: `gid://shopify/Product/${p.id}`,
    name: p.title,
    description: (p.body_html || "").replace(/<[^>]*>?/gm, ""),
    price: price > 0 ? price : 28.00,
    image_url: imageUrl,
    category,
    dbCategory: category,
    dbGender,
    style: fullText.includes("v-neck") ? "v-neck" : "normal",
    sizes,
    colors,
    stock: 50,
    is_new: tags.includes("new") || tags.includes("new-drop"),
    is_featured: true,
    tour_exclusive: tags.includes("tour-exclusive") || tags.includes("tour"),
    isCustom: true,
  };
}

let isFetchingLive = false;
let lastFetchTime = 0;

export async function fetchLiveShopifyProducts() {
  const now = Date.now();
  // Cache for 15 seconds to allow fast updates while preventing API abuse
  if (now - lastFetchTime < 15000 && dynamicLiveProducts.length > 0) {
    return dynamicLiveProducts;
  }
  if (isFetchingLive) return dynamicLiveProducts;
  isFetchingLive = true;

  try {
    const res = await fetch("https://boogieandtheyoyozmerch.com/products.json?limit=250");
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        dynamicLiveCatalog = data.products;
        dynamicLiveProducts = data.products.map(mapRawShopifyProduct);
        lastFetchTime = Date.now();
      }
    }
  } catch (err) {
    console.warn("[shopify] Live fetch fallback:", err);
  } finally {
    isFetchingLive = false;
  }
  return dynamicLiveProducts;
}


/**
 * Shopify Storefront API integration.
 *
 * When ready to go live with Shopify:
 * 1. Create a custom app in Shopify admin (Settings > Apps and integrations > App and sales channels)
 * 2. Get the Storefront API access token
 * 3. Set VITE_SHOPIFY_STOREFRONT_TOKEN and VITE_SHOPIFY_STORE_URL in .env
 * 4. Swap imports: instead of getProducts from './supabase', use './shopifyClient'
 * 5. CartItem/Order still live in Base44 (or migrate to Shopify Checkout if needed)
 *
 * The shape matches getProducts from supabase.js so no component changes needed.
 */

const SHOPIFY_STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const isConfigured = 
  SHOPIFY_STORE_URL && 
  SHOPIFY_STOREFRONT_TOKEN && 
  SHOPIFY_STORE_URL !== "https://your-store.myshopify.com" && 
  SHOPIFY_STOREFRONT_TOKEN !== "your-token-here";

if (!isConfigured) {
  console.warn("[shopify] VITE_SHOPIFY_STORE_URL / VITE_SHOPIFY_STOREFRONT_TOKEN not set or placeholder — falling back to mock catalog.");
}

/**
 * Raw GraphQL fetch to Shopify Storefront API.
 */
async function shopifyFetch(query, variables = {}) {
  if (!isConfigured) {
    throw new Error("[shopify] Not configured");
  }

  const res = await fetch(`${SHOPIFY_STORE_URL}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error("[shopify] GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "Shopify API error");
  }

  return json.data;
}

/**
 * Map Shopify product to the same shape as supabase.js getProducts.
 */
function mapShopifyProduct(product) {
  const variant = product.variants.nodes?.[0] || {};

  const category =
    product.collections?.nodes?.[0]?.handle ||
    product.metafield?.value ||
    "merch";

  const sizes = [
    ...new Set(
      product.variants.nodes
        ?.map((v) =>
          v.selectedOptions?.find((o) => o.name.toLowerCase() === "size")?.value
        )
        .filter(Boolean)
    ),
  ];

  const colors = [
    ...new Set(
      product.variants.nodes
        ?.map((v) =>
          v.selectedOptions?.find((o) => o.name.toLowerCase() === "color")?.value
        )
        .filter(Boolean)
    ),
  ];

  return {
    id: product.id,
    name: product.title,
    description: product.description || "",
    price: parseFloat(variant.price?.amount || 0),
    image_url: product.featuredImage?.url || "",
    category,
    dbCategory: category,
    dbGender: product.metafields?.find((m) => m.key === "gender")?.value || "unisex",
    style: product.metafields?.find((m) => m.key === "style")?.value || null,
    sizes,
    colors,
    stock: variant.quantityAvailable || 0,
    is_new: false,
    is_featured: product.metafields?.find((m) => m.key === "featured")?.value === "true",
    tour_exclusive: product.tags?.includes("tour-exclusive") || false,
    isCustom: product.tags?.includes("customizable") || false,
  };
}

/**
 * Get all products, optionally filtered.
 * Drop-in replacement for getProducts() from supabase.js.
 */
export const getProducts = async (filters = {}) => {
  if (!isConfigured) {
    try {
      await fetchLiveShopifyProducts();
    } catch (_) {}

    // Apply filters on the dynamic catalog dataset so filter options work in dev mode and live
    let products = [...dynamicLiveProducts];

    if (filters.category && filters.category !== "all") {
      if (filters.category.startsWith("category_")) {
        const catName = filters.category.replace("category_", "");
        products = products.filter((p) => p.dbCategory === catName);
      } else if (filters.category.startsWith("gender_")) {
        const genderName = filters.category.replace("gender_", "");
        products = products.filter((p) => p.dbGender === genderName || p.dbGender === "unisex");
      } else {
        products = products.filter((p) => p.category === filters.category);
      }
    }

    if (filters.gender && filters.gender !== "all") {
      products = products.filter((p) => p.dbGender === filters.gender || p.dbGender === "unisex");
    }

    if (filters.style && filters.style !== "all") {
      if (filters.style === "normal") {
        products = products.filter((p) => p.style === "normal" || !p.style);
      } else {
        products = products.filter((p) => p.style === filters.style);
      }
    }

    return products;
  }

  let queryFilter = "status:active";

  if (filters.category && filters.category !== "all") {
    queryFilter += ` AND collection:"${filters.category}"`;
  }

  if (filters.gender && filters.gender !== "all") {
    queryFilter += ` AND metafield:gender:${filters.gender}`;
  }

  const query = `
    query GetProducts($first: Int!, $query: String) {
      products(first: $first, query: $query) {
        nodes {
          id
          title
          description
          handle
          tags
          featuredImage {
            url
          }
          variants(first: 100) {
            nodes {
              id
              title
              price {
                amount
              }
              quantityAvailable
              selectedOptions {
                name
                value
              }
            }
          }
          metafields(identifiers: [
            { namespace: "custom", key: "gender" }
            { namespace: "custom", key: "featured" }
            { namespace: "custom", key: "style" }
          ]) {
            key
            value
          }
          collections(first: 5) {
            nodes {
              handle
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { first: 100, query: queryFilter });

    let products = (data.products?.nodes || []).map(mapShopifyProduct);

    // Client-side style filter (same logic as supabase.js — handles NULL safely)
    if (filters.style && filters.style !== "all") {
      if (filters.style === "normal") {
        products = products.filter((p) => p.style === "normal" || !p.style);
      } else {
        products = products.filter((p) => p.style === filters.style);
      }
    }

    return products;
  } catch (error) {
    console.error("Error fetching products, falling back to mock catalog:", error);
    let products = [...MOCK_OR_LIVE_PRODUCTS];

    if (filters.category && filters.category !== "all") {
      if (filters.category.startsWith("category_")) {
        const catName = filters.category.replace("category_", "");
        products = products.filter((p) => p.dbCategory === catName);
      } else if (filters.category.startsWith("gender_")) {
        const genderName = filters.category.replace("gender_", "");
        products = products.filter((p) => p.dbGender === genderName || p.dbGender === "unisex");
      } else {
        products = products.filter((p) => p.category === filters.category);
      }
    }

    if (filters.gender && filters.gender !== "all") {
      products = products.filter((p) => p.dbGender === filters.gender || p.dbGender === "unisex");
    }

    if (filters.style && filters.style !== "all") {
      if (filters.style === "normal") {
        products = products.filter((p) => p.style === "normal" || !p.style);
      } else {
        products = products.filter((p) => p.style === filters.style);
      }
    }

    return products;
  }
};

/**
 * Get a single product by ID.
 * Drop-in replacement for getProduct() from supabase.js.
 */
export const getProduct = async (id) => {
  if (!isConfigured) {
    return MOCK_OR_LIVE_PRODUCTS.find((p) => p.id === id) || null;
  }

  const query = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        handle
        tags
        featuredImage {
          url
        }
        images(first: 10) {
          nodes {
            url
          }
        }
        variants(first: 100) {
          nodes {
            id
            title
            price {
              amount
            }
            quantityAvailable
            selectedOptions {
              name
              value
            }
          }
        }
        metafields(identifiers: [
          { namespace: "custom", key: "gender" }
          { namespace: "custom", key: "featured" }
          { namespace: "custom", key: "style" }
        ]) {
          key
          value
        }
        collections(first: 5) {
          nodes {
            handle
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { id });
    return data.product ? mapShopifyProduct(data.product) : null;
  } catch (error) {
    console.error("Error fetching product, falling back to mock catalog:", error);
    return MOCK_OR_LIVE_PRODUCTS.find((p) => p.id === id) || null;
  }
};

/**
 * Get tour dates from Shopify (alternative to Supabase tour_dates table).
 * Store shows as products tagged "tour-show" with date/venue/city metafields.
 */
export const getShopifyTourDates = async () => {
  if (!isConfigured) {
    return [
      { id: "mock-show-1", city: "Austin, TX", venue: "The Continental Club", show_date: "2026-07-14", ticket_url: "#" },
      { id: "mock-show-2", city: "Dallas, TX", venue: "Deep Ellum Art Co.", show_date: "2026-07-21", ticket_url: "#" },
      { id: "mock-show-3", city: "Houston, TX", venue: "White Oak Music Hall", show_date: "2026-07-28", ticket_url: "#" },
      { id: "mock-show-4", city: "New Orleans, LA", venue: "Tipitina's", show_date: "2026-08-04", ticket_url: "#" },
    ];
  }

  const query = `
    query GetTourShows {
      products(first: 100, query: "tag:tour-show") {
        nodes {
          id
          title
          metafields(identifiers: [
            { namespace: "custom", key: "show_date" }
            { namespace: "custom", key: "venue" }
            { namespace: "custom", key: "city" }
            { namespace: "custom", key: "ticket_url" }
          ]) {
            key
            value
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query);
    return (data.products?.nodes || [])
      .map((p) => {
        const mf = {};
        p.metafields?.forEach((m) => { mf[m.key] = m.value; });
        return {
          id: p.id,
          city: mf.city || "",
          venue: mf.venue || "",
          show_date: mf.show_date || "",
          ticket_url: mf.ticket_url || null,
        };
      })
      .filter((s) => s.show_date);
  } catch (error) {
    console.error("Error fetching tour dates, falling back to mock dates:", error);
    return [
      { id: "mock-show-1", city: "Austin, TX", venue: "The Continental Club", show_date: "2026-07-14", ticket_url: "#" },
      { id: "mock-show-2", city: "Dallas, TX", venue: "Deep Ellum Art Co.", show_date: "2026-07-21", ticket_url: "#" },
      { id: "mock-show-3", city: "Houston, TX", venue: "White Oak Music Hall", show_date: "2026-07-28", ticket_url: "#" },
      { id: "mock-show-4", city: "New Orleans, LA", venue: "Tipitina's", show_date: "2026-08-04", ticket_url: "#" },
    ];
  }
};

/**
 * Generate a direct Shopify checkout permalink URL for cart items.
 * Redirects user directly to Shopify checkout with all selected items and variants.
 */
export function getShopifyCheckoutUrl(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return "https://www.boogieandtheyoyozmerch.com";
  }

  const parts = [];

  for (const item of cartItems) {
    const qty = item.quantity || 1;
    let variantId = item.variant_id;

    const catalogSource = (dynamicLiveCatalog && dynamicLiveCatalog.length > 0) ? dynamicLiveCatalog : liveShopifyCatalog;

    if (!variantId && catalogSource) {
      const cleanName = (item.product_name || "")
        .toLowerCase()
        .replace(/\s*\(custom:.*\)/i, "")
        .trim();

      const product = catalogSource.find((p) =>
        String(p.id) === String(item.product_id).replace(/\D/g, "") ||
        p.title.toLowerCase().includes(cleanName) ||
        cleanName.includes(p.title.toLowerCase())
      );

      if (product && product.variants && product.variants.length > 0) {
        const matched = product.variants.find((v) => {
          const opt1 = (v.option1 || "").toLowerCase();
          const opt2 = (v.option2 || "").toLowerCase();
          const color = (item.color || "").toLowerCase();
          const size = (item.size || "").toLowerCase();
          const hasColor = !color || opt1 === color || opt2 === color;
          const hasSize = !size || opt1 === size || opt2 === size;
          return hasColor && hasSize;
        });
        variantId = matched ? matched.id : product.variants[0].id;
      }
    }

    if (variantId) {
      parts.push(`${variantId}:${qty}`);
    }
  }

  if (parts.length === 0) {
    return "https://www.boogieandtheyoyozmerch.com/cart";
  }

  return `https://www.boogieandtheyoyozmerch.com/cart/${parts.join(",")}`;
}

/**
 * Trigger immediate browser redirect to Shopify checkout
 */
export function redirectToShopifyCheckout(cartItems) {
  const url = getShopifyCheckoutUrl(cartItems);
  window.location.href = url;
}
