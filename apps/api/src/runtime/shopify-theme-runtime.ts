import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { createShopifyAdminClient } from '../shopify/client';
import { snapshotStore } from './snapshot-store';

export class ShopifyThemeRuntime implements RuntimeAdapter {
  private shopify = createShopifyAdminClient();

  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[ShopifyThemeRuntime] Applying transaction: ${tx.type}`, tx.payload);

    switch (tx.type) {
      case 'shopify.theme.section.update':
        return this.updateSectionSettings(tx.payload);
      case 'shopify.theme.asset.update':
        return this.updateThemeAsset(tx.payload);
      case 'shopify.theme.publish':
        return this.publishTheme(tx.payload.themeId);
      case 'shopify.theme.template.update':
        return this.updateTemplateJson(tx.payload);
      default:
        throw new Error(`Unsupported shopify theme transaction type: ${tx.type}`);
    }
  }

  private async updateSectionSettings(payload: { themeId: string; template: string; sectionId: string; settings: any }) {
    const assetKey = `templates/${payload.template}.json`;
    const themeId = payload.themeId;

    // 1. Get current asset
    const currentAsset = await this.getThemeAsset(themeId, assetKey);
    const content = JSON.parse(currentAsset.value);

    // 2. Modify section settings
    if (content.sections && content.sections[payload.sectionId]) {
      content.sections[payload.sectionId].settings = {
        ...content.sections[payload.sectionId].settings,
        ...payload.settings
      };
    }

    // 3. Save back
    return this.updateThemeAsset({
      themeId,
      key: assetKey,
      value: JSON.stringify(content, null, 2)
    });
  }

  private async updateThemeAsset(payload: { themeId: string; key: string; value: string }) {
    const shopifyStore = process.env.SHOPIFY_STORE;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-01';
    const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
    
    const url = `https://${shopifyStore}/admin/api/${apiVersion}/themes/${payload.themeId}/assets.json`;
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken!
      },
      body: JSON.stringify({
        asset: {
          key: payload.key,
          value: payload.value
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to update theme asset: ${res.statusText}`);
    }

    return res.json();
  }

  private async getThemeAsset(themeId: string, key: string) {
    const shopifyStore = process.env.SHOPIFY_STORE;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-01';
    const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
    
    const url = `https://${shopifyStore}/admin/api/${apiVersion}/themes/${themeId}/assets.json?asset[key]=${key}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': adminToken!
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to get theme asset: ${res.statusText}`);
    }

    const data = await res.json() as { asset: any };
    return data.asset;
  }

  private async publishTheme(themeId: string) {
    const shopifyStore = process.env.SHOPIFY_STORE;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-01';
    const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
    
    const url = `https://${shopifyStore}/admin/api/${apiVersion}/themes/${themeId}.json`;
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken!
      },
      body: JSON.stringify({
        theme: {
          id: themeId,
          role: 'main'
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to publish theme: ${res.statusText}`);
    }

    return res.json();
  }

  private async updateTemplateJson(payload: { themeId: string; template: string; value: any }) {
    return this.updateThemeAsset({
      themeId: payload.themeId,
      key: `templates/${payload.template}.json`,
      value: JSON.stringify(payload.value, null, 2)
    });
  }

  async snapshot(): Promise<any> {
    // In a real scenario, we might snapshot the main theme's template files
    // For now, we'll assume we know which theme we're working with
    const themeId = process.env.SHOPIFY_THEME_ID || 'main'; 
    const assetKeys = ['templates/index.json', 'config/settings_data.json'];
    
    const assets = await Promise.all(assetKeys.map(key => this.getThemeAsset(themeId, key)));
    
    return snapshotStore.save('shopify.theme', { themeId, assets }, 'Before theme transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    const snapshot = await snapshotStore.getById(snapshotId);
    if (!snapshot || snapshot.domain !== 'shopify.theme') return;

    console.log(`[ShopifyThemeRuntime] Rolling back to snapshot: ${snapshotId}`);
    
    const { themeId, assets } = snapshot.data;
    for (const asset of assets) {
      await this.updateThemeAsset({
        themeId,
        key: asset.key,
        value: asset.value
      });
    }
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[ShopifyThemeRuntime] Event: ${event.type}`);
  }
}
