import { ThemeRuntime } from './runtime-core/types';

export type PatchOp = 'update' | 'add' | 'remove';

export interface UIChange {
  type: 'section' | 'block' | 'global';
  op: PatchOp;
  nodeId: string;
  parentId?: string;
  index?: number;
}

export interface DiffResult {
  changes: UIChange[];
  tokensChanged: boolean;
  globalSettingsChanged: boolean;
}

/**
 * Preview Diff Engine
 * 负责计算 Runtime 状态变更对 UI 的具体影响
 */
export function diffPreview(oldRuntime: ThemeRuntime, newRuntime: ThemeRuntime): DiffResult {
  const result: DiffResult = {
    changes: [],
    tokensChanged: JSON.stringify(oldRuntime.tokens) !== JSON.stringify(newRuntime.tokens),
    globalSettingsChanged: JSON.stringify(oldRuntime.globalSettings) !== JSON.stringify(newRuntime.globalSettings)
  };

  // 1. Diff Sections
  const oldSectionIds = new Set(Object.keys(oldRuntime.nodes.sections));
  const newSectionIds = new Set(Object.keys(newRuntime.nodes.sections));

  // Removed Sections
  for (const sid of oldSectionIds) {
    if (!newSectionIds.has(sid)) {
      result.changes.push({ type: 'section', op: 'remove', nodeId: sid });
    }
  }

  // Added or Updated Sections
  for (const sid of newSectionIds) {
    if (!oldSectionIds.has(sid)) {
      result.changes.push({ type: 'section', op: 'add', nodeId: sid });
    } else {
      const oldSec = oldRuntime.nodes.sections[sid];
      const newSec = newRuntime.nodes.sections[sid];
      
      // 使用 structureHash 和 contentHash 判断是否需要更新
      if (oldSec.hash.structure !== newSec.hash.structure || oldSec.hash.content !== newSec.hash.content) {
        result.changes.push({ type: 'section', op: 'update', nodeId: sid });
      }
    }
  }

  // 2. Diff Blocks
  const oldBlockIds = new Set(Object.keys(oldRuntime.nodes.blocks));
  const newBlockIds = new Set(Object.keys(newRuntime.nodes.blocks));

  for (const bid of oldBlockIds) {
    if (!newBlockIds.has(bid)) {
      result.changes.push({ type: 'block', op: 'remove', nodeId: bid });
    }
  }

  for (const bid of newBlockIds) {
    if (!oldBlockIds.has(bid)) {
      result.changes.push({ type: 'block', op: 'add', nodeId: bid });
    } else {
      const oldBlock = oldRuntime.nodes.blocks[bid];
      const newBlock = newRuntime.nodes.blocks[bid];
      if (oldBlock.hash.structure !== newBlock.hash.structure || oldBlock.hash.content !== newBlock.hash.content) {
        result.changes.push({ type: 'block', op: 'update', nodeId: bid });
      }
    }
  }

  return result;
}
