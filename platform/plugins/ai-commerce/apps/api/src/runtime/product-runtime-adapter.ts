import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { shopify } from './shopify/client';
import { snapshotStore } from './snapshot-store';
import { productActions } from './shopify/product';

export class ProductRuntimeAdapter implements RuntimeAdapter {
  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[ProductRuntimeAdapter] Applying transaction: ${tx.type}`, tx.payload);

    let res: any;
    switch (tx.type) {
      case 'shopify.product.update':
      case 'product.update':
        res = await productActions.update(tx.payload.id, tx.payload.input);
        break;

      case 'shopify.product.create':
      case 'product.create':
        res = await productActions.create(tx.payload.input);
        break;

      case 'shopify.product.delete':
      case 'product.delete':
        res = await productActions.delete(tx.payload.id);
        break;
      
      case 'shopify.product.variants.bulkUpdate':
      case 'product.variants.bulkUpdate':
        res = await productActions.bulkUpdateVariants(tx.payload.productId || tx.payload.id, tx.payload.variants);
        break;
      
      case 'shopify.collection.reorderProducts':
      case 'collection.reorder':
        res = await productActions.reorderCollection(tx.payload.collectionId, tx.payload.moves);
        break;

      case 'shopify.collection.create':
        res = await productActions.createCollection(tx.payload.input);
        break;
      
      case 'shopify.inventory.update':
      case 'inventory.adjust':
        res = await productActions.adjustInventory(tx.payload.inventoryItemId, tx.payload.locationId, tx.payload.delta);
        break;

      case 'shopify.product.metafields.update':
      case 'product.metafields.update':
        if (tx.payload.id && tx.payload.metafields) {
           res = await productActions.update(tx.payload.id, { metafields: tx.payload.metafields });
        } else {
           res = await productActions.updateMetafields(tx.payload.metafields);
        }
        break;

      case 'shopify.product.tags.update':
        res = await productActions.update(tx.payload.id, { tags: tx.payload.tags });
        break;

      case 'shopify.product.status.update':
        res = await productActions.update(tx.payload.id, { status: tx.payload.status });
        break;

      case 'shopify.metaobject.upsert':
        res = await productActions.upsertMetaobject(tx.payload.handle, tx.payload.fields);
        break;

      case 'shopify.bulk.run':
        res = await productActions.runBulkOperation(tx.payload.stagedUploadPath);
        break;

      case 'shopify.collection.updateRules':
        res = await productActions.updateCollectionRules(tx.payload.id, tx.payload.rules);
        break;

      default:
        throw new Error(`Unsupported shopify product transaction type: ${tx.type}`);
    }

    this.checkUserErrors(res);
    return res;
  }

  private checkUserErrors(res: any) {
    if (!res) return;
    
    // Shopify mutations usually return data in a field named after the mutation
    const mutationName = Object.keys(res)[0];
    const mutationResult = res[mutationName];
    
    if (mutationResult && mutationResult.userErrors && mutationResult.userErrors.length > 0) {
      const errors = mutationResult.userErrors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Shopify User Error [${mutationName}]: ${errors}`);
    }
  }

  async snapshot(): Promise<any> {
    // 基础实现：返回一个空快照，真实快照在 applyTransaction 中根据具体 ID 按需生成
    return snapshotStore.save('shopify.product', { products: {} }, 'Before product transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    const snapshot = await snapshotStore.getById(snapshotId);
    if (!snapshot || snapshot.domain !== 'shopify.product') return;

    console.log(`[ProductRuntimeAdapter] Rolling back to snapshot: ${snapshotId}`);
    
    const { products } = snapshot.data;
    for (const id of Object.keys(products)) {
      const originalData = products[id];
      console.log(`[ProductRuntimeAdapter] Restoring product ${id}...`);
      await productActions.update(id, originalData);
    }
  }

  /**
   * 从 Shopify 同步数据到本地
   */
  async syncFromShopify(shop?: string): Promise<any> {
    const query = `
      query getProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              status
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    price
                    inventoryQuantity
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data = await shopify(query, {}, shop);
    // TODO: 将数据写入本地 RuntimeStore
    console.log(`[ProductRuntimeAdapter] Synced ${data.products.edges.length} products`);
    return data.products;
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[ProductRuntimeAdapter] Event: ${event.type}`);
  }
}
