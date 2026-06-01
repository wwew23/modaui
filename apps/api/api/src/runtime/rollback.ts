import { snapshotStore } from './snapshot-store';
import { ShopifyRuntimeFactory } from './shopify-runtime-factory';

export class RollbackManager {
  private shopifyTheme = ShopifyRuntimeFactory.create('theme');
  private shopifyProduct = ShopifyRuntimeFactory.create('product');
  private shopifyCampaign = ShopifyRuntimeFactory.create('campaign');

  async rollback(domain: string, snapshotId: string) {
    console.log(`[Rollback] Attempting rollback for domain=${domain}, snapshotId=${snapshotId}`);
    
    const snapshot = await snapshotStore.getById(domain, snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found for domain ${domain}`);
    }

    if (domain.startsWith('shopify.')) {
      const shopifyDomain = domain.split('.')[1] as 'theme' | 'product' | 'campaign';
      const runtime = this.getShopifyRuntime(shopifyDomain);
      await runtime.rollback(snapshotId);
    } else {
      // Internal store rollback logic would go here
      console.log(`Internal rollback for ${domain} not implemented in this mock`);
    }

    return { success: true, domain, snapshotId };
  }

  private getShopifyRuntime(domain: 'theme' | 'product' | 'campaign') {
    switch (domain) {
      case 'theme': return this.shopifyTheme;
      case 'product': return this.shopifyProduct;
      case 'campaign': return this.shopifyCampaign;
      default: throw new Error(`Unknown shopify domain: ${domain}`);
    }
  }
}

export const rollbackManager = new RollbackManager();
