import { RuntimeStore } from '../../theme-importer/runtime-core/store';
import { PatchTransaction } from '../../theme-importer/runtime-core/patch';
import { eventStream } from './event-stream';
import { ShopifyRuntimeFactory } from '../../runtime/shopify-runtime-factory';

/**
 * TransactionApplier
 * Kernel 级事务执行与事件广播
 * 职责：原子性应用 PatchTransaction，确保状态一致性
 */
export class TransactionApplier {
  private shopifyThemeRuntime = ShopifyRuntimeFactory.create('theme');
  private shopifyProductRuntime = ShopifyRuntimeFactory.create('product');
  private shopifyCampaignRuntime = ShopifyRuntimeFactory.create('campaign');

  constructor(
    private themeStore: RuntimeStore,
    private productStore: RuntimeStore,
    private campaignStore: RuntimeStore
  ) {}

  /**
   * apply
   * 将 PatchTransaction 原子应用到指定的 Domain Store
   * 规则：validate -> apply -> emit，失败 -> throw
   */
  async apply(domain: 'theme' | 'product' | 'campaign' | 'marketing' | 'shopify.theme' | 'shopify.product' | 'shopify.campaign' | 'shopify.marketing', tx: PatchTransaction) {
    console.log(`[TransactionApplier] Applying transaction for domain=${domain}, txId=${tx.id}`);

    try {
      // 1. 验证事务
      if (!tx.id || !tx.patches) {
        throw new Error('Invalid transaction: missing id or patches');
      }

      let res: any;

      if (domain.startsWith('shopify.')) {
        const shopifyDomain = domain.split('.')[1] as 'theme' | 'product' | 'campaign' | 'marketing';
        const runtime = this.getShopifyRuntime(shopifyDomain);
        
        // 1. 真执行到 Shopify
        res = await runtime.applyTransaction(tx as any);
        res = { success: !res.errors || res.errors.length === 0, ...res };

        // 2. 联动更新本地 Runtime Store (如果成功)
        if (res.success && shopifyDomain !== 'marketing') {
          try {
            await this.syncToLocalStore(shopifyDomain, tx);
          } catch (syncErr) {
            console.warn(`[TransactionApplier] Sync to local store failed (non-blocking):`, syncErr);
          }
        }
      } else {
        const store = this.getStore(domain as 'theme' | 'product' | 'campaign');
        res = await store.applyTransaction(tx);
      }

      // 3. 验证应用结果
      if (!res.success) {
        const errorMsg = res.errors?.join('; ') || 'Unknown error';
        console.error(
          `[TransactionApplier] Transaction application failed for domain=${domain}, txId=${tx.id}:`,
          errorMsg
        );

        eventStream.emit('tx.failed', {
          domain,
          txId: tx.id,
          errors: res.errors,
          timestamp: new Date().toISOString()
        });

        throw new Error(`Transaction failed on ${domain}: ${errorMsg}`);
      }

      // 4. 获取最新的修订号
      const revision = res.transaction?.revision;

      // 5. 广播成功事件
      if (domain.startsWith('shopify.')) {
        this.emitShopifyEvent(domain as any, tx);
      } else {
        eventStream.emit('tx.applied', {
          domain,
          txId: tx.id,
          revision,
          patches: tx.patches,
          actor: tx.actor,
          description: tx.description,
          timestamp: new Date().toISOString()
        });
      }

      console.log(
        `[TransactionApplier] Transaction applied successfully: domain=${domain}, txId=${tx.id}, revision=${revision}`
      );

      return res;
    } catch (err: any) {
      console.error(
        `[TransactionApplier] Error applying transaction for domain=${domain}, txId=${tx.id}:`,
        err.message
      );

      eventStream.emit('tx.failed', {
        domain,
        txId: tx.id,
        error: err.message,
        timestamp: new Date().toISOString()
      });

      throw err;
    }
  }

  /**
   * applyBatch
   * 按顺序原子应用多个事务
   * 任何一个失败都会导致整体失败（由 Executor 负责回滚）
   */
  async applyBatch(
    transactions: Array<{
      domain:
        | 'theme'
        | 'product'
        | 'campaign'
        | 'shopify.theme'
        | 'shopify.product'
        | 'shopify.campaign';
      tx: PatchTransaction;
    }>
  ) {
    console.log(`[TransactionApplier] Applying batch of ${transactions.length} transactions`);

    const results = [];

    try {
      for (const { domain, tx } of transactions) {
        const res = await this.apply(domain, tx);
        results.push(res);
      }

      return { success: true, results };
    } catch (err: any) {
      console.error(`[TransactionApplier] Batch application failed:`, err.message);
      throw err;
    }
  }

  /**
   * syncToLocalStore
   * 将 Shopify 的变更同步回本地 OS Runtime Store，保持状态一致性
   */
  private async syncToLocalStore(domain: 'theme' | 'product' | 'campaign', tx: any) {
    const store = this.getStore(domain);
    const patches: any[] = [];

    // 基础映射逻辑
    if (domain === 'product') {
      if (tx.type === 'shopify.product.update' || tx.type === 'product.update') {
        const { id, input } = tx.payload;
        Object.keys(input).forEach(key => {
          patches.push({
            op: 'replace',
            path: `/products/${id}/${key}`,
            value: input[key]
          });
        });
      }
    } else if (domain === 'theme') {
      if (tx.type === 'shopify.theme.section.update' || tx.type === 'theme.section.update') {
        const { sectionId, settings } = tx.payload;
        patches.push({
          op: 'replace',
          path: `/nodes/sections/${sectionId}/settings`,
          value: settings
        });
      }
    }

    if (patches.length > 0) {
      await store.applyTransaction({
        id: `sync_${tx.id}`,
        actor: 'system',
        description: `Sync from Shopify: ${tx.type}`,
        baseRevision: store.getState().metadata?.revision || 0,
        patches
      });
    }
  }

  /**
   * emitShopifyEvent
   * 将执行结果通过 SSE 推送到前端
   */
  private emitShopifyEvent(domain: string, tx: any) {
    const timestamp = new Date().toISOString();
    const data = {
      txId: tx.id,
      type: tx.type,
      payload: tx.payload,
      actor: tx.actor || 'ai',
      description: tx.description || `Shopify Action: ${tx.type}`,
      timestamp,
      isReal: true
    };

    // 统一发出 tx.applied 事件，这样 UI 的 Timeline 和 DAG 都能接收到
    eventStream.emit('tx.applied', {
      domain,
      ...data
    });

    // 同时发出特定领域的事件用于统计或特殊处理
    switch (domain) {
      case 'shopify.theme':
        eventStream.emit('shopify.theme.updated', data);
        break;
      case 'shopify.product':
        eventStream.emit('shopify.product.updated', data);
        break;
      case 'shopify.campaign':
        eventStream.emit('shopify.campaign.started', data);
        break;
      case 'shopify.marketing':
      case 'marketing':
        eventStream.emit('marketing.event', data);
        break;
    }
  }

  private getShopifyRuntime(domain: 'theme' | 'product' | 'campaign' | 'marketing') {
    return ShopifyRuntimeFactory.create(domain);
  }

  /**
   * getStore
   * 根据 domain 返回对应的 RuntimeStore
   */
  private getStore(domain: 'theme' | 'product' | 'campaign'): RuntimeStore {
    switch (domain) {
      case 'theme':
        return this.themeStore;
      case 'product':
        return this.productStore;
      case 'campaign':
        return this.campaignStore;
      default:
        throw new Error(`Unknown domain: ${domain}`);
    }
  }
}
