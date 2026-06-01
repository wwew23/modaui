import { RuntimePatch } from '../theme-importer/runtime-core/patch';
import { CampaignId } from './types';

export class CampaignActionLibrary {
  /**
   * activateFlashSale
   * 激活秒杀活动，跨 Theme 与 Product 联动
   */
  async activateFlashSale(config: { 
    campaignId: CampaignId; 
    discountPercent: number;
    primaryColor?: string;
    bannerText?: string;
  }) {
    const patches: RuntimePatch[] = [];

    // 1. Theme Runtime 联动 (通过 Patch 路径区分 scope)
    if (config.primaryColor) {
      patches.push({
        op: 'replace',
        path: '/tokens/colors/accent/base', // ThemeRuntime path
        value: { paletteId: 'system', key: config.primaryColor },
        scope: 'tokens',
        description: 'Update accent color for flash sale'
      });
    }

    if (config.bannerText) {
      patches.push({
        op: 'replace',
        path: '/globalSettings/announcementBar/text',
        value: config.bannerText,
        scope: 'content',
        description: 'Update announcement bar for campaign'
      });
    }

    // 2. Product Runtime 联动
    // 假设我们要给所有参与活动的商品打上秒杀标签并应用折扣标记
    patches.push({
      op: 'replace',
      path: `/campaigns/${config.campaignId}/status`,
      value: 'active',
      scope: 'structure'
    });

    return patches;
  }
}
