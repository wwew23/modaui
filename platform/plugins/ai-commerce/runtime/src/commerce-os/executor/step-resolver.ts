import { ActionPlanStep } from '../../../../os-sdk/src/protocol/action-plan';
import { PatchTransaction } from '../../theme-importer/runtime-core/patch';
import { ThemeActionLibrary } from '../../theme-importer/theme-actions';
import { ProductActionLibrary } from '../../product-runtime/product-actions';
import { CampaignActionLibrary } from '../../campaign-runtime/campaign-actions';
import { RetailActionLibrary } from '../../runtime/retail/retail-actions';

/**
 * StepResolver
 * 业务动作到 PatchTransaction 的纯净映射
 * 职责：不含 UI 逻辑，只负责转换业务指令为原子事务
 */
export class StepResolver {
  constructor(
    private themeLibrary: ThemeActionLibrary,
    private productLibrary: ProductActionLibrary,
    private campaignLibrary: CampaignActionLibrary,
    private retailLibrary: RetailActionLibrary
  ) {}

  /**
   * resolve
   * 将 Action Step 转化为一个或多个 PatchTransaction
   */
  async resolve(step: ActionPlanStep): Promise<PatchTransaction[]> {
    const { domain, action, input } = step;

    console.log(`[StepResolver] Resolving: ${domain}.${action}`);

    try {
      // 1. 如果是 shopify.* 领域，直接生成真实 Transaction
      if (domain.startsWith('shopify.')) {
        return [{
          id: `tx_real_${Date.now()}`,
          actor: 'ai',
          description: `Shopify Action: ${domain}.${action}`,
          timestamp: new Date().toISOString(),
          revision: 0,
          baseRevision: 0,
          patches: [{
            op: 'replace',
            path: '/',
            value: input,
            actor: 'ai',
            description: `Apply ${domain}.${action}`
          }]
        }];
      }

      // 2. 否则走本地 Mock/Simulation 逻辑
      switch (domain) {
        case 'theme':
          return await this.resolveThemeAction(action, input);

        case 'product':
          return await this.resolveProductAction(action, input);

        case 'campaign':
          return await this.resolveCampaignAction(action, input);

        case 'retail':
          return await this.resolveRetailAction(action, input);

        case 'system':
          return [];

        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    } catch (err: any) {
      console.error(`[StepResolver] Resolution failed for ${domain}.${action}:`, err.message);
      throw err;
    }
  }

  /**
   * resolveThemeAction
   * Theme 领域的动作解析
   */
  private async resolveThemeAction(action: string, input: any): Promise<PatchTransaction[]> {
    const lib = this.themeLibrary as any;

    if (typeof lib[action] !== 'function') {
      throw new Error(`Unknown theme action: ${action}`);
    }

    try {
      // 调用 Theme Action Library，期望返回包含 transaction 的结果
      const result = await lib[action](input);

      if (!result) {
        console.warn(`[StepResolver] Theme action returned empty result: ${action}`);
        return [];
      }

      // 如果结果中包含 transaction，则返回
      if (result.transaction) {
        return [result.transaction as PatchTransaction];
      }

      // 如果结果中包含 patches，构建事务
      if (result.patches && Array.isArray(result.patches)) {
        const tx: PatchTransaction = {
          id: `tx_theme_${Date.now()}`,
          actor: 'ai',
          description: `Theme: ${action}`,
          baseRevision: result.baseRevision || 0,
          patches: result.patches,
          timestamp: new Date().toISOString(),
          revision: result.revision
        };
        return [tx];
      }

      console.warn(`[StepResolver] Theme action result without transaction: ${action}`, result);
      return [];
    } catch (err: any) {
      throw new Error(`Theme action execution failed: ${action} - ${err.message}`);
    }
  }

  /**
   * resolveProductAction
   * Product 领域的动作解析
   */
  private async resolveProductAction(action: string, input: any): Promise<PatchTransaction[]> {
    const lib = this.productLibrary as any;

    if (typeof lib[action] !== 'function') {
      throw new Error(`Unknown product action: ${action}`);
    }

    try {
      const result = await lib[action](input);

      if (!result) {
        console.warn(`[StepResolver] Product action returned empty result: ${action}`);
        return [];
      }

      if (result.transaction) {
        return [result.transaction as PatchTransaction];
      }

      if (result.patches && Array.isArray(result.patches)) {
        const tx: PatchTransaction = {
          id: `tx_product_${Date.now()}`,
          actor: 'ai',
          description: `Product: ${action}`,
          baseRevision: result.baseRevision || 0,
          patches: result.patches,
          timestamp: new Date().toISOString(),
          revision: result.revision
        };
        return [tx];
      }

      console.warn(`[StepResolver] Product action result without transaction: ${action}`, result);
      return [];
    } catch (err: any) {
      throw new Error(`Product action execution failed: ${action} - ${err.message}`);
    }
  }

  /**
   * resolveCampaignAction
   * Campaign 领域的动作解析
   */
  private async resolveCampaignAction(action: string, input: any): Promise<PatchTransaction[]> {
    const lib = this.campaignLibrary as any;

    if (typeof lib[action] !== 'function') {
      throw new Error(`Unknown campaign action: ${action}`);
    }

    try {
      const result = await lib[action](input);

      if (!result) {
        console.warn(`[StepResolver] Campaign action returned empty result: ${action}`);
        return [];
      }

      if (result.transaction) {
        return [result.transaction as PatchTransaction];
      }

      if (result.patches && Array.isArray(result.patches)) {
        const tx: PatchTransaction = {
          id: `tx_campaign_${Date.now()}`,
          actor: 'ai',
          description: `Campaign: ${action}`,
          baseRevision: result.baseRevision || 0,
          patches: result.patches,
          timestamp: new Date().toISOString(),
          revision: result.revision
        };
        return [tx];
      }

      console.warn(`[StepResolver] Campaign action result without transaction: ${action}`, result);
      return [];
    } catch (err: any) {
      throw new Error(`Campaign action execution failed: ${action} - ${err.message}`);
    }
  }

  /**
   * resolveRetailAction
   * Retail 领域的动作解析
   */
  private async resolveRetailAction(action: string, input: any): Promise<any[]> {
    const lib = this.retailLibrary as any;

    if (typeof lib[action] !== 'function') {
      throw new Error(`Unknown retail action: ${action}`);
    }

    try {
      const result = await lib[action](input);

      // 对于 Retail，目前直接返回真实执行结果作为 Transaction 记录
      return [{
        id: `tx_retail_${Date.now()}`,
        type: `retail.${action}`,
        payload: input,
        result: result,
        timestamp: new Date().toISOString()
      }];
    } catch (err: any) {
      throw new Error(`Retail action execution failed: ${action} - ${err.message}`);
    }
  }
}
