import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { createShopifyAdminClient } from '../shopify/client';
import { snapshotStore } from './snapshot-store';

export class ShopifyCampaignRuntime implements RuntimeAdapter {
  private shopify = createShopifyAdminClient();

  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[ShopifyCampaignRuntime] Applying transaction: ${tx.type}`, tx.payload);

    switch (tx.type) {
      case 'shopify.campaign.discount.create':
        return this.createDiscount(tx.payload);
      case 'shopify.campaign.automaticDiscount.create':
        return this.createAutomaticDiscount(tx.payload);
      case 'shopify.campaign.publish.schedule':
        return this.schedulePublish(tx.payload);
      case 'shopify.campaign.activate':
        return this.activateCampaign(tx.payload);
      default:
        throw new Error(`Unsupported shopify campaign transaction type: ${tx.type}`);
    }
  }

  private async createDiscount(payload: { basicCodeDiscount: any }) {
    const query = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeAppDiscount {
            discountId
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, payload);
  }

  private async createAutomaticDiscount(payload: { automaticBasicDiscount: any }) {
    const query = `
      mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, payload);
  }

  private async schedulePublish(payload: { id: string; publishDate: string }) {
    const query = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            publishedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, { input: { id: payload.id, publishedAt: payload.publishDate } });
  }

  private async activateCampaign(payload: { campaignId: string; actions: Transaction[] }) {
    console.log(`Activating campaign ${payload.campaignId} with ${payload.actions.length} actions`);
    const results = [];
    for (const action of payload.actions) {
      results.push(await this.applyTransaction(action));
    }
    return results;
  }

  async snapshot(): Promise<any> {
    return snapshotStore.save('shopify.campaign', { activeCampaigns: [] }, 'Before campaign transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    const snapshot = await snapshotStore.getById(snapshotId);
    if (!snapshot || snapshot.domain !== 'shopify.campaign') return;

    console.log(`[ShopifyCampaignRuntime] Rolling back to snapshot: ${snapshotId}`);
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[ShopifyCampaignRuntime] Event: ${event.type}`);
  }
}
