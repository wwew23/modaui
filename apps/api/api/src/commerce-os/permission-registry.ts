export type AgentType = 'marketing-agent' | 'theme-agent' | 'support-agent' | 'super-admin';

export interface Permission {
  domain: string;
  actions: string[]; // '*' for all
}

export const PERMISSION_REGISTRY: Record<AgentType, Permission[]> = {
  'marketing-agent': [
    { domain: 'campaign', actions: ['*'] },
    { domain: 'product', actions: ['tags.update', 'metafields.update'] },
    { domain: 'shopify.campaign', actions: ['*'] },
    { domain: 'shopify.product', actions: ['tags.update', 'metafields.update'] }
  ],
  'theme-agent': [
    { domain: 'theme', actions: ['*'] },
    { domain: 'shopify.theme', actions: ['*'] }
  ],
  'support-agent': [
    { domain: 'product', actions: ['read'] },
    { domain: 'order', actions: ['read'] },
    { domain: 'shopify.product', actions: ['read'] },
    { domain: 'shopify.order', actions: ['read'] }
  ],
  'super-admin': [
    { domain: '*', actions: ['*'] }
  ]
};

export function checkPermission(agent: AgentType, domain: string, action: string): boolean {
  const permissions = PERMISSION_REGISTRY[agent];
  if (!permissions) return false;

  return permissions.some(p => {
    const domainMatch = p.domain === '*' || p.domain === domain;
    const actionMatch = p.actions.includes('*') || p.actions.includes(action);
    return domainMatch && actionMatch;
  });
}
