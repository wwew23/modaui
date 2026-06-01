import { CommerceOSState, CommerceTransaction } from './commerce-os-types';
import { applyPatchSet } from './runtime-core/patch-apply';

/**
 * Commerce OS Store
 * 维护全域统一状态 (Theme + Product + Campaign)
 */
export class CommerceOSStore {
  private state: CommerceOSState;

  constructor(initialState: CommerceOSState) {
    this.state = initialState;
  }

  getState(): CommerceOSState {
    return this.state;
  }

  /**
   * 应用全域原子事务
   * 遵循 "All or Nothing" 规则
   */
  async applyAtomicTransaction(tx: CommerceTransaction): Promise<{ success: boolean; state: CommerceOSState; errors?: string[] }> {
    const { baseRevision, domainPatches } = tx;

    // 1. 冲突检测
    if (baseRevision !== this.state.revision) {
      return { 
        success: false, 
        state: this.state, 
        errors: [`Conflict: baseRevision ${baseRevision} does not match current ${this.state.revision}`] 
      };
    }

    // 2. 模拟应用 (Draft State)
    let nextState = JSON.parse(JSON.stringify(this.state));

    try {
      // 2.1 应用 Theme Patches
      if (domainPatches.theme && domainPatches.theme.length > 0) {
        const themeResult = applyPatchSet(nextState.theme, domainPatches.theme);
        if (!themeResult.success) throw new Error('Theme patches failed');
        nextState.theme = themeResult.state;
      }

      // 2.2 应用 Product Patches (此处暂用简单合并，后续可硬化)
      if (domainPatches.products && domainPatches.products.length > 0) {
        // 简化逻辑：如果是 Product 领域，通常通过 ID 更新
        domainPatches.products.forEach(p => {
          if (p.op === 'replace' && p.path.startsWith('/products/')) {
            const parts = p.path.split('/');
            const pid = parts[2];
            if (nextState.products.products[pid]) {
              nextState.products.products[pid] = { ...nextState.products.products[pid], ...p.value };
            }
          }
        });
      }

      // 2.3 应用 Campaign Patches
      if (domainPatches.campaigns && domainPatches.campaigns.length > 0) {
        domainPatches.campaigns.forEach(p => {
          if (p.op === 'replace' && p.path.startsWith('/campaigns/')) {
            const parts = p.path.split('/');
            const cid = parts[2];
            if (nextState.campaigns.campaigns[cid]) {
              nextState.campaigns.campaigns[cid] = { ...nextState.campaigns.campaigns[cid], ...p.value };
            }
          }
        });
      }

      // 3. 提交变更
      nextState.revision = this.state.revision + 1;
      nextState.lastUpdated = new Date().toISOString();
      this.state = nextState;

      return { success: true, state: this.state };

    } catch (error: any) {
      console.error('[CommerceOSStore] Atomic transaction failed, rolling back.', error);
      return { success: false, state: this.state, errors: [error.message] };
    }
  }
}
