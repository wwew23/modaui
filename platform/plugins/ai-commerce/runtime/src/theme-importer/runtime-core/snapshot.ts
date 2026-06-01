import { ThemeRuntime } from './types';

export type SnapshotId = string;

export type Snapshot = {
  id: SnapshotId;
  createdAt: string;
  label: string;
  state: ThemeRuntime;
  historyIndex: number; // 截止到该 snapshot 包含的 transaction 索引
};
