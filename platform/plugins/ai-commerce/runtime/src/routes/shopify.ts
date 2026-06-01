import { Router } from 'express';
import { shopifyOAuth } from '../runtime/shopify/oauth';

const router = Router();

/**
 * GET /api/shopify/install
 * 启动 OAuth 安装流程
 */
router.get('/install', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter');
  
  const installUrl = shopifyOAuth.getInstallUrl(shop as string);
  res.redirect(installUrl);
});

/**
 * GET /api/shopify/callback
 * 处理 Shopify 回调
 */
router.get('/callback', async (req, res) => {
  const { shop, code } = req.query;
  
  if (!shop || !code) {
    return res.status(400).send('Missing shop or code parameter');
  }

  try {
    await shopifyOAuth.handleCallback(shop as string, code as string);
    // 成功后重定向到商家控制中心
    res.redirect(`http://app.modaui.com/dashboard?shop=${shop}`);
  } catch (e: any) {
    console.error('[Shopify OAuth Callback] Failed:', e);
    res.status(500).send(`Authentication failed: ${e.message}`);
  }
});

export default router;
