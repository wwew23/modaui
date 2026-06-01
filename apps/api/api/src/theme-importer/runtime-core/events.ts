import { PatchTransaction } from './patch';
import { ThemeRuntime } from './types';
import { Snapshot } from './snapshot';

export type RuntimeEvent =
  | {
      type: 'transactionApplied';
      transaction: PatchTransaction;
      state: ThemeRuntime;
    }
  | {
      type: 'undo';
      transaction: PatchTransaction;
      state: ThemeRuntime;
    }
  | {
      type: 'redo';
      transaction: PatchTransaction;
      state: ThemeRuntime;
    }
  | {
      type: 'snapshotCreated';
      snapshot: Snapshot;
    }
  | {
      type: 'snapshotRestored';
      snapshot: Snapshot;
      state: ThemeRuntime;
    };
