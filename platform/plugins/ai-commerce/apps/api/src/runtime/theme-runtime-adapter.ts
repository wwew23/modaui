import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { shopify } from './shopify/client';
import { snapshotStore } from './snapshot-store';
import { themeActions } from './shopify/theme';

export class ThemeRuntimeAdapter implements RuntimeAdapter {
  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[ThemeRuntimeAdapter] Applying transaction: ${tx.type}`, tx.payload);

    let res: any;
    switch (tx.type) {
      case 'shopify.theme.section.update':
      case 'theme.section.update':
        res = await this.updateSectionSettings(tx.payload);
        break;
      
      case 'shopify.theme.asset.update':
      case 'theme.asset.update':
        res = await themeActions.updateAsset(tx.payload.themeId, tx.payload.key, tx.payload.value);
        break;

      case 'shopify.theme.asset.delete':
        res = await themeActions.deleteAsset(tx.payload.themeId, tx.payload.key);
        break;
      
      case 'shopify.theme.publish':
      case 'theme.publish':
        res = await themeActions.publish(tx.payload.themeId);
        break;

      case 'shopify.theme.update':
        res = await themeActions.updateTheme(tx.payload.themeId, tx.payload.input);
        break;
      
      case 'shopify.theme.template.update':
        res = await themeActions.updateAsset(tx.payload.themeId, `templates/${tx.payload.template}.json`, JSON.stringify(tx.payload.content, null, 2));
        break;
      
      default:
        throw new Error(`Unsupported shopify theme transaction type: ${tx.type}`);
    }

    this.checkUserErrors(res);
    return res;
  }

  private checkUserErrors(res: any) {
    if (!res) return;
    const mutationName = Object.keys(res)[0];
    const mutationResult = res[mutationName];
    if (mutationResult && mutationResult.userErrors && mutationResult.userErrors.length > 0) {
      const errors = mutationResult.userErrors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Shopify User Error [${mutationName}]: ${errors}`);
    }
  }

  private async updateSectionSettings(payload: { themeId: string; template: string; sectionId: string; settings: any }) {
    const assetKey = `templates/${payload.template}.json`;
    const themeId = payload.themeId;

    // 1. Get current asset
    const currentAsset = await themeActions.getAsset(themeId, assetKey);
    const content = JSON.parse(currentAsset.value);

    // 2. Modify section settings
    if (content.sections && content.sections[payload.sectionId]) {
      content.sections[payload.sectionId].settings = {
        ...content.sections[payload.sectionId].settings,
        ...payload.settings
      };
    }

    // 3. Save back
    return themeActions.updateAsset(themeId, assetKey, JSON.stringify(content, null, 2));
  }

  async snapshot(): Promise<any> {
    return snapshotStore.save('shopify.theme', {}, 'Before theme transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    const snapshot = await snapshotStore.getById(snapshotId);
    if (!snapshot || snapshot.domain !== 'shopify.theme') return;

    console.log(`[ThemeRuntimeAdapter] Rolling back to snapshot: ${snapshotId}`);
  }

  /**
   * 从 Shopify 同步数据到本地
   */
  async syncFromShopify(themeId: string, shop?: string): Promise<any> {
    const data = await (shopify as any).rest(`themes/${themeId}/assets.json`, {}, shop);
    // TODO: 进一步获取具体 Asset 内容并同步
    console.log(`[ThemeRuntimeAdapter] Synced assets list for theme ${themeId}`);
    return data.assets;
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[ThemeRuntimeAdapter] Event: ${event.type}`);
  }
}
