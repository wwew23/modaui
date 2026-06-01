import { RuntimeStore } from '../../theme-importer/runtime-core/store';
import { ShopifyRuntimeFactory } from '../../runtime/shopify-runtime-factory';

export interface TransactionSession {
  id: string;
  snapshots: Map<'theme' | 'product' | 'campaign' | 'shopify.theme' | 'shopify.product' | 'shopify.campaign', any>;
  patches: { runtime: string; patches: any[]; description: string }[];
  status: 'active' | 'committed' | 'rolled_back';
}

export class TransactionEngine {
  private activeTransactions: Map<string, TransactionSession> = new Map();
  private shopifyThemeRuntime = ShopifyRuntimeFactory.create('theme');
  private shopifyProductRuntime = ShopifyRuntimeFactory.create('product');
  private shopifyCampaignRuntime = ShopifyRuntimeFactory.create('campaign');

  constructor(
    private themeStore: RuntimeStore,
    private productStore: RuntimeStore,
    private campaignStore: RuntimeStore
  ) {}

  /**
   * begin
   * 唯一合法启动事务的入口，锁定当前状态快照
   */
  async begin(id: string): Promise<TransactionSession> {
    if (this.activeTransactions.has(id)) {
      throw new Error(`Transaction ${id} already exists`);
    }

    const snapshots = new Map();
    snapshots.set('theme', await this.themeStore.createSnapshot(`OS Tx Start: ${id}`));
    snapshots.set('product', await this.productStore.createSnapshot(`OS Tx Start: ${id}`));
    snapshots.set('campaign', await this.campaignStore.createSnapshot(`OS Tx Start: ${id}`));
    
    // Shopify Snapshots
    snapshots.set('shopify.theme', await this.shopifyThemeRuntime.snapshot());
    snapshots.set('shopify.product', await this.shopifyProductRuntime.snapshot());
    snapshots.set('shopify.campaign', await this.shopifyCampaignRuntime.snapshot());

    const session: TransactionSession = { 
      id, 
      snapshots, 
      patches: [],
      status: 'active'
    };

    this.activeTransactions.set(id, session);
    return session;
  }

  /**
   * commit
   * 确认所有变更。在 OS 架构中，变更在步骤执行时已暂存到内存，commit 负责确认事务完成。
   */
  async commit(id: string) {
    const session = this.activeTransactions.get(id);
    if (!session || session.status !== 'active') {
      throw new Error(`Transaction ${id} not active`);
    }

    session.status = 'committed';
    this.activeTransactions.delete(id);
    
    console.log(`[TransactionEngine] Committed transaction: ${id}`);
    return { success: true };
  }

  /**
   * rollback
   * 强制回滚：唯一合法的状态恢复入口，确保内核原子性
   */
  async rollback(id: string) {
    const session = this.activeTransactions.get(id);
    if (!session) return { success: false, error: 'Transaction not found' };

    console.warn(`[TransactionEngine] Rolling back transaction: ${id}`);

    // 原子性恢复所有 Runtime 到事务开始前的状态
    await Promise.all([
      this.themeStore.restoreSnapshot(session.snapshots.get('theme').id),
      this.productStore.restoreSnapshot(session.snapshots.get('product').id),
      this.campaignStore.restoreSnapshot(session.snapshots.get('campaign').id),
      
      // Shopify Rollbacks
      this.shopifyThemeRuntime.rollback(session.snapshots.get('shopify.theme').id),
      this.shopifyProductRuntime.rollback(session.snapshots.get('shopify.product').id),
      this.shopifyCampaignRuntime.rollback(session.snapshots.get('shopify.campaign').id)
    ]);

    session.status = 'rolled_back';
    this.activeTransactions.delete(id);
    
    return { success: true };
  }

  /**
   * recordPatch
   * 记录事务中的变更，用于审计和 Replay
   */
  recordPatch(txId: string, runtime: 'theme' | 'product' | 'campaign', patches: any[], description: string) {
    const session = this.activeTransactions.get(txId);
    if (session && session.status === 'active') {
      session.patches.push({ runtime, patches, description });
    }
  }

  isActive(id: string): boolean {
    return this.activeTransactions.has(id);
  }
}
