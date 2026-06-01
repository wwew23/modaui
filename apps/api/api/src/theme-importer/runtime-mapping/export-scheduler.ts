import { ThemeRuntime } from '../runtime-core/types';
import { PatchTransaction } from '../runtime-core/patch';
import { ThemeSourceMap } from './source-map';
import { LiquidAstFile } from './ast-preserver';
import { exportRuntimeAfterPatches, ExportFlowResult } from './runtime-export-flow';

/**
 * 导出调度器
 * 负责批处理 Patch 任务，合并导出，防止高频 IO
 */
export class ExportScheduler {
  private pendingPatches: any[] = [];
  private isExporting = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(
    private runtime: ThemeRuntime,
    private sourceMap: ThemeSourceMap,
    private astFiles: LiquidAstFile[],
    private onExport: (result: ExportFlowResult) => Promise<void>,
    private debounceMs: number = 300
  ) {}

  /**
   * 调度一个事务后的导出任务
   */
  schedule(transaction: PatchTransaction) {
    this.pendingPatches.push(...transaction.patches);
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  /**
   * 立即执行所有待定的导出
   */
  async flush() {
    if (this.isExporting || this.pendingPatches.length === 0) return;

    this.isExporting = true;
    try {
      const patches = [...this.pendingPatches];
      this.pendingPatches = [];

      const result = exportRuntimeAfterPatches(
        patches,
        this.runtime,
        this.sourceMap,
        this.astFiles
      );

      await this.onExport(result);
    } finally {
      this.isExporting = false;
      
      // 如果在导出期间又有新 Patch 进来，再次触发
      if (this.pendingPatches.length > 0) {
        this.flush();
      }
    }
  }
}
