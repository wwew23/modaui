import { tokenStore } from './token-store';

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI || 'https://api.modaui.com/api/shopify/callback';
const SCOPES = 'read_products,write_products,read_themes,write_themes,read_discounts,write_discounts';

/**
 * Shopify OAuth Flow
 */
export const shopifyOAuth = {
  /**
   * 生成安装 URL
   */
  getInstallUrl(shop: string) {
    const state = Math.random().toString(36).substring(7);
    return `https://${shop}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${state}`;
  },

  /**
   * 处理回调并交换 Token
   */
  async handleCallback(shop: string, code: string) {
    const url = `https://${shop}/admin/oauth/access_token`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Shopify OAuth Error: ${error}`);
    }

    const data = await res.json() as { access_token: string; scope: string };
    tokenStore.set(shop, {
      accessToken: data.access_token,
      scope: data.scope,
    });

    return data;
  }
};
