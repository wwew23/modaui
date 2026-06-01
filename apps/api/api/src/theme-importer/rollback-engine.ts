import { ThemeRuntime } from './runtime-core/types';
import { Snapshot } from './runtime-core/snapshot';
import { ThemePreviewShell } from './preview-shell';
import { RuntimeStore } from './runtime-core/store';

/**
 * Rollback Engine
 * 负责状态回滚与 UI 同步的编排
 */
export class RollbackEngine {
  constructor(
    private store: RuntimeStore,
    private previewShell: ThemePreviewShell
  ) {}

  /**
   * 回滚到指定的快照
   */
  async rollbackToSnapshot(snapshotId: string, pageId: string, container: HTMLElement) {
    console.log(`[RollbackEngine] Rolling back to snapshot: ${snapshotId}`);
    
    const result = await this.store.restoreSnapshot(snapshotId);
    
    if (result.success) {
      // 同步 UI 预览
      this.previewShell.applyUpdate(result.state, pageId, container);
      return { success: true, state: result.state };
    }
    
    return { success: false, error: 'Snapshot not found or restore failed' };
  }

  /**
   * 撤销最近一次操作并同步 UI
   */
  async undoWithUI(pageId: string, container: HTMLElement) {
    const result = await this.store.undo();
    if (result.success) {
      this.previewShell.applyUpdate(result.state, pageId, container);
      return { success: true, state: result.state };
    }
    return { success: false };
  }

  /**
   * 重做最近一次撤销的操作并同步 UI
   */
  async redoWithUI(pageId: string, container: HTMLElement) {
    const result = await this.store.redo();
    if (result.success) {
      this.previewShell.applyUpdate(result.state, pageId, container);
      return { success: true, state: result.state };
    }
    return { success: false };
  }
}
