import { DiffResult } from './preview-diff-engine';

export interface TransactionMetrics {
  timestamp: number;
  transactionId: string;
  changedNodesCount: number;
  reRenderedSubtreesCount: number;
  domPatchCount: number;
  executionTimeMs: number;
}

export interface ExportMetrics {
  timestamp: number;
  filesWritten: number;
  nodesSkippedCount: number;
  totalNodesCount: number;
}

/**
 * Theme Observability
 * 记录内核运行时的各项指标，用于性能调优和 AI 行为审计
 */
export class ThemeMetricsTracker {
  private static transactionHistory: TransactionMetrics[] = [];
  private static exportHistory: ExportMetrics[] = [];

  static recordTransaction(metrics: TransactionMetrics) {
    this.transactionHistory.push(metrics);
    console.info(`[Metrics] Transaction ${metrics.transactionId} completed in ${metrics.executionTimeMs}ms. Changed nodes: ${metrics.changedNodesCount}`);
    
    // 限制历史长度
    if (this.transactionHistory.length > 100) this.transactionHistory.shift();
  }

  static recordExport(metrics: ExportMetrics) {
    this.exportHistory.push(metrics);
    console.info(`[Metrics] Export completed. Files written: ${metrics.filesWritten}, Nodes skipped: ${metrics.nodesSkippedCount}/${metrics.totalNodesCount}`);
    
    if (this.exportHistory.length > 100) this.exportHistory.shift();
  }

  static getSummary() {
    return {
      transactions: this.transactionHistory.slice(-10),
      exports: this.exportHistory.slice(-10)
    };
  }
}
