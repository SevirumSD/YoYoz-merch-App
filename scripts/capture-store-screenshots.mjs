#!/usr/bin/env node
/**
 * Captures 8 Google Play-ready screenshots of the app.
 *
 * Run this on a machine with real internet access (your Mac) so the app
 * can actually load live product data from Shopify — this can't run inside
 * the sandboxed dev container, which has no outbound network access at all.
 *
 * Usage:
 *   npm run dev -- --port 5173 &   # start the dev server first
 *   node scripts/capture-store-screenshots.mjs
 *
 * Requires Playwright: npm install -D playwright  (one-time)
 *
 * Output: store-assets/screenshots/01-home.png ... 08-orders.png
 * Each is 1080x1920 (portrait, Play Store phone screenshot spec).
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "store-assets", "screenshots");
const BASE_URL = process.env.APP_URL || "http://localhost:5173";

mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  await sleep(600); // let animations/images settle
  await page.screenshot({ path: path.join(OUT_DIR, name) });
  console.log("Saved", name);
}

async function main() {
  const browser = await chromium.launch();
  // 540x960 viewport @ 2x device scale = 1080x1920 output (Play Store phone spec)
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });

  // 1. Home — hero
  await page.goto(BASE_URL + "/Home", { waitUntil: "networkidle" });
  await shot(page, "01-home-hero.png");

  // 2. Home — scroll to New Drops / Featured
  await page.mouse.wheel(0, 900);
  await shot(page, "02-home-new-drops.png");

  // 3. Home — scroll to Red & Black Collection promo
  await page.mouse.wheel(0, 900);
  await shot(page, "03-home-red-black-promo.png");

  // 4. Shop grid
  await page.goto(BASE_URL + "/Shop", { waitUntil: "networkidle" });
  await shot(page, "04-shop-grid.png");

  // 5. Shop — scrolled further into categories
  await page.mouse.wheel(0, 1000);
  await shot(page, "05-shop-categories.png");

  // 6. Product detail — click the first product card (reuse the already-
  // loaded Shop page instead of reloading, and wait generously since this
  // depends on the live Shopify product fetch completing)
  try {
    const firstProductLink = page.locator('a[href*="/ProductDetail"]').first();
    await firstProductLink.waitFor({ state: "visible", timeout: 45000 });
    await firstProductLink.click();
    await page.waitForLoadState("networkidle");
    await shot(page, "06-product-detail.png");

    // 7. Add to cart, then open the cart drawer
    const addButton = page.getByRole("button", { name: /add.*cart/i }).first();
    await addButton.click();
    await sleep(800);
    const cartButton = page.locator('button:has(svg.lucide-shopping-cart)').first();
    await cartButton.click();
    await shot(page, "07-cart-drawer.png");

    // 8. Checkout (populated, since we just added an item)
    const checkoutButton = page.getByRole("button", { name: /checkout/i }).first();
    await checkoutButton.click();
    await page.waitForLoadState("networkidle");
    await shot(page, "08-checkout.png");
  } catch (e) {
    console.error("\nCouldn't find a product to click through — dumping page state for diagnosis:");
    console.error("URL:", page.url());
    console.error("Title:", await page.title());
    console.error("Visible text (first 500 chars):", (await page.locator("body").innerText()).slice(0, 500));
    await page.screenshot({ path: path.join(OUT_DIR, "debug-shop-state.png") });
    console.error("Saved debug-shop-state.png for inspection. Screenshots 1-5 are still good to use.");
  }

  await browser.close();
  console.log("\nDone. Check", OUT_DIR);
}

main().catch((e) => {
  console.error("Screenshot capture failed:", e);
  process.exit(1);
});
