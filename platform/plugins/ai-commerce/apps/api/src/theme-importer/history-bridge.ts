import { RuntimeHistory } from './runtime-history';
import { RuntimeSnapshot } from './runtime-snapshot';
import { ThemeRuntime } from './runtime-core/types';

export type LegacyHistoryEntry = {
  message: string;
  timestamp?: string;
  id?: string;
  userId?: string;
  type?: string;
  instruction?: string;
  snapshot?: string; // 旧版快照路径
  [key: string]: any;
};

/**
 * History Bridge (Hardened v2)
 * 将旧版 history.js 的历史记录映射到新的 Snapshot Timeline
 * 确保旧逻辑继续生效，且时间轴统一
 */
export class HistoryBridge {
  constructor(private runtimeHistory: RuntimeHistory) {}

  /**
   * 撤销最后一次操作 (桥接到新版 History)
   */
  async undoLast(): Promise<{
    success: boolean;
    runtime?: ThemeRuntime;
  }> {
    console.log('[HistoryBridge] Intercepting legacy undoLast() call');
    const snap = this.runtimeHistory.undo();
    if (snap) {
      return { success: true, runtime: snap.runtime as ThemeRuntime };
    }
    return { success: false };
  }

  /**
   * 追加条目 (兼容旧版数据格式)
   */
  appendEntry(entry: LegacyHistoryEntry) {
    console.log(`[HistoryBridge] Appending legacy entry: "${entry.message || entry.instruction}"`);
    
    const snapshot: RuntimeSnapshot = {
      id: entry.id || crypto.randomUUID(),
      timestamp: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now(),
      runtime: entry.snapshot ? this.loadLegacySnapshot(entry.snapshot) : {}, 
      action: {
        type: entry.type || 'legacy-action',
        label: entry.instruction || entry.message || 'Legacy Instruction'
      },
      meta: {
        source: 'legacy-history',
        userId: entry.userId
      }
    };

    this.runtimeHistory.push(snapshot);
    return snapshot;
  }

  private loadLegacySnapshot(snapshotPath: string) {
    // 实际场景中这里需要读取磁盘文件，这里做 Mock 处理
    return { _path: snapshotPath, _type: 'legacy_data' };
  }
}
