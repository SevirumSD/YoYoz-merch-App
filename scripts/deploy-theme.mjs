/**
 * Deploy a dark, app-matching theme to the Shopify Online Store.
 *
 * Creates a new theme from Shopify's Dawn source, restyles it to match the
 * mobile app (near-black background, red #DC2626 accents, bold headlines),
 * builds a homepage (hero, New Drops, Tour Gear, categories, newsletter),
 * then publishes it as the live theme.
 *
 * Needs the same credentials as seed-shopify.mjs plus the read_themes and
 * write_themes scopes on the Boogie Merch Sync app.
 *
 * Usage:
 *   SHOPIFY_CLIENT_ID=xxx SHOPIFY_CLIENT_SECRET=shpss_xxx node scripts/deploy-theme.mjs
 */

const STORE = "boogie-the-yo-yoz-merch.myshopify.com";
const API_VERSION = "2026-07";
const DAWN_ZIP = "https://github.com/Shopify/dawn/archive/refs/heads/main.zip";
const THEME_NAME = "Boogie & The Yo-Yoz (app style)";

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET env vars first.");
  process.exit(1);
}

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

// ---------- theme file overlays (the app-matching design) ----------

// Color schemes: scheme-1 = main near-black, scheme-2 = pure black (hero/header),
// scheme-3 = red banner, scheme-4 = zinc card, scheme-5 = light (unused fallback).
const SCHEME = (background, text, button, buttonLabel) => ({
  settings: {
    background,
    background_gradient: "",
    text,
    button,
    button_label: buttonLabel,
    secondary_button_label: text,
    shadow: "#000000",
  },
});

const SETTINGS_DATA = {
  current: {
    color_schemes: {
      "scheme-1": SCHEME("#0A0A0A", "#FFFFFF", "#DC2626", "#FFFFFF"),
      "scheme-2": SCHEME("#000000", "#FFFFFF", "#DC2626", "#FFFFFF"),
      "scheme-3": SCHEME("#DC2626", "#FFFFFF", "#000000", "#FFFFFF"),
      "scheme-4": SCHEME("#18181B", "#FFFFFF", "#DC2626", "#FFFFFF"),
      "scheme-5": SCHEME("#FFFFFF", "#0A0A0A", "#DC2626", "#FFFFFF"),
    },
    type_header_font: "oswald_n4",
    type_body_font: "assistant_n4",
    heading_scale: 150,
    body_scale: 100,
  },
};

const INDEX_TEMPLATE = {
  sections: {
    hero: {
      type: "rich-text",
      blocks: {
        heading: { type: "heading", settings: { heading: "BOOGIE & THE YO-YOZ", heading_size: "h0" } },
        text: { type: "text", settings: { text: "<p>Official Merch Store — tour gear, custom drinkware, and fresh drops straight from the stage.</p>" } },
        button: {
          type: "buttons",
          settings: {
            button_label_1: "Shop Now",
            button_link_1: "shopify://collections/all",
            button_style_secondary_1: false,
            button_label_2: "",
            button_link_2: "",
            button_style_secondary_2: false,
          },
        },
      },
      block_order: ["heading", "text", "button"],
      settings: {
        desktop_content_position: "center",
        content_alignment: "center",
        color_scheme: "scheme-2",
        full_width: true,
        padding_top: 104,
        padding_bottom: 104,
      },
    },
    new_drops: {
      type: "featured-collection",
      settings: {
        title: "NEW DROPS",
        heading_size: "h1",
        collection: "shirts",
        products_to_show: 4,
        columns_desktop: 4,
        color_scheme: "scheme-1",
        show_view_all: true,
        image_ratio: "adapt",
        show_secondary_image: false,
        show_vendor: false,
      },
    },
    tour_banner: {
      type: "rich-text",
      blocks: {
        heading: { type: "heading", settings: { heading: "2026 WORLD TOUR", heading_size: "h1" } },
        text: { type: "text", settings: { text: "<p>Exclusive tour gear available now. Grab it before the next city sells out.</p>" } },
        button: {
          type: "buttons",
          settings: {
            button_label_1: "Tour Merch",
            button_link_1: "shopify://collections/hoodies",
            button_style_secondary_1: false,
            button_label_2: "",
            button_link_2: "",
            button_style_secondary_2: false,
          },
        },
      },
      block_order: ["heading", "text", "button"],
      settings: {
        desktop_content_position: "center",
        content_alignment: "center",
        color_scheme: "scheme-3",
        full_width: true,
        padding_top: 64,
        padding_bottom: 64,
      },
    },
    tour_gear: {
      type: "featured-collection",
      settings: {
        title: "TOUR GEAR",
        heading_size: "h1",
        collection: "hoodies",
        products_to_show: 4,
        columns_desktop: 4,
        color_scheme: "scheme-1",
        show_view_all: true,
        image_ratio: "adapt",
        show_secondary_image: false,
        show_vendor: false,
      },
    },
    categories: {
      type: "collection-list",
      blocks: {
        c1: { type: "featured_collection", settings: { collection: "shirts" } },
        c2: { type: "featured_collection", settings: { collection: "hoodies" } },
        c3: { type: "featured_collection", settings: { collection: "steel-tumblers" } },
        c4: { type: "featured_collection", settings: { collection: "wine-tumblers" } },
        c5: { type: "featured_collection", settings: { collection: "koozies" } },
        c6: { type: "featured_collection", settings: { collection: "accessories" } },
        c7: { type: "featured_collection", settings: { collection: "stickers" } },
      },
      block_order: ["c1", "c2", "c3", "c4", "c5", "c6", "c7"],
      settings: {
        title: "SHOP BY CATEGORY",
        heading_size: "h1",
        image_ratio: "square",
        columns_desktop: 4,
        color_scheme: "scheme-1",
      },
    },
    newsletter: {
      type: "newsletter",
      blocks: {
        heading: { type: "heading", settings: { heading: "JOIN THE CREW" } },
        paragraph: { type: "paragraph", settings: { paragraph: "<p>Sign up for new drops, tour dates, and exclusive deals.</p>" } },
        form: { type: "email_form", settings: {} },
      },
      block_order: ["heading", "paragraph", "form"],
      settings: { color_scheme: "scheme-4", full_width: true },
    },
  },
  order: ["hero", "new_drops", "tour_banner", "tour_gear", "categories", "newsletter"],
};

// ---------- main ----------

console.log("Exchanging credentials for an Admin API token...");
ADMIN_TOKEN = await getAdminToken();
console.log("Token acquired.\n");

console.log("Creating theme from Dawn source (this takes a minute)...");
const createData = await adminGql(
  `mutation($source: URL!, $name: String!) {
    themeCreate(source: $source, name: $name) {
      theme { id name role processing }
      userErrors { field message }
    }
  }`,
  { source: DAWN_ZIP, name: THEME_NAME }
);
const createErrs = createData.themeCreate.userErrors;
if (createErrs.length) {
  console.error("themeCreate failed:", JSON.stringify(createErrs, null, 2));
  process.exit(1);
}
const themeId = createData.themeCreate.theme.id;
console.log(`Theme created: ${themeId} (${createData.themeCreate.theme.name})`);

// Wait for Shopify to finish ingesting the zip before we modify files.
for (let i = 0; i < 30; i++) {
  await sleep(4000);
  const d = await adminGql(`query($id: ID!) { theme(id: $id) { processing } }`, { id: themeId });
  if (!d.theme.processing) break;
  console.log("  ...still processing");
}
console.log("Theme ready. Applying app-style design...\n");

const files = [
  { filename: "config/settings_data.json", body: { type: "TEXT", value: JSON.stringify(SETTINGS_DATA, null, 2) } },
  { filename: "templates/index.json", body: { type: "TEXT", value: JSON.stringify(INDEX_TEMPLATE, null, 2) } },
];
const upsertData = await adminGql(
  `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
    themeFilesUpsert(themeId: $themeId, files: $files) {
      upsertedThemeFiles { filename }
      userErrors { field message }
    }
  }`,
  { themeId, files }
);
const upsertErrs = upsertData.themeFilesUpsert.userErrors;
if (upsertErrs.length) {
  console.error("themeFilesUpsert failed:", JSON.stringify(upsertErrs, null, 2));
  process.exit(1);
}
for (const f of upsertData.themeFilesUpsert.upsertedThemeFiles) console.log(`  updated: ${f.filename}`);

console.log("\nPublishing theme (making it the live design)...");
const pubData = await adminGql(
  `mutation($id: ID!) {
    themePublish(id: $id) { theme { id name role } userErrors { field message } }
  }`,
  { id: themeId }
);
const pubErrs = pubData.themePublish.userErrors;
if (pubErrs.length) {
  console.error("themePublish failed:", JSON.stringify(pubErrs, null, 2));
  process.exit(1);
}
console.log(`Live theme is now: ${pubData.themePublish.theme.name} (${pubData.themePublish.theme.role})`);
console.log(`\nDone. View it at https://${STORE}`);
console.log("(If the store still has password protection, use the password from Shopify admin → Online Store → Preferences.)");
