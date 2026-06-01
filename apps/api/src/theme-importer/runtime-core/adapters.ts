import { ThemeRuntime, SectionInstance, BlockInstance } from './types';

/**
 * 获取页面的所有 Sections
 */
export function getSectionsForPage(runtime: ThemeRuntime, pageId: string): SectionInstance[] {
  const sectionIds = runtime.relations.pageSections[pageId] || [];
  return sectionIds
    .map(sid => runtime.nodes.sections[sid])
    .filter((s): s is SectionInstance => !!s);
}

/**
 * 获取 Section 的所有 Blocks
 */
export function getBlocksForSection(runtime: ThemeRuntime, sectionId: string): BlockInstance[] {
  const blockIds = runtime.relations.sectionBlocks[sectionId] || [];
  return blockIds
    .map(bid => runtime.nodes.blocks[bid])
    .filter((b): b is BlockInstance => !!b);
}

/**
 * 获取所有页面
 */
export function getAllPages(runtime: ThemeRuntime) {
  return Object.values(runtime.pages);
}
