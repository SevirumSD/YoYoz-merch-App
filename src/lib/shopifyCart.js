import { isConfigured, shopifyFetch } from "./shopifyClient";

/**
 * Shopify Storefront Cart API integration.
 *
 * Replaces the Base44 CartItem entity so the whole purchase flow runs
 * through Shopify: cart lines live in a Shopify cart (persisted via
 * localStorage cart ID), and checkout redirects to the real Shopify
 * checkout URL where payment/shipping/taxes are handled.
 *
 * When Shopify isn't configured (local dev without .env), falls back to a
 * localStorage mock cart so the UI still works, and getCheckoutUrl()
 * returns null so callers can fall back to the in-app sandbox checkout.
 *
 * Items are returned in the same shape the UI already uses:
 *   { id, product_id, product_name, price, quantity, size, color, image_url }
 */

const CART_ID_KEY = "boogie_shopify_cart_id";
const MOCK_CART_KEY = "boogie_mock_cart";

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 100) {
    nodes {
      id
      quantity
      attributes { key value }
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount }
          image { url }
          selectedOptions { name value }
          product { id title featuredImage { url } }
        }
      }
    }
  }
`;

let cachedCart = null;

function lineToItem(line) {
  const m = line.merchandise;
  const opt = (name) =>
    m.selectedOptions?.find((o) => o.name.toLowerCase() === name)?.value || "";
  const custom = (line.attributes || [])
    .filter((a) => !a.key.startsWith("_"))
    .map((a) => `${a.key}: ${a.value}`)
    .join(", ");
  return {
    id: line.id,
    product_id: m.product?.id,
    product_name: m.product?.title + (custom ? ` (${custom})` : ""),
    price: parseFloat(m.price?.amount || 0),
    quantity: line.quantity,
    size: opt("size"),
    color: opt("color"),
    image_url: m.image?.url || m.product?.featuredImage?.url || "",
  };
}

async function fetchCart() {
  if (cachedCart) return cachedCart;
  const id = localStorage.getItem(CART_ID_KEY);
  if (id) {
    try {
      const d = await shopifyFetch(
        `query($id: ID!) { cart(id: $id) { ${CART_FRAGMENT} } }`,
        { id }
      );
      // A completed checkout or expired cart returns null — create fresh next time
      if (d.cart) {
        cachedCart = d.cart;
        return cachedCart;
      }
      localStorage.removeItem(CART_ID_KEY);
    } catch {
      localStorage.removeItem(CART_ID_KEY);
    }
  }
  return null;
}

async function createCart() {
  const d = await shopifyFetch(`mutation { cartCreate { cart { ${CART_FRAGMENT} } } }`);
  cachedCart = d.cartCreate.cart;
  localStorage.setItem(CART_ID_KEY, cachedCart.id);
  return cachedCart;
}

// ---------- mock-mode cart (Shopify not configured) ----------

function readMockCart() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeMockCart(items) {
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items));
}

// ---------- public API ----------

export async function listCartItems() {
  if (!isConfigured) return readMockCart();
  const cart = await fetchCart();
  return cart ? cart.lines.nodes.map(lineToItem) : [];
}

/**
 * Add a product to the cart. Resolves the Shopify variant from the chosen
 * size/color. `attributes` ([{key, value}]) are attached to the line and
 * show up on the Shopify order (used for custom-print details).
 */
export async function addToCart(
  product,
  { size = "", color = "", quantity = 1, attributes = [], displayName } = {}
) {
  if (!isConfigured || !product.variants?.length) {
    const items = readMockCart();
    items.push({
      id: "mock-line-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      product_id: product.id,
      product_name: displayName || product.name,
      price: product.price,
      quantity,
      size,
      color,
      image_url: product.image_url,
    });
    writeMockCart(items);
    return;
  }

  const matches = (v) =>
    (!v.size || !size || v.size === size) && (!v.color || !color || v.color === color);
  const variant =
    product.variants.find((v) => matches(v) && v.available) ||
    product.variants.find(matches) ||
    product.variants[0];

  const cart = (await fetchCart()) || (await createCart());
  const d = await shopifyFetch(
    `mutation($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
        userErrors { message }
      }
    }`,
    {
      cartId: cart.id,
      lines: [{ merchandiseId: variant.id, quantity, attributes }],
    }
  );
  const errs = d.cartLinesAdd.userErrors;
  if (errs?.length) throw new Error(errs[0].message);
  cachedCart = d.cartLinesAdd.cart;
}

export async function updateCartItem(lineId, quantity) {
  if (String(lineId).startsWith("mock-line-")) {
    writeMockCart(readMockCart().map((i) => (i.id === lineId ? { ...i, quantity } : i)));
    return;
  }
  const cart = await fetchCart();
  if (!cart) return;
  const d = await shopifyFetch(
    `mutation($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
        userErrors { message }
      }
    }`,
    { cartId: cart.id, lines: [{ id: lineId, quantity }] }
  );
  cachedCart = d.cartLinesUpdate.cart;
}

export async function removeCartItem(lineId) {
  if (String(lineId).startsWith("mock-line-")) {
    writeMockCart(readMockCart().filter((i) => i.id !== lineId));
    return;
  }
  const cart = await fetchCart();
  if (!cart) return;
  const d = await shopifyFetch(
    `mutation($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FRAGMENT} }
        userErrors { message }
      }
    }`,
    { cartId: cart.id, lineIds: [lineId] }
  );
  cachedCart = d.cartLinesRemove.cart;
}

/**
 * Real Shopify checkout URL for the current cart, or null in mock mode
 * (callers fall back to the in-app sandbox checkout page).
 */
export async function getCheckoutUrl() {
  if (!isConfigured) return null;
  const cart = await fetchCart();
  return cart?.checkoutUrl || null;
}
