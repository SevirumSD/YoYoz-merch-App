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

const SHOPIFY_STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
// Shopify sunsets API versions ~12 months after release — keep this current
// (matches the Admin API version already used in scripts/deploy-theme.mjs).
const STOREFRONT_API_VERSION = "2026-07";

export const isConfigured =
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
export async function shopifyFetch(query, variables = {}) {
  if (!isConfigured) {
    throw new Error("[shopify] Not configured");
  }

  const res = await fetch(`${SHOPIFY_STORE_URL}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
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
 * Normalize Shopify's productType into the buckets the app's UI expects
 * (Shirts / Hoodies / Accessories). Printify assigns productType
 * inconsistently per blank (e.g. "Hoodie" vs "Hoodies", "Tank Top", "Mug"),
 * and the store's collections are overlapping/duplicated, so productType +
 * title keywords is the most reliable signal — far more so than picking
 * whichever collection a product happens to load first in. Hats and
 * drinkware both land in "Accessories" to match the nav's "Accessories &
 * Fan Gear" grouping (see normalizeStyle for the tumbler/cup sub-filter).
 */
function normalizeCategory(productType, title) {
  const type = (productType || "").toLowerCase();
  const t = (title || "").toLowerCase();
  if (/hoodie|sweatshirt|zip|pullover/.test(type) || /hoodie|sweatshirt|zip/.test(t)) return "Hoodies";
  if (/hat|cap|beanie|mug/.test(type) || /hat|cap|beanie|tumbler|koozie/.test(t)) return "Accessories";
  if (/shirt|tee|tank|v-neck/.test(type) || /shirt|tee|tank|v-neck/.test(t)) return "Shirts";
  return productType || "Merch";
}

/**
 * Derive gender from tags ("mens"/"womens") since these products don't have
 * a gender metafield set — matches the values used by CategoryBar/Layout nav
 * filters ("men" / "women" / "unisex").
 */
function normalizeGender(tags) {
  const hasMens = tags?.includes("mens");
  const hasWomens = tags?.includes("womens");
  if (hasMens && !hasWomens) return "men";
  if (hasWomens && !hasMens) return "women";
  return "unisex";
}

/**
 * Derive style from title keywords for the Hoodies submenu filters
 * (half-zip / quarter-zip) and the Accessories submenu filters
 * (tumbler / cup) since these aren't tagged or metafielded either.
 */
function normalizeStyle(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("v-neck")) return "v-neck";
  if (t.includes("half-zip")) return "half-zip";
  if (t.includes("quarter-zip") || t.includes("1/4-zip")) return "quarter-zip";
  if (t.includes("tumbler")) return "tumbler";
  if (t.includes("koozie")) return "cup";
  return "normal";
}

/**
 * Map Shopify product to the same shape as supabase.js getProducts.
 */
function mapShopifyProduct(product) {
  const variant = product.variants.nodes?.[0] || {};
  const category = normalizeCategory(product.productType, product.title);

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

  const variants = (product.variants.nodes || []).map((v) => ({
    id: v.id,
    available: v.availableForSale !== false,
    price: parseFloat(v.price?.amount || 0),
    size: v.selectedOptions?.find((o) => o.name.toLowerCase() === "size")?.value || null,
    color: v.selectedOptions?.find((o) => o.name.toLowerCase() === "color")?.value || null,
  }));

  return {
    id: product.id,
    name: product.title,
    variants,
    description: product.description || "",
    price: parseFloat(variant.price?.amount || 0),
    image_url: product.featuredImage?.url || "",
    category,
    dbCategory: category,
    dbGender: normalizeGender(product.tags),
    style: normalizeStyle(product.title),
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

  const query = `
    query GetProducts($first: Int!, $query: String) {
      products(first: $first, query: $query) {
        nodes {
          id
          title
          description
          handle
          tags
          productType
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
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
          metafields(identifiers: [
            { namespace: "custom", key: "featured" }
          ]) {
            key
            value
          }
        }
      }
    }
  `;

  try {
    // Category/gender/style are derived client-side from productType/title/tags
    // (see normalizeCategory/normalizeGender/normalizeStyle above) rather than
    // filtered server-side, since this store's collections overlap/duplicate
    // and its products don't carry gender/style metafields.
    const data = await shopifyFetch(query, { first: 250, query: "status:active" });

    let products = (data.products?.nodes || []).map(mapShopifyProduct);

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
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

/**
 * The manual "Limited Edition - CAN YOU FEEL IT 2026 Tour" collection,
 * repurposed as the Red & Black app-promo set (see getRedBlackCollection).
 */
export const RED_BLACK_COLLECTION_HANDLE = "limited-edition-can-you-feel-it-2026-tour";

/**
 * Get products from one specific, known collection by handle. Unlike
 * getProducts()'s category filter (which has to guess a product's "primary"
 * category across overlapping collections), this queries an explicit
 * collection directly — no ambiguity, since there's only one collection
 * being asked about.
 */
export const getCollectionProducts = async (handle) => {
  if (!isConfigured) return [];

  const query = `
    query GetCollectionProducts($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          nodes {
            id
            title
            description
            handle
            tags
            productType
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
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
            metafields(identifiers: [
              { namespace: "custom", key: "featured" }
            ]) {
              key
              value
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch(query, { handle, first: 50 });
    return (data.collection?.products?.nodes || []).map(mapShopifyProduct);
  } catch (error) {
    console.error("Error fetching collection products:", error);
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
        productType
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
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
        metafields(identifiers: [
          { namespace: "custom", key: "featured" }
        ]) {
          key
          value
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
