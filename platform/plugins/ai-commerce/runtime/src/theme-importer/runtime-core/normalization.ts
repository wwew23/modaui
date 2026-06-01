import { ThemeRuntime } from './types';
import { StructuralHasher } from './hashing';

/**
 * 归一化逻辑：
 * 1. 清理孤立节点
 * 2. 修复无效关系
 * 3. 同步哈希
 */
export function normalizeRuntime(runtime: ThemeRuntime): ThemeRuntime {
  // 1. 修复无效关系 (Invalid Relations) - 移除指向不存在节点的 ID
  Object.keys(runtime.relations.pageSections).forEach(pageId => {
    runtime.relations.pageSections[pageId] = runtime.relations.pageSections[pageId].filter(sid => !!runtime.nodes.sections[sid]);
  });

  Object.keys(runtime.relations.sectionBlocks).forEach(sectionId => {
    runtime.relations.sectionBlocks[sectionId] = (runtime.relations.sectionBlocks[sectionId] || []).filter(bid => !!runtime.nodes.blocks[bid]);
  });

  // 2. 清理孤立节点 (Dangling Nodes)
  const activeSectionIds = new Set<string>();
  Object.values(runtime.relations.pageSections).forEach(ids => {
    ids.forEach(id => activeSectionIds.add(id));
  });

  const activeBlockIds = new Set<string>();
  activeSectionIds.forEach(sid => {
    const bids = runtime.relations.sectionBlocks[sid] || [];
    bids.forEach(bid => activeBlockIds.add(bid));
  });

  // 删除未被引用的节点
  Object.keys(runtime.nodes.sections).forEach(sid => {
    if (!activeSectionIds.has(sid)) {
      delete runtime.nodes.sections[sid];
    }
  });
  Object.keys(runtime.nodes.blocks).forEach(bid => {
    if (!activeBlockIds.has(bid)) {
      delete runtime.nodes.blocks[bid];
    }
  });

  // 3. 同步哈希 (Hash Synchronization)
  activeSectionIds.forEach(sid => {
    const section = runtime.nodes.sections[sid];
    if (section) {
      section.hash.content = StructuralHasher.hashContent(section.settings);
      section.hash.structure = StructuralHasher.hashStructure(section.type, runtime.relations.sectionBlocks[sid] || []);
    }
  });

  activeBlockIds.forEach(bid => {
    const block = runtime.nodes.blocks[bid];
    if (block) {
      block.hash.content = StructuralHasher.hashContent(block.settings);
      block.hash.structure = StructuralHasher.hashStructure(block.type, []);
    }
  });

  return runtime;
}
