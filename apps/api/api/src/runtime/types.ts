export interface Transaction {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RuntimeEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

export interface RuntimeAdapter {
  applyTransaction(tx: Transaction): Promise<any>;
  snapshot(): Promise<any>;
  rollback(snapshotId: string): Promise<void>;
  emitEvent(event: RuntimeEvent): void;
}
