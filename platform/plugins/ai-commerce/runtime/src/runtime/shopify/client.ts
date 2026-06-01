import { tokenStore } from './token-store';

export interface ShopifyClient {
  <T = any>(query: string, variables?: any, targetShop?: string): Promise<T>;
  rest: <T = any>(path: string, options?: RequestInit, targetShop?: string) => Promise<T>;
}

/**
 * Shopify GraphQL Client
 * 负责与 Shopify Admin API 进行 GraphQL 通信
 */
export function createShopifyClient(shop?: string): ShopifyClient {
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-01';

  async function getHeaders(targetShop?: string) {
    const activeShop = targetShop || shop || process.env.SHOPIFY_STORE;
    if (!activeShop) throw new Error('[ShopifyClient] No shop provided');

    const tokenInfo = tokenStore.get(activeShop);
    const adminToken = tokenInfo?.accessToken || process.env.SHOPIFY_ADMIN_TOKEN;

    if (!adminToken) {
      throw new Error(`[ShopifyClient] No access token found for shop: ${activeShop}`);
    }

    return {
      activeShop,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      }
    };
  }

  const shopify: any = async function <T = any>(query: string, variables?: any, targetShop?: string): Promise<T> {
    const { activeShop, headers } = await getHeaders(targetShop);
    const endpoint = `https://${activeShop}/admin/api/${apiVersion}/graphql.json`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      });

      // Handle Rate Limiting (429)
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1') * 1000;
        console.warn(`[Shopify API] Rate limited. Retrying after ${retryAfter}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        attempts++;
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Shopify API HTTP Error: ${res.status} - ${errorText}`);
      }

      const body = await res.json() as { data: T; errors?: any[] };
      
      if (body.errors && body.errors.length > 0) {
        // Some GraphQL errors might be retryable, but usually they are logic errors
        console.error(`[Shopify API Error] [${activeShop}]`, JSON.stringify(body.errors, null, 2));
        throw new Error(`Shopify GraphQL Error: ${body.errors[0].message}`);
      }

      return body.data;
    }
    throw new Error(`[Shopify API] Max attempts reached for shop: ${activeShop}`);
  };

  // Add REST support
  shopify.rest = async function rest<T = any>(path: string, options: RequestInit = {}, targetShop?: string): Promise<T> {
    const { activeShop, headers } = await getHeaders(targetShop);
    const url = `https://${activeShop}/admin/api/${apiVersion}/${path.replace(/^\//, '')}`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1') * 1000;
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        attempts++;
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Shopify REST API Error: ${res.status} - ${errorText}`);
      }

      return await res.json() as T;
    }
    throw new Error(`[Shopify API REST] Max attempts reached for shop: ${activeShop}`);
  };

  return shopify as ShopifyClient;
}

export const shopify = createShopifyClient();
