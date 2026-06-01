import { BlockInstance } from '../../runtime-core/types';

export function exportBlockFile(block: BlockInstance): string {
  return [
    `{% comment %} Block file for ${block.id} type=${block.type} {% endcomment %}`,
    `<div class="md-block-file md-block-${block.type}">`,
    `  {% comment %} TODO: render settings {% endcomment %}`,
    `</div>`
  ].join('\n');
}

export function exportBlockToJson(block: BlockInstance): any {
  return {
    type: block.type,
    settings: block.settings
  };
}
