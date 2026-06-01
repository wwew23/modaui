import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';

/**
 * ProductRuntimeAdapter
 * 给现有产品系统包一层 Runtime Adapter
 */
export class ProductRuntimeAdapter implements RuntimeAdapter {
  constructor(private productActions: any) {}

  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[ProductRuntimeAdapter] Applying transaction: ${tx.type}`, tx.payload);
    
    switch (tx.type) {
      case 'product.sort':
        return this.productActions.smartSortCollection(tx.payload.collectionId, tx.payload.strategy);
      
      case 'product.copy.generate':
        return this.productActions.generateProductCopy(tx.payload.productId, tx.payload.tone);
      
      case 'product.tag.bulk':
        return this.productActions.bulkTagProducts(tx.payload.productIds, tx.payload.tagRules);

      default:
        throw new Error(`Unsupported product transaction type: ${tx.type}`);
    }
  }

  async snapshot(): Promise<any> {
    return {
      id: `prod-snap-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  async rollback(snapshotId: string): Promise<void> {
    console.log(`[ProductRuntimeAdapter] Rolling back to snapshot: ${snapshotId}`);
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[ProductRuntimeAdapter] Emitting event: ${event.type}`, event.payload);
  }
}
