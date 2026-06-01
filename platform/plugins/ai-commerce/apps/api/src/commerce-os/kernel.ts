import { RuntimeStore } from '../theme-importer/runtime-core/store';

/**
 * CommerceOSKernel
 * 纯状态管理层，不包含执行逻辑
 * 职责：快照管理 + 事务追踪
 * 
 * ⚠️ 不允许包含任何执行逻辑
 * ⚠️ 只能提供状态操作接口
 */

export interface TransactionSession {
  id: string;
  snapshots: Map<'theme' | 'product' | 'campaign', any>;
  status: 'active' | 'committed' | 'rolled_back';
}

export class CommerceOSKernel {
  private activeTransactions: Map<string, TransactionSession> = new Map();

  constructor(
    private themeStore: RuntimeStore,
    private productStore: RuntimeStore,
    private campaignStore: RuntimeStore
  ) {}

  /**
   * createTransactionSnapshot
   * 创建事务快照，标记事务开始
   */
  async createTransactionSnapshot(txId: string): Promise<TransactionSession> {
    if (this.activeTransactions.has(txId)) {
      throw new Error(`[Kernel] Transaction ${txId} already exists`);
    }

    const snapshots = new Map();

    try {
      snapshots.set('theme', await this.themeStore.createSnapshot(`OS Tx: ${txId}`));
      snapshots.set('product', await this.productStore.createSnapshot(`OS Tx: ${txId}`));
      snapshots.set('campaign', await this.campaignStore.createSnapshot(`OS Tx: ${txId}`));
    } catch (err: any) {
      throw new Error(`[Kernel] Failed to create transaction snapshots: ${err.message}`);
    }

    const session: TransactionSession = {
      id: txId,
      snapshots,
      status: 'active'
    };

    this.activeTransactions.set(txId, session);

    console.log(`[Kernel] Transaction snapshot created: ${txId}`);

    return session;
  }

  /**
   * commitTransaction
   * 确认事务完成（仅更新状态，不回滚）
   */
  async commitTransaction(txId: string) {
    const session = this.activeTransactions.get(txId);

    if (!session) {
      throw new Error(`[Kernel] Transaction ${txId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(`[Kernel] Transaction ${txId} is not active (status: ${session.status})`);
    }

    session.status = 'committed';
    this.activeTransactions.delete(txId);

    console.log(`[Kernel] Transaction committed: ${txId}`);

    return { success: true };
  }

  /**
   * rollbackTransaction
   * 强制回滚事务：所有 Runtime 原子恢复到快照状态
   */
  async rollbackTransaction(txId: string) {
    const session = this.activeTransactions.get(txId);

    if (!session) {
      console.warn(`[Kernel] Transaction ${txId} not found for rollback`);
      return { success: false, error: 'Transaction not found' };
    }

    console.warn(`[Kernel] Rolling back transaction: ${txId}`);

    try {
      const themeSnapshot = session.snapshots.get('theme');
      const productSnapshot = session.snapshots.get('product');
      const campaignSnapshot = session.snapshots.get('campaign');

      // 原子性恢复所有 Runtime
      await Promise.all([
        themeSnapshot ? this.themeStore.restoreSnapshot(themeSnapshot.id) : Promise.resolve(),
        productSnapshot
          ? this.productStore.restoreSnapshot(productSnapshot.id)
          : Promise.resolve(),
        campaignSnapshot
          ? this.campaignStore.restoreSnapshot(campaignSnapshot.id)
          : Promise.resolve()
      ]);

      session.status = 'rolled_back';
      this.activeTransactions.delete(txId);

      console.log(`[Kernel] Transaction rolled back: ${txId}`);

      return { success: true };
    } catch (err: any) {
      console.error(`[Kernel] Rollback failed for transaction ${txId}:`, err.message);
      throw err;
    }
  }

  /**
   * isTransactionActive
   * 检查事务是否仍然活跃
   */
  isTransactionActive(txId: string): boolean {
    const session = this.activeTransactions.get(txId);
    return session !== undefined && session.status === 'active';
  }

  /**
   * getTransactionSnapshot
   * 获取指定事务的快照对象
   */
  getTransactionSnapshot(txId: string, domain: 'theme' | 'product' | 'campaign') {
    const session = this.activeTransactions.get(txId);
    if (!session) return null;
    return session.snapshots.get(domain);
  }

  /**
   * listActiveTransactions
   * 列出所有活跃事务（调试用）
   */
  listActiveTransactions(): string[] {
    return Array.from(this.activeTransactions.values())
      .filter(s => s.status === 'active')
      .map(s => s.id);
  }
}
