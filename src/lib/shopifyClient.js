import { MOCK_CUSTOM_PRODUCTS } from "./supabase";

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

const SHOPIFY_STORE_URL =
  import.meta.env.VITE_SHOPIFY_STORE_URL || "https://boogie-the-yo-yoz-merch.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const isConfigured =
  SHOPIFY_STORE_URL &&
  SHOPIFY_STOREFRONT_TOKEN &&
  SHOPIFY_STORE_URL !== "https://your-store.myshopify.com" &&
  SHOPIFY_STOREFRONT_TOKEN !== "your-token-here";

export const isShopifyConfigured = Boolean(isConfigured);
export { SHOPIFY_STORE_URL };

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

  const variants = (product.variants.nodes || []).map((v) => ({
    id: v.id,
    title: v.title,
    price: parseFloat(v.price?.amount || 0),
    available: (v.quantityAvailable ?? 0) > 0,
    size: v.selectedOptions?.find((o) => o.name.toLowerCase() === "size")?.value || null,
    color: v.selectedOptions?.find((o) => o.name.toLowerCase() === "color")?.value || null,
  }));

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
    variants,
  };
}

/**
 * Find the Shopify variant matching a cart item's size/color selection.
 * Falls back to the first variant when the product has no size/color options.
 */
export function findVariant(product, size, color) {
  const variants = product?.variants || [];
  if (variants.length === 0) return null;
  const match = variants.find(
    (v) =>
      (!v.size || !size || v.size.toLowerCase() === size.toLowerCase()) &&
      (!v.color || !color || v.color.toLowerCase() === color.toLowerCase())
  );
  return match || variants[0];
}

/**
 * Build a Shopify cart permalink so checkout (payment, shipping, taxes)
 * happens on Shopify. Returns null when the cart can't be fully resolved
 * to Shopify variants (e.g. custom/mock items) — callers should fall back
 * to the in-app flow in that case.
 */
export const resolveShopifyCheckoutUrl = async (cartItems) => {
  if (!isConfigured || !cartItems?.length) return null;

  const shopifyItems = cartItems.filter(
    (i) => typeof i.product_id === "string" && i.product_id.startsWith("gid://shopify/Product/")
  );
  if (shopifyItems.length !== cartItems.length) return null;

  const productIds = [...new Set(shopifyItems.map((i) => i.product_id))];
  const products = await Promise.all(productIds.map((id) => getProduct(id)));
  const byId = Object.fromEntries(productIds.map((id, idx) => [id, products[idx]]));

  const parts = [];
  for (const item of shopifyItems) {
    const product = byId[item.product_id];
    const variant = product ? findVariant(product, item.size, item.color) : null;
    if (!variant) return null;
    const numericId = variant.id.split("/").pop();
    parts.push(`${numericId}:${item.quantity || 1}`);
  }

  return `${SHOPIFY_STORE_URL}/cart/${parts.join(",")}`;
};

/**
 * Get all products, optionally filtered.
 * Drop-in replacement for getProducts() from supabase.js.
 */
export const getProducts = async (filters = {}) => {
  if (!isConfigured) {
    // Apply filters on the mock catalog dataset so filter options work in dev mode
    let products = [...MOCK_CUSTOM_PRODUCTS];

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
    console.error("Error fetching products:", error);
    return [];
  }
};

/**
 * Get a single product by ID.
 * Drop-in replacement for getProduct() from supabase.js.
 */
export const getProduct = async (id) => {
  if (!isConfigured) {
    return MOCK_CUSTOM_PRODUCTS.find((p) => p.id === id) || null;
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
    console.error("Error fetching product:", error);
    return null;
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
    console.error("Error fetching tour dates:", error);
    return [];
  }
};
