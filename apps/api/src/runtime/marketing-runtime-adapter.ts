import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { marketingOrchestrator } from './marketing/campaign-orchestrator';
import { campaignsRuntime } from './marketing/campaigns';
import { emailRuntime } from './marketing/email-runtime';
import { snapshotStore } from './snapshot-store';

export class MarketingRuntimeAdapter implements RuntimeAdapter {
  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[MarketingRuntimeAdapter] Applying transaction: ${tx.type}`, tx.payload);

    switch (tx.type) {
      case 'marketing.campaign.create':
      case 'shopify.marketing.campaign.create':
        return campaignsRuntime.createCampaign(tx.payload);

      case 'marketing.optimize':
        return marketingOrchestrator.optimizeCampaigns(tx.payload.shop);

      case 'marketing.email.send':
        return emailRuntime.sendEmailFlow(tx.payload.type, tx.payload.customerId, tx.payload.content);

      case 'marketing.audience.sync':
        return marketingOrchestrator.syncAudiences(tx.payload.shop);

      default:
        throw new Error(`Unsupported marketing transaction type: ${tx.type}`);
    }
  }

  async snapshot(): Promise<any> {
    return snapshotStore.save('marketing', {}, 'Before marketing transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    console.log(`[MarketingRuntimeAdapter] Rolling back snapshot: ${snapshotId}`);
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[MarketingRuntimeAdapter] Marketing Event: ${event.type}`);
  }
}
