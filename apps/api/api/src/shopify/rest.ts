/**
 * Shopify REST API Client
 */
export async function shopifyRest(endpoint: string, options: RequestInit = {}) {
  const shopifyStore = process.env.SHOPIFY_STORE;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-01';
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;

  const url = `https://${shopifyStore}/admin/api/${apiVersion}/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken!,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify REST error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json();
}
