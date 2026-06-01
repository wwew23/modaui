export type PatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy';

export type PatchScope =
  | 'layout'
  | 'content'
  | 'tokens'
  | 'bindings'
  | 'settings'
  | 'structure'; // section/block 增删

export type ActorType = 'user' | 'ai' | 'system';

export type RuntimePatch = {
  op: PatchOp;
  path: string; // JSON Pointer-like: '/pages/home/sections/0/settings/heading'
  value?: any; // add/replace 时需要
  from?: string; // move/copy 时需要
  scope?: PatchScope; // 用于分组 & 分析
  actor?: ActorType;
  description?: string;
};

export type PatchTransactionId = string;

export type PatchTransaction = {
  id: PatchTransactionId;
  actor: ActorType;
  description: string;
  timestamp: string;
  revision: number;      // 当前事务的版本号
  baseRevision: number;  // 必须提供，事务基于的版本号，用于冲突检测
  patches: RuntimePatch[];
  inversePatches?: RuntimePatch[]; // commit 时生成
};

/**
 * History 条目：用于 undo/redo & event sourcing
 */
export type HistoryEntry = {
  transaction: PatchTransaction;
  meta?: {
    previewScreenshotUrl?: string;
    userId?: string;
    aiTaskId?: string;
  };
};
