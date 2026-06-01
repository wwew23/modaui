import { SectionInstance, BlockInstance } from '../../runtime-core/types';
import { Ownership } from '../ownership';
import { wrapWithAiRegion } from '../runtime-region';

export type SectionExportOptions = {
  ownership: Ownership;
  aiRegionId?: string;
};

/**
 * 将 SectionInstance 导出为 Liquid 片段
 */
export function exportSectionToLiquidSnippet(
  section: SectionInstance,
  opts: SectionExportOptions
): string {
  const content = [
    `{% comment %} Section ${section.id} type=${section.type} {% endcomment %}`,
    `<section class="md-section md-section-${section.type}">`,
    ...section.blocks.map(b => exportBlockToLiquidSnippet(b)),
    `</section>`
  ].join('\n');

  if (opts.ownership === 'ai-managed' && opts.aiRegionId) {
    return wrapWithAiRegion(opts.aiRegionId, content);
  }

  return content;
}

export function exportBlockToLiquidSnippet(block: BlockInstance): string {
  return [
    `{% comment %} Block ${block.id} type=${block.type} {% endcomment %}`,
    `<div class="md-block md-block-${block.type}">`,
    `  {% comment %} TODO: render settings into HTML / Liquid bindings {% endcomment %}`,
    `</div>`
  ].join('\n');
}

/**
 * 将 Section 实例导出为 JSON (针对 Shopify 2.0 模板)
 */
export function exportSectionToJson(section: SectionInstance): any {
  const blocks: Record<string, any> = {};
  const blockOrder: string[] = [];

  section.blocks.forEach(block => {
    blocks[block.id] = {
      type: block.type,
      settings: block.settings
    };
    blockOrder.push(block.id);
  });

  return {
    type: section.type,
    settings: section.settings,
    blocks,
    block_order: blockOrder
  };
}
