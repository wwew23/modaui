import { SectionInstance, BlockInstance } from '../../runtime-core/types';

/**
 * 将 Runtime 中的 settings/schema 导出为 {% schema %} JSON 字符串
 */
export function exportSectionSchema(
  section: SectionInstance,
  originalSchemaJson: any
): string {
  // TODO: 根据 section.settings 对 originalSchemaJson 做适配更新
  const json = JSON.stringify(originalSchemaJson, null, 2);
  return ['{% schema %}', json, '{% endschema %}'].join('\n');
}

export function exportBlockSchema(
  block: BlockInstance,
  originalSchemaJson: any
): string {
  const json = JSON.stringify(originalSchemaJson, null, 2);
  return ['{% schema %}', json, '{% endschema %}'].join('\n');
}
