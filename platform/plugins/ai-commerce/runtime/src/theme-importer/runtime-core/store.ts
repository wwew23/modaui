import { ThemeRuntime } from './types';
import { PatchTransaction, HistoryEntry } from './patch';
import { Snapshot } from './snapshot';
import { RuntimeEvent } from './events';
import { ValidationResult } from './validation';

export interface RuntimeStore {
  /** 获取当前状态 */
  getState(): ThemeRuntime;

  /** 获取历史记录索引 */
  getHistoryIndex(): number;

  /** 获取历史记录 */
  getHistory(): HistoryEntry[];

  /** 提交并应用事务 */
  applyTransaction(
    tx: Omit<PatchTransaction, 'inversePatches' | 'timestamp' | 'revision'>
  ): Promise<{
    success: boolean;
    state: ThemeRuntime;
    transaction?: PatchTransaction;
    validation?: ValidationResult;
    errors?: string[];
  }>;

  /** 撤销 */
  undo(): Promise<{
    success: boolean;
    state: ThemeRuntime;
  }>;

  /** 重做 */
  redo(): Promise<{
    success: boolean;
    state: ThemeRuntime;
  }>;

  /** 创建快照 */
  createSnapshot(label: string): Promise<Snapshot>;

  /** 恢复快照 */
  restoreSnapshot(id: string): Promise<{
    success: boolean;
    state: ThemeRuntime;
  }>;

  /** 事件订阅 */
  subscribe(listener: (e: RuntimeEvent) => void): () => void;
}
