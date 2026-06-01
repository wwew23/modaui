import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';

/**
 * CampaignRuntimeAdapter
 * 给现有营销系统包一层 Runtime Adapter
 */
export class CampaignRuntimeAdapter implements RuntimeAdapter {
  constructor(private campaignActions: any) {}

  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[CampaignRuntimeAdapter] Applying transaction: ${tx.type}`, tx.payload);
    
    switch (tx.type) {
      case 'campaign.flash-sale.activate':
        return this.campaignActions.activateFlashSale({
          campaignId: tx.payload.campaignId,
          discountPercent: tx.payload.discountPercent,
          primaryColor: tx.payload.primaryColor,
          bannerText: tx.payload.bannerText
        });

      default:
        throw new Error(`Unsupported campaign transaction type: ${tx.type}`);
    }
  }

  async snapshot(): Promise<any> {
    return {
      id: `camp-snap-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  async rollback(snapshotId: string): Promise<void> {
    console.log(`[CampaignRuntimeAdapter] Rolling back to snapshot: ${snapshotId}`);
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[CampaignRuntimeAdapter] Emitting event: ${event.type}`, event.payload);
  }
}
