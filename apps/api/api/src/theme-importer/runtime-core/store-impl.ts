import { RuntimeStore } from './store';
import { ThemeRuntime } from './types';
import { PatchTransaction, HistoryEntry, RuntimePatch } from './patch';
import { Snapshot } from './snapshot';
import { RuntimeEvent } from './events';
import { ValidationPipeline, ValidationResult } from './validation';
import { applyPatchSet, computeInversePatchSet } from './patch-apply';

import { ExportScheduler } from '../runtime-mapping/export-scheduler';

import { createGuardedRuntime } from './runtime-factory';
import { normalizeRuntime } from './normalization';

import { emitRuntimeEventAsOsEvent } from '../../os/event-stream';
import { recordEvent } from '../../os/event-log';

export class InMemoryRuntimeStore implements RuntimeStore {
  private state: ThemeRuntime;
  private setInTransaction: (val: boolean) => void;
  private history: HistoryEntry[] = [];
  private historyIndex = -1;
  private snapshots: Snapshot[] = [];
  private listeners: Array<(e: RuntimeEvent) => void> = [];
  private scheduler?: ExportScheduler;

  constructor(
    initialState: ThemeRuntime,
    private validatePipeline: ValidationPipeline,
    scheduler?: ExportScheduler
  ) {
    const { proxy, setInTransaction } = createGuardedRuntime(JSON.parse(JSON.stringify(initialState)));
    this.state = proxy;
    this.setInTransaction = setInTransaction;
    this.scheduler = scheduler;

    // 初始快照
    this.createSnapshot('Initial State');
  }

  setScheduler(scheduler: ExportScheduler) {
    this.scheduler = scheduler;
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  getHistoryIndex() {
    return this.historyIndex;
  }

  getHistory() {
    return [...this.history];
  }

  async applyTransaction(
    txData: Omit<PatchTransaction, 'inversePatches' | 'timestamp' | 'revision'>
  ) {
    const currentRevision = this.state.metadata.revision;
    
    // 1. 冲突检测 (Conflict Detection)
    if (txData.baseRevision !== currentRevision) {
      return { 
        success: false, 
        state: this.state, 
        errors: [`Conflict: baseRevision ${txData.baseRevision} does not match current ${currentRevision}`] 
      };
    }

    // 2. 计算新状态
    this.setInTransaction(true);
    try {
      const applyResult = applyPatchSet(this.state, txData.patches);
      if (!applyResult.success) {
        return { success: false, state: this.state, errors: [applyResult.error!] };
      }

      let nextState = applyResult.state;
      
      // 3. 强制归一化 (Normalization Enforcement)
      nextState = normalizeRuntime(nextState);

      // 4. 更新 Revision
      nextState.metadata.revision = currentRevision + 1;

      // 5. 运行验证管线
      const validation = await this.validatePipeline.validate({
        stateBefore: this.state,
        stateAfter: nextState,
        patches: txData.patches
      });

      if (!validation.valid) {
        return {
          success: false,
          state: this.state,
          validation,
          errors: validation.errors.map(e => e.message)
        };
      }

      // 6. 生成逆向 Patch
      const inversePatches = computeInversePatchSet(this.state, txData.patches);

      // 7. 构建完整事务
      const transaction: PatchTransaction = {
        ...txData,
        timestamp: new Date().toISOString(),
        revision: nextState.metadata.revision,
        inversePatches
      };

      // 8. 更新状态与历史
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // 注意：这里我们直接替换 state 对象，但由于 state 是 proxy，我们需要重新包装新对象
      const { proxy, setInTransaction } = createGuardedRuntime(nextState);
      this.state = proxy;
      this.setInTransaction = setInTransaction;

      this.history.push({ transaction });
      this.historyIndex++;

      // 9. 调度导出 (Export Scheduling)
      if (this.scheduler) {
        this.scheduler.schedule(transaction);
      }

      // 10. 触发事件
      this.emit({
        type: 'transactionApplied',
        transaction,
        state: this.state
      });

      // OS 级别统一事件广播
      emitRuntimeEventAsOsEvent('transactionApplied', { transaction, state: this.state });
      
      // 记录到事件日志
      recordEvent({
        type: 'transactionCommitted',
        payload: {
          domain: 'theme', // TODO: 动态获取 domain
          txId: transaction.id,
          patches: transaction.patches
        }
      });

      return { success: true, state: this.state, transaction, validation };
    } finally {
      this.setInTransaction(false);
    }
  }

  async undo() {
    if (this.historyIndex < 0) {
      return { success: false, state: this.state };
    }

    const entry = this.history[this.historyIndex];
    const inversePatches = entry.transaction.inversePatches;

    if (!inversePatches) {
      return { success: false, state: this.state };
    }

    const applyResult = applyPatchSet(this.state, inversePatches);
    if (!applyResult.success) {
      return { success: false, state: this.state };
    }

    // 必须重新包装代理以保持状态保护
    const { proxy, setInTransaction } = createGuardedRuntime(applyResult.state);
    this.state = proxy;
    this.setInTransaction = setInTransaction;
    
    this.historyIndex--;

    this.emit({
      type: 'undo',
      transaction: entry.transaction,
      state: this.state
    });

    emitRuntimeEventAsOsEvent('undo', { transaction: entry.transaction, state: this.state });

    return { success: true, state: this.state };
  }

  async redo() {
    if (this.historyIndex >= this.history.length - 1) {
      return { success: false, state: this.state };
    }

    const nextIndex = this.historyIndex + 1;
    const entry = this.history[nextIndex];
    
    const applyResult = applyPatchSet(this.state, entry.transaction.patches);
    if (!applyResult.success) {
      return { success: false, state: this.state };
    }

    // 必须重新包装代理以保持状态保护
    const { proxy, setInTransaction } = createGuardedRuntime(applyResult.state);
    this.state = proxy;
    this.setInTransaction = setInTransaction;

    this.historyIndex++;

    this.emit({
      type: 'redo',
      transaction: entry.transaction,
      state: this.state
    });

    emitRuntimeEventAsOsEvent('redo', { transaction: entry.transaction, state: this.state });

    return { success: true, state: this.state };
  }

  async createSnapshot(label: string): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      createdAt: new Date().toISOString(),
      label,
      state: this.getState(),
      historyIndex: this.historyIndex
    };

    this.snapshots.push(snapshot);
    this.emit({ type: 'snapshotCreated', snapshot });
    return snapshot;
  }

  async restoreSnapshot(id: string) {
    const snapshot = this.snapshots.find(s => s.id === id);
    if (!snapshot) {
      return { success: false, state: this.state };
    }

    if (snapshot.historyIndex === this.historyIndex) {
      return { success: true, state: this.state };
    }

    const { proxy, setInTransaction } = createGuardedRuntime(JSON.parse(JSON.stringify(snapshot.state)));
    this.state = proxy;
    this.setInTransaction = setInTransaction;
    this.historyIndex = snapshot.historyIndex;
    
    // 恢复快照后，通常我们会保留历史，但当前索引被重置
    this.emit({ type: 'snapshotRestored', snapshot, state: this.state });
    return { success: true, state: this.state };
  }

  subscribe(listener: (e: RuntimeEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: RuntimeEvent) {
    this.listeners.forEach(l => l(event));
  }
}
