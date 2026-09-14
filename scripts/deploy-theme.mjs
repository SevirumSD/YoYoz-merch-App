/**
 * Deploy a dark, app-matching theme to the Shopify Online Store.
 *
 * Creates a new theme from Shopify's Dawn source, restyles it to match the
 * mobile app (near-black background, red #DC2626 accents, bold headlines),
 * builds a homepage (hero, New Drops, Limited Edition, Tour Gear, categories,
 * newsletter), then publishes it as the live theme.
 *
 * The homepage template is built ADAPTIVELY: after the theme is created, the
 * script reads each section's {% schema %} from the actual theme files and
 * only emits blocks/settings that the installed Dawn version defines, so it
 * keeps working across Dawn releases with different block layouts.
 *
 * Needs the same credentials as seed-shopify.mjs plus the read_themes and
 * write_themes scopes on the Boogie Merch Sync app.
 *
 * Usage:
 *   SHOPIFY_CLIENT_ID=xxx SHOPIFY_CLIENT_SECRET=shpss_xxx node scripts/deploy-theme.mjs
 */

const STORE = "boogie-the-yo-yoz-merch.myshopify.com";
const API_VERSION = "2026-07";
const THEME_NAME = "Boogie & The Yo-Yoz (app style)";

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET env vars first.");
  process.exit(1);
}

// Shopify's fetcher doesn't follow redirects, so github.com/.../archive URLs
// fail with "Src is empty"; codeload also intermittently rejects it. The CI
// workflow vendors the zip into this repo (DAWN_SOURCE_URL) which serves
// directly — the rest are fallbacks.
async function dawnZipCandidates() {
  const candidates = [];
  if (process.env.DAWN_SOURCE_URL) candidates.push(process.env.DAWN_SOURCE_URL);
  try {
    const r = await fetch("https://api.github.com/repos/Shopify/dawn/releases/latest", {
      headers: { "User-Agent": "boogie-theme-deploy", Accept: "application/vnd.github+json" },
    });
    const j = await r.json();
    if (j.tag_name) candidates.push(`https://codeload.github.com/Shopify/dawn/zip/refs/tags/${j.tag_name}`);
  } catch (e) {
    console.warn("Could not resolve latest Dawn release:", e.message);
  }
  candidates.push("https://codeload.github.com/Shopify/dawn/zip/refs/tags/v15.0.0"); // Shopify CLI's DEFAULT_THEME_ZIP
  candidates.push("https://cdn.shopify.com/theme-store/uhrdefhlndzaoyrgylhto59sx2i7.jpg"); // Shopify CLI's FALLBACK_THEME_ZIP (a Dawn zip)
  return candidates;
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

// ---------- theme file introspection ----------

async function themeFileText(themeId, filename) {
  const d = await adminGql(
    `query($id: ID!, $files: [String!]!) {
      theme(id: $id) {
        files(filenames: $files, first: 1) {
          nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } }
        }
      }
    }`,
    { id: themeId, files: [filename] }
  );
  return d.theme?.files?.nodes?.[0]?.body?.content ?? null;
}

function schemaOf(liquid) {
  const m = liquid?.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// Keep only settings the section/block schema actually defines.
function conform(settings, schemaSettings = []) {
  const ok = new Set((schemaSettings || []).map((s) => s.id).filter(Boolean));
  return Object.fromEntries(Object.entries(settings).filter(([k]) => ok.has(k)));
}

// Find a usable block definition in a section schema. Handles both inline
// block definitions and "@theme" blocks (defined in blocks/<type>.liquid).
async function resolveBlockDef(themeId, sectionSchema, typeCandidates) {
  const blocks = sectionSchema?.blocks || [];
  for (const t of typeCandidates) {
    const inline = blocks.find((b) => b.type === t);
    if (inline) return { type: inline.type, settings: inline.settings || [] };
  }
  if (blocks.some((b) => b.type === "@theme")) {
    for (const t of typeCandidates) {
      const sch = schemaOf(await themeFileText(themeId, `blocks/${t}.liquid`));
      if (sch) return { type: t, settings: sch.settings || [] };
    }
  }
  return null;
}

function headingBlockSettings(def, text, size) {
  const ids = new Set(def.settings.map((s) => s.id));
  const out = {};
  if (ids.has("heading")) out.heading = text;
  else if (ids.has("text")) out.text = text;
  if (ids.has("heading_size")) out.heading_size = size;
  return out;
}

function textBlockSettings(def, html) {
  const ids = new Set(def.settings.map((s) => s.id));
  if (ids.has("text")) return { text: html };
  if (ids.has("paragraph")) return { paragraph: html };
  return {};
}

function buttonBlockSettings(def, label, link) {
  const ids = new Set(def.settings.map((s) => s.id));
  if (ids.has("button_label_1")) {
    const out = { button_label_1: label, button_link_1: link };
    if (ids.has("button_style_secondary_1")) out.button_style_secondary_1 = false;
    return out;
  }
  if (ids.has("button_label")) {
    const out = { button_label: label, button_link: link };
    if (ids.has("button_style_secondary")) out.button_style_secondary = false;
    return out;
  }
  const out = {};
  if (ids.has("label")) out.label = label;
  if (ids.has("link")) out.link = link;
  return out;
}

// Build a rich-text section (hero/banner) that matches this Dawn's schema.
async function richTextSection(themeId, schema, { heading, text, buttonLabel, buttonLink, scheme, paddingY }) {
  const blocks = {};
  const blockOrder = [];

  const headingDef = await resolveBlockDef(themeId, schema, ["heading"]);
  if (headingDef) {
    blocks.heading = { type: headingDef.type, settings: headingBlockSettings(headingDef, heading, "h0") };
    blockOrder.push("heading");
  }
  const textDef = await resolveBlockDef(themeId, schema, ["text", "paragraph"]);
  if (textDef && text) {
    blocks.body = { type: textDef.type, settings: textBlockSettings(textDef, `<p>${text}</p>`) };
    blockOrder.push("body");
  }
  const buttonDef = await resolveBlockDef(themeId, schema, ["buttons", "button"]);
  if (buttonDef && buttonLabel) {
    blocks.cta = { type: buttonDef.type, settings: buttonBlockSettings(buttonDef, buttonLabel, buttonLink) };
    blockOrder.push("cta");
  }

  return {
    type: "rich-text",
    blocks,
    block_order: blockOrder,
    settings: conform(
      {
        desktop_content_position: "center",
        content_alignment: "center",
        color_scheme: scheme,
        full_width: true,
        padding_top: paddingY,
        padding_bottom: paddingY,
      },
      schema?.settings
    ),
  };
}

function featuredCollectionSection(schema, { title, collection, count, columns, scheme }) {
  return {
    type: "featured-collection",
    settings: conform(
      {
        title,
        heading_size: "h1",
        collection,
        products_to_show: count,
        columns_desktop: columns,
        color_scheme: scheme,
        show_view_all: true,
        image_ratio: "adapt",
        show_secondary_image: false,
        show_vendor: false,
      },
      schema?.settings
    ),
  };
}

// ---------- design constants (matches the mobile app) ----------

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
      "scheme-5": SCHEME("#0A0A0A", "#F5E1A4", "#D4AF37", "#000000"), // gold: limited edition tour gear
    },
    type_header_font: "oswald_n4",
    type_body_font: "assistant_n4",
    heading_scale: 150,
    body_scale: 100,
  },
};

// ---------- main ----------

console.log("Exchanging credentials for an Admin API token...");
ADMIN_TOKEN = await getAdminToken();
console.log("Token acquired.\n");

// Re-running should update the existing theme, not pile up duplicates
// (stores cap out around 20 themes).
const listData = await adminGql(`{ themes(first: 50) { nodes { id name role } } }`);
const existing = listData.themes.nodes.find((t) => t.name === THEME_NAME);

let themeId;
let alreadyLive = false;
if (existing && existing.role === "MAIN") {
  themeId = existing.id;
  alreadyLive = true;
  console.log(`Reusing live theme: ${themeId}`);
} else {
  if (existing) {
    // Unpublished leftover from a failed/partial earlier run — rebuild fresh.
    console.log(`Deleting stale unpublished theme ${existing.id}...`);
    const del = await adminGql(
      `mutation($id: ID!) { themeDelete(id: $id) { deletedThemeId userErrors { field message } } }`,
      { id: existing.id }
    );
    if (del.themeDelete.userErrors.length) {
      console.error("themeDelete failed:", JSON.stringify(del.themeDelete.userErrors));
      process.exit(1);
    }
  }
  const candidates = await dawnZipCandidates();
  for (const source of candidates) {
    console.log(`Creating theme from Dawn source (${source})...`);
    const createData = await adminGql(
      `mutation($source: URL!, $name: String!) {
        themeCreate(source: $source, name: $name) {
          theme { id name role }
          userErrors { field message }
        }
      }`,
      { source, name: THEME_NAME }
    );
    const createErrs = createData.themeCreate.userErrors;
    if (!createErrs.length) {
      themeId = createData.themeCreate.theme.id;
      break;
    }
    console.warn("themeCreate failed for this source:", JSON.stringify(createErrs));
    await sleep(1500);
  }
  if (!themeId) {
    console.error("All Dawn source URLs failed — see errors above.");
    process.exit(1);
  }
  console.log(`Theme created: ${themeId}`);

  // Wait for Shopify to finish ingesting the zip before we modify files.
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(4000);
    const d = await adminGql(
      `query($id: ID!) { theme(id: $id) { processing processingFailed } }`,
      { id: themeId }
    );
    if (d.theme?.processingFailed) {
      console.error("Theme processing failed — Shopify could not ingest the Dawn zip.");
      process.exit(1);
    }
    if (d.theme && !d.theme.processing) { ready = true; break; }
    console.log("  ...still processing");
  }
  if (!ready) {
    console.error("Timed out waiting for theme processing (2 minutes). Re-run the workflow to retry.");
    process.exit(1);
  }
}

console.log("Theme ready. Reading section schemas from the theme...\n");
const sectionSchemas = {};
for (const name of ["rich-text", "featured-collection", "collection-list", "newsletter"]) {
  sectionSchemas[name] = schemaOf(await themeFileText(themeId, `sections/${name}.liquid`));
  console.log(`  sections/${name}.liquid: ${sectionSchemas[name] ? "schema OK" : "MISSING — will skip"}`);
}

// ---------- build the homepage to match this Dawn's schemas ----------

const sections = {};
const order = [];

if (sectionSchemas["rich-text"]) {
  sections.hero = await richTextSection(themeId, sectionSchemas["rich-text"], {
    heading: "BOOGIE & THE YO-YOZ",
    text: "Official Merch Store — tour gear, custom drinkware, and fresh drops straight from the stage.",
    buttonLabel: "Shop Now",
    buttonLink: "shopify://collections/all",
    scheme: "scheme-2",
    paddingY: 100,
  });
  order.push("hero");
}

if (sectionSchemas["featured-collection"]) {
  sections.new_drops = featuredCollectionSection(sectionSchemas["featured-collection"], {
    title: "NEW DROPS",
    collection: "shirts",
    count: 4,
    columns: 4,
    scheme: "scheme-1",
  });
  order.push("new_drops");

  sections.limited_edition = featuredCollectionSection(sectionSchemas["featured-collection"], {
    title: "LIMITED EDITION — CAN YOU FEEL IT TOUR 2026",
    collection: "limited-edition-can-you-feel-it-tour-2026",
    count: 3,
    columns: 3,
    scheme: "scheme-5",
  });
  order.push("limited_edition");
}

if (sectionSchemas["rich-text"]) {
  sections.tour_banner = await richTextSection(themeId, sectionSchemas["rich-text"], {
    heading: "2026 WORLD TOUR",
    text: "Exclusive tour gear available now. Grab it before the next city sells out.",
    buttonLabel: "Tour Merch",
    buttonLink: "shopify://collections/hoodies",
    scheme: "scheme-3",
    paddingY: 64,
  });
  order.push("tour_banner");
}

if (sectionSchemas["featured-collection"]) {
  sections.tour_gear = featuredCollectionSection(sectionSchemas["featured-collection"], {
    title: "TOUR GEAR",
    collection: "hoodies",
    count: 4,
    columns: 4,
    scheme: "scheme-1",
  });
  order.push("tour_gear");
}

if (sectionSchemas["collection-list"]) {
  const clSchema = sectionSchemas["collection-list"];
  const collBlockDef = await resolveBlockDef(themeId, clSchema, ["featured_collection", "collection"]);
  if (collBlockDef) {
    const handles = ["shirts", "hoodies", "steel-tumblers", "wine-tumblers", "koozies", "accessories", "stickers", "limited-edition-can-you-feel-it-tour-2026"];
    const blocks = {};
    const blockOrder = [];
    handles.forEach((h, i) => {
      const key = `c${i + 1}`;
      blocks[key] = { type: collBlockDef.type, settings: conform({ collection: h }, collBlockDef.settings) };
      blockOrder.push(key);
    });
    sections.categories = {
      type: "collection-list",
      blocks,
      block_order: blockOrder,
      settings: conform(
        { title: "SHOP BY CATEGORY", heading_size: "h1", image_ratio: "square", columns_desktop: 4, color_scheme: "scheme-1" },
        clSchema.settings
      ),
    };
    order.push("categories");
  }
}

if (sectionSchemas["newsletter"]) {
  const nlSchema = sectionSchemas["newsletter"];
  const blocks = {};
  const blockOrder = [];
  const nlHeading = await resolveBlockDef(themeId, nlSchema, ["heading"]);
  if (nlHeading) {
    blocks.heading = { type: nlHeading.type, settings: headingBlockSettings(nlHeading, "JOIN THE CREW", "h1") };
    blockOrder.push("heading");
  }
  const nlPara = await resolveBlockDef(themeId, nlSchema, ["paragraph", "text"]);
  if (nlPara) {
    blocks.paragraph = { type: nlPara.type, settings: textBlockSettings(nlPara, "<p>Sign up for new drops, tour dates, and exclusive deals.</p>") };
    blockOrder.push("paragraph");
  }
  const nlForm = await resolveBlockDef(themeId, nlSchema, ["email_form", "form", "newsletter"]);
  if (nlForm) {
    blocks.form = { type: nlForm.type, settings: {} };
    blockOrder.push("form");
  }
  if (blockOrder.length) {
    sections.newsletter = {
      type: "newsletter",
      blocks,
      block_order: blockOrder,
      settings: conform({ color_scheme: "scheme-4", full_width: true }, nlSchema.settings),
    };
    order.push("newsletter");
  }
}

const INDEX_TEMPLATE = { sections, order };
console.log(`\nHomepage sections: ${order.join(", ")}`);

// ---------- apply and publish ----------

async function upsertFile(filename, value) {
  const d = await adminGql(
    `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) {
        upsertedThemeFiles { filename }
        userErrors { field message }
      }
    }`,
    { themeId, files: [{ filename, body: { type: "TEXT", value } }] }
  );
  const errs = d.themeFilesUpsert.userErrors;
  if (errs.length) {
    console.error(`Upsert of ${filename} failed:`, JSON.stringify(errs, null, 2));
    return false;
  }
  console.log(`  updated: ${filename}`);
  return true;
}

console.log("\nApplying app-style design...");
const okSettings = await upsertFile("config/settings_data.json", JSON.stringify(SETTINGS_DATA, null, 2));
const okIndex = await upsertFile("templates/index.json", JSON.stringify(INDEX_TEMPLATE, null, 2));
if (!okSettings || !okIndex) process.exit(1);

if (alreadyLive) {
  console.log("\nTheme is already the live design — files updated in place.");
} else {
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
}
console.log(`\nDone. View it at https://${STORE}`);
console.log("(If the store still has password protection, use the password from Shopify admin → Online Store → Preferences.)");
