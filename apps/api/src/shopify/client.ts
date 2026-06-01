export function createShopifyAdminClient() {
  const shopifyStore = process.env.SHOPIFY_STORE;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!shopifyStore || !adminToken) {
    console.warn('Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN in environment variables');
  }

  const endpoint = `https://${shopifyStore}/admin/api/${apiVersion}/graphql.json`;

  return async function shopify<T = any>(query: string, variables?: any): Promise<{ data?: T; errors?: any }> {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken!
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Shopify API error: ${res.status} ${res.statusText} - ${errorText}`);
      }

      return res.json();
    } catch (error) {
      console.error('[Shopify Client] Request failed:', error);
      throw error;
    }
  };
}
