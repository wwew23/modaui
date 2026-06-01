import { Router } from 'express';
import { shopifyIngress } from '../runtime/retail/shopify-ingress';
import { shopify } from '../runtime/shopify/client';
import crypto from 'crypto';

const router = Router();

function verifyShopifyHmac(req: any, secret: string) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
  const body = JSON.stringify(req.body);

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

/**
 * POST /api/shopify/webhooks
 * Shopify Webhook 接收端
 */
router.post('/webhooks', async (req, res) => {
  const topic = req.headers['x-shopify-topic'] as string;
  const shop = req.headers['x-shopify-shop-domain'] as string;
  const body = req.body;

  // 1. 验证签名 (生产环境开启)
  if (process.env.SHOPIFY_SECRET && !verifyShopifyHmac(req, process.env.SHOPIFY_SECRET)) {
    return res.status(401).send('Unauthorized');
  }

  console.log(`[Shopify Webhook] Received ${topic} from ${shop}`);

  try {
    // 2. 摄取数据到 Ingress Service (内含 DB 写入与 Stream 发送)
    // 异步执行，不阻塞 Shopify 响应
    shopifyIngress.handleWebhook(topic, shop, body).catch(err => {
      console.error(`[Shopify Ingress Error]`, err);
    });

    res.status(200).send('OK');
  } catch (err: any) {
    console.error(`[Shopify Webhook Error]`, err.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/shopify/webhooks/register
 * 手动注册 Webhooks (用于开发测试)
 */
router.get('/webhooks/register', async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop');

  const webhooks = [
    { topic: 'PRODUCTS_UPDATE', address: `https://api.modaui.com/api/shopify/webhooks` },
    { topic: 'THEMES_PUBLISH', address: `https://api.modaui.com/api/shopify/webhooks` },
    { topic: 'ORDERS_CREATE', address: `https://api.modaui.com/api/shopify/webhooks` },
  ];

  try {
    for (const hook of webhooks) {
      const query = `
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription { id }
            userErrors { field message }
          }
        }
      `;
      await shopify(query, {
        topic: hook.topic,
        webhookSubscription: {
          callbackUrl: hook.address,
          format: 'JSON'
        }
      }, shop as string);
    }
    res.json({ ok: true, registered: webhooks.length });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
