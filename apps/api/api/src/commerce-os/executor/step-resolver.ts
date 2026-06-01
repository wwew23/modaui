import { ActionPlanStep } from '../../../../os-sdk/src/protocol/action-plan';
import { PatchTransaction } from '../../theme-importer/runtime-core/patch';
import { ThemeActionLibrary } from '../../theme-importer/theme-actions';
import { ProductActionLibrary } from '../../product-runtime/product-actions';
import { CampaignActionLibrary } from '../../campaign-runtime/campaign-actions';
import { CoreProductActionLibrary } from '../../product-runtime/core-product-actions';
import { CoreCustomerActionLibrary } from '../../product-runtime/core-customer-actions';
import { CoreOrderActionLibrary } from '../../product-runtime/core-order-actions';

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
    private coreProductLibrary: CoreProductActionLibrary,
    private coreCustomerLibrary: CoreCustomerActionLibrary,
    private coreOrderLibrary: CoreOrderActionLibrary
  ) {}

  /**
   * resolve
   * 将 Action Step 转化为一个或多个 PatchTransaction
   */
  async resolve(step: ActionPlanStep): Promise<PatchTransaction[]> {
    const { domain, action, input } = step;

    console.log(`[StepResolver] Resolving: ${domain}.${action}`);

    try {
      switch (domain) {
        case 'theme':
        case 'shopify.theme':
          return await this.resolveThemeAction(action, input);

        case 'product':
        case 'shopify.product':
          return await this.resolveProductAction(action, input);

        case 'campaign':
        case 'shopify.campaign':
          return await this.resolveCampaignAction(action, input);

        case 'core.product':
          return await this.resolveCoreAction(this.coreProductLibrary, action, input, 'product');
        case 'core.customer':
          return await this.resolveCoreAction(this.coreCustomerLibrary, action, input, 'customer');
        case 'core.order':
          return await this.resolveCoreAction(this.coreOrderLibrary, action, input, 'order');

        case 'system':
          // system.noop 返回空数组，表示无需执行任何事务
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
   * resolveCoreAction
   * 通用的 Core 领域动作解析 (数据库操作)
   */
  private async resolveCoreAction(lib: any, action: string, input: any, domain: string): Promise<PatchTransaction[]> {
    if (typeof lib[action] !== 'function') {
      throw new Error(`Unknown ${domain} action: ${action}`);
    }

    try {
      const result = await lib[action](input);

      if (!result.success) {
        throw new Error(result.error || `${domain} action failed`);
      }

      // 数据库操作完成后，返回一个虚拟事务记录结果
      const tx: PatchTransaction = {
        id: `tx_core_${domain}_${Date.now()}`,
        actor: 'ai',
        description: `Core ${domain}: ${action}`,
        baseRevision: 0,
        patches: [
          {
            op: 'add',
            path: `/system/last_action`,
            value: { domain, action, result: result.result },
            scope: 'content'
          }
        ],
        timestamp: new Date().toISOString(),
        revision: Date.now()
      };

      return [tx];
    } catch (err: any) {
      throw new Error(`Core ${domain} action failed: ${action} - ${err.message}`);
    }
  }
}
