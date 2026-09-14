#!/usr/bin/env node

/**
 * Sync collection template from unpublished theme to live theme
 */

const STORE = "boogie-the-yo-yoz-merch.myshopify.com";
const API_VERSION = "2026-07";
const LIVE_THEME_NAME = "Boogie & The Yo-Yoz (app style)";

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET env vars first.");
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

async function listThemes() {
  const d = await adminGql(
    `query {
      themes(first: 10) {
        nodes { id name role }
      }
    }`
  );
  return d.themes.nodes;
}

async function upsertThemeFile(themeId, filename, content) {
  const d = await adminGql(
    `mutation($input: OnlineStoreThemeFileInput!) {
      themeFileCreate(input: $input) {
        themeFile { filename }
        userErrors { field message }
      }
    }`,
    {
      input: {
        themeId,
        filename,
        body: { value: content },
      },
    }
  );
  if (d.themeFileCreate.userErrors.length) {
    throw new Error(`File upsert failed: ${JSON.stringify(d.themeFileCreate.userErrors)}`);
  }
  return d.themeFileCreate.themeFile;
}

async function main() {
  console.log("🔍 Syncing collection template...\n");

  ADMIN_TOKEN = await getAdminToken();

  // List all themes
  const themes = await listThemes();
  console.log("📋 Available themes:");
  themes.forEach((t) => console.log(`  - ${t.name} (${t.role})`));

  // Find live theme
  const liveTheme = themes.find((t) => t.role === "MAIN");
  if (!liveTheme) throw new Error("No MAIN (live) theme found");
  console.log(`\n✅ Live theme: ${liveTheme.name} (ID: ${liveTheme.id})\n`);

  // Find unpublished theme (could be old or in-progress)
  const unpublishedThemes = themes.filter((t) => t.role === "UNPUBLISHED");
  if (!unpublishedThemes.length) {
    console.warn("⚠️  No unpublished themes found. Creating collection template in live theme...");
  }

  // Check unpublished themes for collection template
  let collectionTemplate = null;
  for (const theme of unpublishedThemes) {
    console.log(`🔍 Checking unpublished theme: ${theme.name}...`);
    const content = await themeFileText(theme.id, "templates/collection.boogie.liquid");
    if (content) {
      console.log(`✅ Found collection template in ${theme.name}`);
      collectionTemplate = content;
      break;
    }
  }

  if (!collectionTemplate) {
    console.log("❌ Collection template not found in any unpublished theme.");
    console.log("   Creating a basic collection template in the live theme...");

    // Create a basic collection template
    collectionTemplate = `<!-- Boogie & The Yo-Yoz Collection Template -->
{% section 'featured-collection' %}
  {% assign collection = collections[section.settings.collection] %}
  <div class="collection-hero">
    <h1>{{ collection.title }}</h1>
    <p>{{ collection.description }}</p>
  </div>
  <div class="products">
    {% for product in collection.products limit: 12 %}
      {% include 'product-card', product: product %}
    {% endfor %}
  </div>
{% endsection %}`;
  }

  // Push to live theme
  console.log(`\n📤 Pushing collection template to live theme...\n`);
  await upsertThemeFile(liveTheme.id, "templates/collection.boogie.liquid", collectionTemplate);
  console.log(`✅ Collection template synced to: ${liveTheme.name}`);
  console.log(`\n🎉 Done! Access at: https://${STORE}/admin/themes/${liveTheme.id.split("/").pop()}/editor`);
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
