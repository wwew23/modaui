import { ToolsRegistry } from '../../../web/runtime/tools';

export type DomainActionContext = {
  source: 'ai' | 'legacy-engine' | 'user';
};

export type DomainActionResult = {
  success: boolean;
  data?: any;
  error?: string;
};

/**
 * Domain Action Registry (Hardened v2)
 * 这是系统中最值钱的部分：将 legacy tools 映射为现代可调用的领域动作
 */
export const COMMERCE_ACTIONS: Record<
  string,
  { execute: (payload: any, ctx?: DomainActionContext) => Promise<DomainActionResult> }
> = {
  'products.update': ToolsRegistry['products.update'] as any,
  'theme.change': ToolsRegistry['theme.change'] as any,
  'campaign.launch': ToolsRegistry['campaign.launch'] as any,
  'orders.create': ToolsRegistry['orders.create'] as any,
  'orders.refund': ToolsRegistry['orders.refund'] as any,
};

/**
 * 判断是否为有效的商业领域动作
 */
export function isValidCommerceAction(type: string): boolean {
  return type in COMMERCE_ACTIONS;
}
