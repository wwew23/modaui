import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { shopify } from './shopify/client';
import { snapshotStore } from './snapshot-store';
import { campaignActions } from './shopify/campaign';

export class CampaignRuntimeAdapter implements RuntimeAdapter {
  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[CampaignRuntimeAdapter] Applying transaction: ${tx.type}`, tx.payload);

    let res: any;
    switch (tx.type) {
      case 'shopify.campaign.discount.create':
      case 'campaign.discount.create':
        res = await campaignActions.createDiscount(tx.payload.input || tx.payload.basicCodeDiscount);
        break;
      
      case 'shopify.campaign.automaticDiscount.create':
      case 'campaign.automaticDiscount.create':
        res = await campaignActions.createAutomaticDiscount(tx.payload.input || tx.payload.automaticBasicDiscount);
        break;

      case 'shopify.campaign.publish':
        res = await campaignActions.publishToPublication(tx.payload.publicationId, tx.payload.productIds);
        break;
      
      case 'shopify.campaign.publish.schedule':
        res = await shopify(`
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id publishedAt }
              userErrors { field message }
            }
          }
        `, { input: { id: tx.payload.id, publishedAt: tx.payload.publishDate } });
        break;

      case 'shopify.campaign.activate':
        const results = [];
        for (const action of tx.payload.actions) {
          results.push(await this.applyTransaction(action));
        }
        return results;

      default:
        throw new Error(`Unsupported shopify campaign transaction type: ${tx.type}`);
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

  async snapshot(): Promise<any> {
    return snapshotStore.save('shopify.campaign', { activeCampaigns: [] }, 'Before campaign transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    const snapshot = await snapshotStore.getById(snapshotId);
    if (!snapshot || snapshot.domain !== 'shopify.campaign') return;

    console.log(`[CampaignRuntimeAdapter] Rolling back to snapshot: ${snapshotId}`);
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[CampaignRuntimeAdapter] Event: ${event.type}`);
  }
}
