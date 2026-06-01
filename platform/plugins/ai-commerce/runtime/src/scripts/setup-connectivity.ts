import { prisma } from '../lib/prisma';
import { createShopifyClient } from '../runtime/shopify/client';

/**
 * CommerceOS Connectivity Script
 * 职责：一键打通 Shopify + OS + UI 自动检测并注册 Webhooks
 */
async function setupConnectivity() {
  console.log('🚀 Starting CommerceOS Connectivity Setup...');

  const shop = process.env.SHOPIFY_STORE || process.env.SHOPIFY_SHOP;
  const token = process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_TOKEN;
  const domain = process.env.APP_DOMAIN || 'api.modaui.com';

  if (!shop || !token) {
    console.error('❌ Missing Shopify configuration (SHOPIFY_STORE, SHOPIFY_ADMIN_TOKEN)');
    process.exit(1);
  }

  const client = createShopifyClient(shop);

  // 1. 验证 Shopify 连接
  console.log(`[1/3] Verifying connection to ${shop}...`);
  try {
    const shopData = await client(`{ shop { name email } }`);
    console.log(`✅ Connected to Shopify: ${shopData.shop.name} (${shopData.shop.email})`);
  } catch (err: any) {
    console.error(`❌ Shopify connection failed: ${err.message}`);
    process.exit(1);
  }

  // 2. 检查数据库中是否存在对应商户，不存在则创建
  console.log(`[2/3] Syncing merchant record in DB...`);
  try {
    const merchant = await prisma.merchant.upsert({
      where: { shopDomain: shop },
      update: { status: 'active' },
      create: {
        name: shop.split('.')[0],
        merchantName: 'Auto Configured Owner',
        shopDomain: shop,
        plan: 'Enterprise',
        status: 'active',
        tenantId: `tenant_${Math.random().toString(36).substring(7)}`,
        apiKey: `os_${Math.random().toString(36).substring(2)}`
      }
    });
    console.log(`✅ Merchant record synchronized: ${merchant.id}`);
  } catch (err: any) {
    console.error(`❌ DB Sync failed: ${err.message}`);
  }

  // 3. 自动注册 Webhooks
  console.log(`[3/3] Registering Webhooks for ${domain}...`);
  const topics = [
    { topic: 'ORDERS_CREATE', address: `https://${domain}/api/shopify/webhooks` },
    { topic: 'ORDERS_UPDATED', address: `https://${domain}/api/shopify/webhooks` },
    { topic: 'PRODUCTS_CREATE', address: `https://${domain}/api/shopify/webhooks` },
    { topic: 'PRODUCTS_UPDATE', address: `https://${domain}/api/shopify/webhooks` }
  ];

  for (const hook of topics) {
    try {
      const mutation = `
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription { id }
            userErrors { field message }
          }
        }
      `;
      const result = await client(mutation, {
        topic: hook.topic,
        webhookSubscription: {
          callbackUrl: hook.address,
          format: 'JSON'
        }
      });

      if (result.webhookSubscriptionCreate.userErrors.length > 0) {
        const msg = result.webhookSubscriptionCreate.userErrors[0].message;
        if (msg.includes('already exists')) {
          console.log(`ℹ️ Webhook ${hook.topic} already registered.`);
        } else {
          console.warn(`⚠️ Webhook ${hook.topic} warning: ${msg}`);
        }
      } else {
        console.log(`✅ Webhook ${hook.topic} registered successfully.`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to register ${hook.topic}: ${err.message}`);
    }
  }

  console.log('🎉 Connectivity setup complete! System is now LIVE.');
  process.exit(0);
}

setupConnectivity();
