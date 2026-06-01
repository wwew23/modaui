import { Domain } from '../../../os-sdk/src/protocol/action-plan';

export type ActionSource = 'ai' | 'user' | 'legacy';

export type ActionPermissionRule = {
  domain: Domain;
  action: string;
  allowSources: ActionSource[];
};

export const ACTION_REGISTRY: Record<string, string[]> = {
  product: ['smartSortCollection', 'generateProductCopy'],
  theme: ['applyBrandProfile'],
  campaign: ['activateFlashSale'],
  agent: ['run'],
  system: ['noop'],
  'shopify.product': ['update', 'variants.bulkUpdate', 'tags.update', 'metafields.update', 'inventory.update', 'metaobject.upsert', 'bulk.run', 'delete', 'collection.create', 'collection.updateRules'],
  'shopify.theme': ['section.update', 'asset.update', 'asset.delete', 'publish', 'template.update'],
  'shopify.campaign': ['discount.create', 'automaticDiscount.create', 'publish.schedule', 'activate'],
  retail: ['transferInventory', 'closeStore', 'runPromotion', 'syncOrders']
};

const RULES: ActionPermissionRule[] = [
  { domain: 'product', action: 'smartSortCollection', allowSources: ['ai', 'user'] },
  { domain: 'product', action: 'generateProductCopy', allowSources: ['ai', 'user'] },
  { domain: 'theme', action: 'applyBrandProfile', allowSources: ['ai', 'user'] },
  { domain: 'campaign', action: 'activateFlashSale', allowSources: ['user'] },
  { domain: 'agent', action: 'run', allowSources: ['user', 'ai'] },
  { domain: 'system', action: 'noop', allowSources: ['ai', 'user', 'legacy'] },
  
  // Retail Runtime
  { domain: 'retail', action: 'transferInventory', allowSources: ['ai', 'user'] },
  { domain: 'retail', action: 'closeStore', allowSources: ['ai', 'user'] },
  { domain: 'retail', action: 'runPromotion', allowSources: ['ai', 'user'] },
  { domain: 'retail', action: 'syncOrders', allowSources: ['ai', 'user'] },

  // Shopify Theme
  { domain: 'shopify.theme', action: 'section.update', allowSources: ['ai', 'user'] },
  { domain: 'shopify.theme', action: 'asset.update', allowSources: ['user'] },
  { domain: 'shopify.theme', action: 'publish', allowSources: ['user'] },
  { domain: 'shopify.theme', action: 'template.update', allowSources: ['ai', 'user'] },

  // Shopify Product
  { domain: 'shopify.product', action: 'update', allowSources: ['ai', 'user'] },
  { domain: 'shopify.product', action: 'variants.bulkUpdate', allowSources: ['ai', 'user'] },
  { domain: 'shopify.product', action: 'tags.update', allowSources: ['ai', 'user'] },
  { domain: 'shopify.product', action: 'metafields.update', allowSources: ['ai', 'user'] },
  { domain: 'shopify.product', action: 'inventory.update', allowSources: ['user'] },
  { domain: 'shopify.product', action: 'metaobject.upsert', allowSources: ['ai', 'user'] },
  { domain: 'shopify.product', action: 'bulk.run', allowSources: ['user'] },

  // Shopify Campaign
  { domain: 'shopify.campaign', action: 'discount.create', allowSources: ['ai', 'user'] },
  { domain: 'shopify.campaign', action: 'automaticDiscount.create', allowSources: ['ai', 'user'] },
  { domain: 'shopify.campaign', action: 'publish.schedule', allowSources: ['ai', 'user'] },
  { domain: 'shopify.campaign', action: 'activate', allowSources: ['user'] }
];

const registry = new Map<string, ActionPermissionRule>();
RULES.forEach(r => registry.set(`${r.domain}:${r.action}`, r));

/**
 * allow
 * 动作执行前的权限检查入口
 */
export function allow(domain: string, action: string, source: ActionSource): boolean {
  const key = `${domain}:${action}`;
  const rule = registry.get(key);
  if (!rule) return false;
  return rule.allowSources.includes(source);
}
