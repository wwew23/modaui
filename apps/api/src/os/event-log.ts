import { RuntimePatch } from '../theme-importer/runtime-core/patch';

export type OsEventLogEntry = {
  id: string;
  type: 'transactionCommitted' | 'atomicTransactionCommitted' | 'undo' | 'redo';
  timestamp: string;
  payload: {
    domain: 'theme' | 'product' | 'campaign' | 'commerce';
    txId?: string;
    patches?: RuntimePatch[];
  };
};

const eventLog: OsEventLogEntry[] = [];

/**
 * recordEvent
 * 记录所有状态变更事件，确保 OS 100% 可回放
 */
export function recordEvent(entry: Omit<OsEventLogEntry, 'id' | 'timestamp'>) {
  const fullEntry: OsEventLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  eventLog.push(fullEntry);
  return fullEntry;
}

export function getEventLog() {
  return [...eventLog];
}
