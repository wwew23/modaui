import { OsEventLogEntry } from './event-log';
import { applyPatchSet } from '../theme-importer/runtime-core/patch-apply';

export interface CommerceOSState {
  theme: any;
  product: any;
  campaign: any;
}

/**
 * replayFrom
 * 核心不变性检查：从快照和事件日志重建状态。
 * 必须与当前 store 状态完全一致。
 */
export function replayFrom(
  initialSnapshot: CommerceOSState,
  logs: OsEventLogEntry[]
): CommerceOSState {
  // 使用深拷贝避免副作用
  let state = JSON.parse(JSON.stringify(initialSnapshot));

  for (const log of logs) {
    if (log.type === 'transactionCommitted' || log.type === 'atomicTransactionCommitted') {
      const { domain, patches } = log.payload;
      if (patches && patches.length > 0) {
        const domainState = state[domain];
        const applyResult = applyPatchSet(domainState, patches);
        if (applyResult.success) {
          state[domain] = applyResult.state;
        } else {
          console.error(`[Replay] Failed to apply patches for domain ${domain}:`, applyResult.error);
        }
      }
    }
    // TODO: 实现 undo/redo 的重放逻辑
  }

  return state;
}
