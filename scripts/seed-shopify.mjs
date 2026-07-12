/**
 * Seed the Shopify store with the app's product catalog.
 *
 * Runs on any machine with Node 18+ and direct internet access (NOT the
 * Claude cloud container — its egress policy blocks *.myshopify.com).
 *
 * Usage:
 *   SHOPIFY_CLIENT_ID=xxx SHOPIFY_CLIENT_SECRET=shpss_xxx node scripts/seed-shopify.mjs
 *
 * The client ID/secret come from the "Boogie Merch Sync" app in the Shopify
 * Dev Dashboard (dev.shopify.com). The app must already be installed on the
 * store with read/write products, inventory, and publications scopes —
 * this script exchanges the credentials for an Admin API token
 * (client-credentials grant), creates any catalog products that don't exist
 * yet (matched by title), groups them into collections, publishes everything
 * to every sales channel (Online Store + Headless), then verifies via the
 * public Storefront API that the app can actually see the products.
 */

const STORE = "boogie-the-yo-yoz-merch.myshopify.com";
const API_VERSION = "2026-07";
const STOREFRONT_PUBLIC_TOKEN = "b7cb14f653d51451c8a5e8e521d48510"; // public/client-side token, safe to embed

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET env vars first.");
  process.exit(1);
}

const IMG = {
  koozie: "https://images.unsplash.com/photo-1597075095401-4475517fa2b6?w=800&q=80",
  steelTumbler: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
  matteTumbler: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80",
  wineTumbler: "https://images.unsplash.com/photo-1575515321528-98e3b7b25203?w=800&q=80",
  hoodie: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
  neonTee: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  classicTee: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
  hat: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
  stickers: "https://images.unsplash.com/photo-1572375995501-4b0894d24330?w=800&q=80",
  wristband: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  jersey: "https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=800&q=80",
  poster: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=800&q=80",
  vinyl: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800&q=80",
};

const FIVE_COLORS = ["Black", "White", "Red", "Blue", "Pink"];
const APPAREL_SIZES = ["S", "M", "L", "XL", "XXL"];

const CATALOG = [
  { title: "Custom Concert Can Koozie", price: 10, collection: "Koozies", colors: ["Red", "Black", "White"], tags: ["new", "customizable"], gender: "unisex", style: "custom", image: IMG.koozie,
    desc: "Customize your official Boogie & the Yo-Yoz Can Koozie with your name or custom text. Keeps your drink ice-cold at the gig!" },
  { title: "Custom Engraved Steel Tumbler (20oz)", price: 35, collection: "Steel Tumblers", colors: FIVE_COLORS, tags: ["new", "tour-exclusive", "customizable"], gender: "unisex", style: "custom", image: IMG.steelTumbler,
    desc: "Double-walled stainless steel tumbler engraved with the Boogie & the Yo-Yoz official insignia. Custom laser-etched text option." },
  { title: "Custom Matte Black Tumbler (20oz)", price: 38, collection: "Steel Tumblers", colors: FIVE_COLORS, tags: ["new", "customizable"], gender: "unisex", style: "custom", image: IMG.matteTumbler,
    desc: "Premium double-wall vacuum insulated tumbler with high-contrast matte coating and laser-engraved band graphics." },
  { title: "Yo-Yoz Thermo Sports Bottle (18oz)", price: 30, collection: "Steel Tumblers", colors: FIVE_COLORS, tags: ["tour-exclusive", "customizable"], gender: "unisex", style: "custom", image: IMG.steelTumbler,
    desc: "Concert-proof stainless steel bottle with leakproof lid, laser-etched with Yo-Yoz flame insignia." },
  { title: "Custom Insulated Wine Tumbler (12oz)", price: 28, collection: "Wine Tumblers", colors: FIVE_COLORS, tags: ["tour-exclusive", "customizable"], gender: "unisex", style: "custom", image: IMG.wineTumbler,
    desc: "Premium insulated wine tumbler, perfect for concerts, festivals, or tailgates. Personalize with your custom concert quote." },
  { title: "Boogie Half-Zip Tech Hoodie", price: 65, collection: "Hoodies", sizes: APPAREL_SIZES, colors: FIVE_COLORS, tags: ["new"], gender: "men", style: "half-zip", image: IMG.hoodie,
    desc: "Premium tech fleece half-zip hoodie with reflective logo print." },
  { title: "Yo-Yoz Women's 3/4 Zip Pullover", price: 58, collection: "Hoodies", sizes: ["S", "M", "L", "XL"], colors: FIVE_COLORS, tags: ["tour-exclusive"], gender: "women", style: "3/4-zip", image: IMG.hoodie,
    desc: "Cozy 3/4 zip pullover hoodie with embroidered back design." },
  { title: "Yo-Yoz Laser-Engraved Tumbler", price: 32, collection: "Accessories", colors: FIVE_COLORS, tags: ["tour-exclusive"], gender: "unisex", style: "tumbler", image: IMG.steelTumbler,
    desc: "Stainless steel tumbler with double-wall insulation." },
  { title: "Boogie Double Layer Cup", price: 18, collection: "Accessories", colors: ["Clear", "Red", "Blue"], tags: ["new"], gender: "unisex", style: "cup", image: IMG.wineTumbler,
    desc: "Acrylic double-layer cup with liquid glitter and concert design." },
  { title: "Custom LED Concert Wristband", price: 12, collection: "Accessories", colors: ["White", "Blue", "Pink", "Green"], tags: ["new", "tour-exclusive", "customizable"], gender: "unisex", style: "wristband", image: IMG.wristband,
    desc: "Light-up concert wristband. Choose from White, Blue, Pink, or Green neon LED flash colors. Sound-activated options available." },
  { title: "Boogie Classic Logo Tee", price: 25, collection: "Shirts", sizes: APPAREL_SIZES, tags: [], gender: "unisex", image: IMG.classicTee,
    desc: "Official Boogie & The Yo-Yoz classic logo tee. Rock the gig in style." },
  { title: "Yo-Yoz World Tour Hoodie", price: 55, collection: "Hoodies", sizes: APPAREL_SIZES, tags: [], gender: "men", image: IMG.hoodie,
    desc: "Official Yo-Yoz World Tour hoodie. Heavyweight fleece, tour dates on the back." },
  { title: "BoogieMan Neon Concert Tee", price: 30, collection: "Shirts", sizes: APPAREL_SIZES, tags: ["new"], gender: "men", image: IMG.neonTee,
    desc: "BoogieMan neon graphic tee — glows under blacklight at the show." },
  { title: "Yo-Yoz Retro Trucker Hat", price: 20, collection: "Accessories", tags: [], gender: "unisex", image: IMG.hat,
    desc: "Retro mesh-back trucker hat with embroidered Yo-Yoz patch." },
  { title: "Boogie Sticker Pack (3-pack)", price: 8, collection: "Stickers", tags: [], gender: "unisex", image: IMG.stickers,
    desc: "Three die-cut vinyl stickers. Laptop, water bottle, guitar case — everywhere." },

  // ---- Original catalog from the first store-setup session (Main + Limited Edition) ----
  { title: "Classic Yo-Yoz T-Shirt", price: 24.99, collection: "Main Collection", sizes: ["XS", "S", "M", "L", "XL", "2XL"], colors: ["Black", "Red"],
    tags: [], gender: "unisex", vendor: "Boogie Main", skuPrefix: "YZ-TSHIRT", priceOverrides: { "2XL": 26.99 }, collectionType: "main", image: IMG.classicTee,
    desc: "Signature Yo-Yoz design in classic black and red." },
  { title: "Yo-Yoz Hoodie", price: 54.99, collection: "Main Collection", sizes: ["XS", "S", "M", "L", "XL", "2XL"], colors: ["Black", "Red"],
    tags: [], gender: "unisex", vendor: "Boogie Main", skuPrefix: "YZ-HOODIE", collectionType: "main", image: IMG.hoodie,
    desc: "Cozy hoodie with embroidered Yo-Yoz logo." },
  { title: "Yo-Yoz Cap", price: 29.99, collection: "Main Collection", colors: ["Black", "Red"],
    tags: [], gender: "unisex", vendor: "Boogie Main", skuPrefix: "YZ-CAP", collectionType: "main", image: IMG.hat,
    desc: "Classic snapback cap with woven Yo-Yoz patch." },
  { title: "Tour Jersey - Can You Feel It 2026", price: 39.99, collection: "Limited Edition - Can You Feel It Tour 2026", sizes: ["XS", "S", "M", "L", "XL", "2XL"], colors: ["Black", "Gold"],
    tags: ["tour-exclusive", "limited-edition"], gender: "unisex", vendor: "Boogie Limited", skuPrefix: "YZ-JERSEY", limited: true, collectionType: "limited", image: IMG.jersey,
    desc: "Exclusive tour jersey. Only available during the Can You Feel It Tour 2026." },
  { title: "Tour Poster - Signed", price: 24.99, collection: "Limited Edition - Can You Feel It Tour 2026", sizes: ["11x17", "18x24"],
    tags: ["tour-exclusive", "limited-edition"], gender: "unisex", vendor: "Boogie Limited", skuPrefix: "YZ-POSTER", priceOverrides: { "18x24": 34.99 }, limited: true, collectionType: "limited", image: IMG.poster,
    desc: "Limited edition tour poster hand-signed by the band." },
  { title: "Tour Vinyl - Limited Run", price: 34.99, collection: "Limited Edition - Can You Feel It Tour 2026", colors: ["Black", "Gold"],
    tags: ["tour-exclusive", "limited-edition"], gender: "unisex", vendor: "Boogie Limited", skuPrefix: "YZ-VINYL", priceOverrides: { "Gold": 39.99 }, limited: true, collectionType: "limited", image: IMG.vinyl,
    desc: "Exclusive tour vinyl pressing. 500 copies only." },
];

const COLOR_SKU_CODES = { Black: "BLK", White: "WHT", Red: "RED", Blue: "BLU", Pink: "PNK", Green: "GRN", Gold: "GLD", Clear: "CLR" };
const skuCode = (name) => COLOR_SKU_CODES[name] || name.toUpperCase();

// ---------- helpers ----------

async function getAdminToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "client_credentials" }),
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error("Token exchange failed:", JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data.access_token;
}

let ADMIN_TOKEN;
async function adminGql(query, variables = {}) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("GraphQL errors: " + JSON.stringify(json.errors));
  return json.data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureMetafieldDefinitions() {
  // Without a definition that grants the Storefront API read access, metafields
  // written below are invisible to the app (shopifyClient.js reads custom.gender/style/featured).
  const defs = [
    { name: "Gender", key: "gender" },
    { name: "Style", key: "style" },
    { name: "Featured", key: "featured" },
  ];
  for (const def of defs) {
    const d = await adminGql(
      `mutation($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id }
          userErrors { field message code }
        }
      }`,
      { definition: { ...def, namespace: "custom", type: "single_line_text_field", ownerType: "PRODUCT", access: { storefront: "PUBLIC_READ" } } }
    );
    const errs = d.metafieldDefinitionCreate.userErrors;
    if (errs.length && !errs.some((e) => e.code === "TAKEN")) console.error(`Metafield def ${def.key}:`, JSON.stringify(errs));
    await sleep(200);
  }
  console.log("Metafield definitions ensured (storefront-readable).");
}

function buildProductSetInput(item, locationId) {
  const options = [];
  if (item.sizes?.length) options.push({ name: "Size", position: options.length + 1, values: item.sizes.map((s) => ({ name: s })) });
  if (item.colors?.length) options.push({ name: "Color", position: options.length + 1, values: item.colors.map((c) => ({ name: c })) });

  const buildVariant = (optionValues) => {
    // Per-option-value price overrides (e.g. 2XL upcharge, larger poster size).
    let price = item.price;
    for (const v of optionValues) {
      if (item.priceOverrides?.[v.name] !== undefined) price = item.priceOverrides[v.name];
    }
    const variant = { optionValues, price: String(price) };
    if (item.skuPrefix) {
      const parts = [item.skuPrefix, ...optionValues.filter((v) => v.optionName !== "Title").map((v) => skuCode(v.name))];
      if (item.limited) parts.push("LTD");
      variant.sku = parts.join("-");
    }
    if (locationId) {
      variant.inventoryPolicy = "DENY";
      variant.inventoryItem = { tracked: true };
      variant.inventoryQuantities = [{ locationId, name: "available", quantity: 100 }];
    } else {
      variant.inventoryPolicy = "CONTINUE";
      variant.inventoryItem = { tracked: false };
    }
    return variant;
  };

  let variants;
  if (options.length === 0) {
    options.push({ name: "Title", position: 1, values: [{ name: "Default Title" }] });
    variants = [buildVariant([{ optionName: "Title", name: "Default Title" }])];
  } else {
    const axes = options.map((o) => o.values.map((v) => ({ optionName: o.name, name: v.name })));
    let combos = [[]];
    for (const axis of axes) combos = combos.flatMap((c) => axis.map((v) => [...c, v]));
    variants = combos.map(buildVariant);
  }

  const metafields = [{ namespace: "custom", key: "gender", value: item.gender || "unisex", type: "single_line_text_field" }];
  if (item.style) metafields.push({ namespace: "custom", key: "style", value: item.style, type: "single_line_text_field" });
  if (item.collectionType) metafields.push({ namespace: "custom", key: "collection_type", value: item.collectionType, type: "single_line_text_field" });

  const input = {
    title: item.title,
    descriptionHtml: `<p>${item.desc}</p>`,
    status: "ACTIVE",
    productType: item.collection,
    tags: item.tags,
    files: [{ originalSource: item.image, contentType: "IMAGE" }],
    productOptions: options,
    variants,
    metafields,
  };
  if (item.vendor) input.vendor = item.vendor;
  return input;
}

// ---------- main ----------

console.log("Exchanging credentials for an Admin API token...");
ADMIN_TOKEN = await getAdminToken();
console.log("Token acquired.\n");

const pubData = await adminGql(`{ publications(first: 25) { nodes { id name } } }`);
const publications = pubData.publications.nodes;
console.log("Sales channels found:", publications.map((p) => p.name).join(", "));
const pubInput = publications.map((p) => ({ publicationId: p.id }));

// Inventory needs the store's location ID (read_locations scope). If the app
// hasn't been granted that scope yet, fall back to creating products without
// tracked stock (sellable, "continue when out of stock") instead of dying.
let locationId = null;
try {
  const locData = await adminGql(`{ locations(first: 1) { nodes { id name } } }`);
  locationId = locData.locations.nodes[0].id;
  console.log("Inventory location:", locData.locations.nodes[0].name);
} catch (e) {
  console.warn("Could not read inventory location (missing read_locations scope?).");
  console.warn("Creating products WITHOUT tracked inventory — they'll still be purchasable.");
}

await ensureMetafieldDefinitions();

const existingData = await adminGql(`{ products(first: 100) { nodes { id title } } }`);
const existing = new Map(existingData.products.nodes.map((p) => [p.title.toLowerCase(), p.id]));
console.log(`Existing products in store: ${existing.size}\n`);

const collData = await adminGql(`{ collections(first: 50) { nodes { id title } } }`);
const collections = new Map(collData.collections.nodes.map((c) => [c.title.toLowerCase(), c.id]));
for (const title of new Set(CATALOG.map((i) => i.collection))) {
  if (!collections.has(title.toLowerCase())) {
    const d = await adminGql(
      `mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id title } userErrors { field message } } }`,
      { input: { title } }
    );
    const errs = d.collectionCreate.userErrors;
    if (errs.length) { console.error(`Collection "${title}":`, errs); continue; }
    collections.set(title.toLowerCase(), d.collectionCreate.collection.id);
    console.log(`Created collection: ${title}`);
  }
}

const productIdsByCollection = new Map();
const seededProductIds = [];
let created = 0, skipped = 0;

for (const item of CATALOG) {
  let productId = existing.get(item.title.toLowerCase());
  if (productId) {
    console.log(`= exists, will re-publish: ${item.title}`);
    skipped++;
  } else {
    const d = await adminGql(
      `mutation($input: ProductSetInput!) { productSet(input: $input) { product { id title } userErrors { field message } } }`,
      { input: buildProductSetInput(item, locationId) }
    );
    const errs = d.productSet.userErrors;
    if (errs.length) { console.error(`FAILED ${item.title}:`, JSON.stringify(errs)); continue; }
    productId = d.productSet.product.id;
    console.log(`+ created: ${item.title} ($${item.price})`);
    created++;
    await sleep(500);
  }
  seededProductIds.push(productId);
  const collId = collections.get(item.collection.toLowerCase());
  if (collId) {
    if (!productIdsByCollection.has(collId)) productIdsByCollection.set(collId, []);
    productIdsByCollection.get(collId).push(productId);
  }
}

console.log("\nAdding products to collections...");
for (const [collId, ids] of productIdsByCollection) {
  const d = await adminGql(
    `mutation($id: ID!, $productIds: [ID!]!) { collectionAddProducts(id: $id, productIds: $productIds) { userErrors { field message } } }`,
    { id: collId, productIds: ids }
  );
  const errs = d.collectionAddProducts.userErrors;
  if (errs.length && !JSON.stringify(errs).includes("already")) console.error("Collection add:", JSON.stringify(errs));
  await sleep(300);
}

console.log("Publishing seeded products and their collections to all sales channels...");
const publishTargets = [
  ...seededProductIds,
  ...productIdsByCollection.keys(),
];
for (const id of publishTargets) {
  const d = await adminGql(
    `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
    { id, input: pubInput }
  );
  const errs = d.publishablePublish.userErrors;
  if (errs.length && !JSON.stringify(errs).includes("already")) console.error(`Publish ${id}:`, JSON.stringify(errs));
  await sleep(250);
}

console.log(`\nDone. Created ${created}, already existed ${skipped}.`);

console.log("\nVerifying via public Storefront API (what the app itself sees)...");
const sfRes = await fetch(`https://${STORE}/api/${API_VERSION}/graphql.json`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": STOREFRONT_PUBLIC_TOKEN },
  body: JSON.stringify({ query: `{ products(first: 100) { nodes { title variants(first: 1) { nodes { price { amount } } } } } }` }),
});
const sf = await sfRes.json();
const nodes = sf.data?.products?.nodes || [];
console.log(`Storefront API now returns ${nodes.length} products:`);
for (const p of nodes) console.log(`  - ${p.title} ($${p.variants.nodes[0]?.price.amount})`);
if (nodes.length === 0) console.log("  (none — check that products are published to the Headless channel)");
