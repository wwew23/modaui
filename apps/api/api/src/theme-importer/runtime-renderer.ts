import { ThemeRuntime, SectionInstance, BlockInstance } from './runtime-core/types';

/**
 * 本地 Runtime 渲染器
 * 将 ThemeRuntime 渲染为 HTML (用于快速预览，不依赖 Shopify)
 */
export class ThemeLocalRenderer {
  renderPage(runtime: ThemeRuntime, pageId: string): string {
    const sectionIds = runtime.relations.pageSections[pageId] || [];
    const sectionsHtml = sectionIds
      .map((sid: string) => this.renderSection(runtime, sid))
      .join('\n');

    return `
      <div class="theme-preview" style="--container-width: ${runtime.globalSettings.container_width || '1200px'}">
        <style>${this.generateGlobalStyles(runtime)}</style>
        ${sectionsHtml}
      </div>
    `;
  }

  public renderSection(runtime: ThemeRuntime, sectionId: string): string {
    const section = runtime.nodes.sections[sectionId];
    if (!section) return '';

    const blockIds = runtime.relations.sectionBlocks[sectionId] || [];
    const blocksHtml = blockIds
      .map((bid: string) => this.renderBlock(runtime, bid))
      .join('\n');

    return `
      <section 
        id="section-${sectionId}" 
        data-node-id="section:${sectionId}" 
        data-structure-hash="${section.hash.structure}"
        data-content-hash="${section.hash.content}"
        class="shopify-section section-${section.type}" 
        data-ownership="${section.ownership}"
      >
        <div class="section-content">
          ${this.getSectionTemplate(section, blocksHtml)}
        </div>
      </section>
    `;
  }

  public renderBlock(runtime: ThemeRuntime, blockId: string): string {
    const block = runtime.nodes.blocks[blockId];
    if (!block) return '';

    return `
      <div 
        id="block-${blockId}" 
        data-node-id="block:${blockId}" 
        data-structure-hash="${block.hash.structure}"
        data-content-hash="${block.hash.content}"
        class="shopify-block block-${block.type}" 
        data-ownership="${block.ownership}"
      >
        ${this.getBlockTemplate(block)}
      </div>
    `;
  }

  private getSectionTemplate(section: SectionInstance, blocksHtml: string): string {
    // 简化的 Mock 渲染逻辑
    switch (section.type) {
      case 'hero':
        return `
          <div class="hero" style="background: ${section.settings.bg || '#eee'}">
            <h1>${section.settings.title || 'Untitled Hero'}</h1>
            <div class="blocks">${blocksHtml}</div>
          </div>
        `;
      case 'product-grid':
        return `
          <div class="product-grid">
            <h2>${section.settings.title || 'Products'}</h2>
            <div class="grid-placeholder">Product Grid Placeholder</div>
          </div>
        `;
      default:
        return `<div class="unknown-section">${section.type}</div>`;
    }
  }

  private getBlockTemplate(block: BlockInstance): string {
    switch (block.type) {
      case 'text':
        return `<p>${block.settings.content || ''}</p>`;
      case 'button':
        return `<button>${block.settings.label || 'Click'}</button>`;
      default:
        return `<div class="unknown-block">${block.type}</div>`;
    }
  }

  private generateGlobalStyles(runtime: ThemeRuntime): string {
    const tokens = runtime.tokens;
    return `
      :root {
        --color-bg: ${tokens.colors.background.base.key};
        --color-text: ${tokens.colors.textPrimary.base.key};
        --font-body: ${tokens.typography.body.fontFamily};
      }
      .theme-preview { font-family: var(--font-body); background: var(--color-bg); color: var(--color-text); }
      .shopify-section { padding: 40px 0; border-bottom: 1px solid #eee; }
    `;
  }
}
