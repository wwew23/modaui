const fs = require('fs');
const path = require('path');

const STORAGE_PATH = path.join(__dirname, '.shopify-tokens.json');

const shop = process.env.SHOPIFY_STORE || 'modaui-test-store.myshopify.com';
const token = process.env.SHOPIFY_ADMIN_TOKEN || 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const tokens = {
  [shop]: {
    accessToken: token,
    scope: 'write_products,write_themes,write_discounts,write_publications',
    timestamp: new Date().toISOString()
  }
};

fs.writeFileSync(STORAGE_PATH, JSON.stringify(tokens, null, 2));
console.log(`Token seeded for ${shop} at ${STORAGE_PATH}`);
