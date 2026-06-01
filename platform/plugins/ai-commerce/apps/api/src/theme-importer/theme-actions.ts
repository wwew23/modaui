import { RuntimeStore } from './runtime-core/store';
import { RuntimePatch, ActorType } from './runtime-core/patch';
import { ThemeRuntime } from './runtime-core/types';

export interface ThemeActionContext {
  store: RuntimeStore;
  actor: ActorType;
}

/**
 * 主题智能动作库
 * 将底层的 Patch 操作封装为人类/AI 可理解的高级动作
 */
export class ThemeActionLibrary {
  constructor(private context: ThemeActionContext) {}

  /**
   * 应用品牌视觉配置
   */
  async applyBrandProfile(profile: any, description: string = 'Apply brand profile') {
    const patches: RuntimePatch[] = [
      { op: 'replace', path: '/tokens/colors', value: profile.colors, scope: 'tokens' },
      { op: 'replace', path: '/tokens/typography', value: profile.typography, scope: 'tokens' }
    ];
    return this.apply(patches, description);
  }

  /**
   * 调整全局间距倍率
   */
  async adjustGlobalSpacing(multiplier: number) {
    const currentTokens = this.context.store.getState().tokens;
    const newSpacing = { ...currentTokens.spacing };
    // 逻辑：对所有数值类型的 spacing 做缩放
    // ... 
    const patches: RuntimePatch[] = [
      { op: 'replace', path: '/tokens/spacing', value: newSpacing, scope: 'tokens' }
    ];
    return this.apply(patches, `Adjust global spacing by ${multiplier}x`);
  }

  /**
   * 在页面中重新排列 Sections
   */
  async reorderSections(pageId: string, sectionIds: string[]) {
    const patches: RuntimePatch[] = [
      { op: 'replace', path: `/relations/pageSections/${pageId}`, value: sectionIds, scope: 'structure' }
    ];
    return this.apply(patches, `Reorder sections on page ${pageId}`);
  }

  /**
   * 更新 Section 的设置
   */
  async updateSectionSettings(sectionId: string, settings: Record<string, any>) {
    const patches: RuntimePatch[] = [
      { op: 'replace', path: `/nodes/sections/${sectionId}/settings`, value: settings, scope: 'settings' }
    ];
    return this.apply(patches, `Update settings for section ${sectionId}`);
  }

  /**
   * 绑定集合到 Section
   */
  async bindCollectionToSection(sectionId: string, collectionId: string) {
    const patches: RuntimePatch[] = [
      { op: 'replace', path: `/nodes/sections/${sectionId}/settings/collection_id`, value: collectionId, scope: 'bindings' }
    ];
    return this.apply(patches, `Bind collection ${collectionId} to section ${sectionId}`);
  }

  /**
   * 创建豪华风格的 Hero Section
   */
  async createLuxuryHeroSection(
    pageId: string, 
    options: { tone: 'luxury' | 'minimal'; withCta: boolean }
  ) {
    const sectionId = `hero-${Date.now()}`;
    const patches: RuntimePatch[] = [
      { 
        op: 'add', 
        path: `/nodes/sections/${sectionId}`, 
        value: {
          id: sectionId,
          type: 'hero',
          settings: {
            tone: options.tone,
            show_cta: options.withCta,
            title: options.tone === 'luxury' ? 'Premium Excellence' : 'Pure Simplicity',
            bg: options.tone === 'luxury' ? '#1a1a1a' : '#ffffff'
          },
          ownership: 'ai-managed',
          hash: { content: '', structure: '' }
        },
        scope: 'structure'
      },
      { op: 'add', path: `/relations/pageSections/${pageId}/-`, value: sectionId, scope: 'structure' }
    ];
    return this.apply(patches, `Create ${options.tone} hero section for page ${pageId}`);
  }

  /**
   * 根据优先级重新排列 Sections
   */
  async reorderSectionsByPriority(pageId: string, priority: Record<string, number>) {
    const currentState = this.context.store.getState();
    const sectionIds = currentState.relations.pageSections[pageId] || [];
    
    const sortedIds = [...sectionIds].sort((a, b) => (priority[a] || 0) - (priority[b] || 0));
    
    const patches: RuntimePatch[] = [
      { op: 'replace', path: `/relations/pageSections/${pageId}`, value: sortedIds, scope: 'structure' }
    ];
    return this.apply(patches, `Reorder sections by priority on page ${pageId}`);
  }

  /**
   * 应用活动 Tokens 到指定页面
   */
  async applyCampaignTokensToPage(campaignId: string, pageId: string) {
    // 模拟从 Campaign 系统获取配置
    const campaignTokens = {
      primaryColor: '#ff0000', // 活动色
      bannerText: `Exclusive ${campaignId} Offer`
    };

    const patches: RuntimePatch[] = [
      { op: 'replace', path: '/tokens/colors/accent', value: { base: { paletteId: 'campaign', key: campaignTokens.primaryColor } }, scope: 'tokens' },
      // 假设我们要给首页加一个公告栏
      // ... 更多逻辑
    ];
    return this.apply(patches, `Apply campaign ${campaignId} tokens to page ${pageId}`);
  }

  /**
   * 应用任意 Patch (OS Gateway 使用)
   */
  async apply_patches(patches: RuntimePatch[], description: string = 'Bulk apply patches') {
    return this.apply(patches, description);
  }

  private async apply(patches: RuntimePatch[], description: string) {
    const state = this.context.store.getState();
    return this.context.store.applyTransaction({
      id: `action-${Date.now()}`,
      actor: this.context.actor,
      description,
      baseRevision: state.metadata.revision,
      patches
    });
  }
}
