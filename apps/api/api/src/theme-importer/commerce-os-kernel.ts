import { CommerceOSState, CommerceTransaction } from './commerce-os-types';
import { CommerceOSStore } from './commerce-os-store';

/**
 * Commerce OS Kernel (Hardened v2)
 * 多域运行时编排器。负责协调 Theme, Product, Campaign 之间的原子联动。
 */
export class CommerceOSKernel {
  constructor(
    private store: CommerceOSStore
  ) {}

  /**
   * 执行全域原子事务
   * 确保跨域联动（如活动触发主题变更）的一致性
   */
  async executeAtomicTransaction(txInput: Omit<CommerceTransaction, 'timestamp' | 'id'>) {
    const tx: CommerceTransaction = {
      ...txInput,
      id: `ctx-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    console.log(`[CommerceOSKernel] Executing atomic transaction: ${tx.description}`);
    
    const result = await this.store.applyAtomicTransaction(tx);
    
    if (result.success) {
      console.info(`[CommerceOSKernel] Transaction committed. New revision: ${result.state.revision}`);
    } else {
      console.warn(`[CommerceOSKernel] Transaction failed: ${result.errors?.join(', ')}`);
    }

    return result;
  }

  getUnifiedState(): CommerceOSState {
    return this.store.getState();
  }
}
