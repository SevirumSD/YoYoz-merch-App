import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncShopifyProducts() {
  try {
    console.log('Fetching live products from Shopify (fks3je-k5.myshopify.com)...');
    const res = await fetch('https://fks3je-k5.myshopify.com/products.json?limit=250');
    if (!res.ok) {
      throw new Error(`Shopify responded with status: ${res.status}`);
    }
    const data = await res.json();
    const rawProducts = data.products || [];

    console.log(`Found ${rawProducts.length} live products on Shopify.`);

    // 1. Save full raw catalog with all variant IDs (needed for checkout)
    const rawCatalogPath = path.resolve(__dirname, '../src/data/live_shopify_catalog.json');
    fs.writeFileSync(rawCatalogPath, JSON.stringify(rawProducts, null, 2));

    // 2. Map products to app catalog format
    const products = rawProducts.map((p) => {
      const firstVariant = p.variants?.[0] || {};
      const price = parseFloat(firstVariant.price || 0);
      
      // Determine category from tags or product type
      let category = (p.product_type || "merch").toLowerCase();
      const tags = (p.tags || []).map(t => typeof t === 'string' ? t.toLowerCase() : '');
      const fullText = `${p.title} ${p.body_html || ''} ${tags.join(' ')}`.toLowerCase();

      if (tags.includes('hoodie') || tags.includes('hoodies') || fullText.includes('hoodie') || fullText.includes('sweatshirt')) {
        category = 'hoodies';
      } else if (tags.includes('v-neck') || tags.includes('vneck') || fullText.includes('v-neck')) {
        category = 'vnecks';
      } else if (tags.includes('tank') || tags.includes('tanks') || fullText.includes('tank') || fullText.includes('crop')) {
        category = 'tanks';
      } else if (tags.includes('tumbler') || tags.includes('tumblers') || fullText.includes('tumbler') || fullText.includes('drinkware')) {
        category = 'tumblers';
      } else if (tags.includes('beanie') || tags.includes('hat') || tags.includes('accessories') || fullText.includes('beanie')) {
        category = 'accessories';
      } else if (category === 'merch' || tags.includes('shirts') || fullText.includes('tee') || fullText.includes('shirt')) {
        category = 'shirts';
      }

      // Sizes and Colors from options
      const sizeOpt = p.options?.find(o => o.name.toLowerCase() === 'size');
      const colorOpt = p.options?.find(o => o.name.toLowerCase() === 'color');
      const sizes = sizeOpt ? sizeOpt.values : ["S", "M", "L", "XL", "2XL"];
      const colors = colorOpt ? colorOpt.values : ["Black", "White"];

      // Gender classification
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
        is_new: tags.includes('new') || tags.includes('new-drop'),
        is_featured: true,
        tour_exclusive: tags.includes('tour-exclusive') || tags.includes('tour'),
        isCustom: true
      };
    });

    // Save mapped catalog
    const mappedCatalogPath = path.resolve(__dirname, '../src/data/shopify_products.json');
    fs.writeFileSync(mappedCatalogPath, JSON.stringify(products, null, 2));

    console.log(`Successfully synced ${products.length} products to app catalog!`);
  } catch (err) {
    console.error('Error during Shopify product sync:', err.message);
  }
}

syncShopifyProducts();
