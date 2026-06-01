import { Transaction, RuntimeAdapter, RuntimeEvent } from './types';
import { createShopifyAdminClient } from '../shopify/client';
import { snapshotStore } from './snapshot-store';

export class ShopifyProductRuntime implements RuntimeAdapter {
  private shopify = createShopifyAdminClient();

  async applyTransaction(tx: Transaction): Promise<any> {
    console.log(`[ShopifyProductRuntime] Applying transaction: ${tx.type}`, tx.payload);

    switch (tx.type) {
      case 'shopify.product.update':
        return this.updateProduct(tx.payload);
      case 'shopify.product.variants.bulkUpdate':
        return this.bulkUpdateVariants(tx.payload);
      case 'shopify.collection.reorderProducts':
        return this.reorderCollectionProducts(tx.payload);
      case 'shopify.product.tags.update':
        return this.updateProductTags(tx.payload);
      case 'shopify.product.metafields.update':
        return this.updateProductMetafields(tx.payload);
      case 'shopify.inventory.update':
        return this.updateInventory(tx.payload);
      default:
        throw new Error(`Unsupported shopify product transaction type: ${tx.type}`);
    }
  }

  private async updateProduct(payload: { id: string; input: any }) {
    const query = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, { input: { id: payload.id, ...payload.input } });
  }

  private async bulkUpdateVariants(payload: { productId: string; variants: any[] }) {
    const query = `
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product {
            id
          }
          productVariants {
            id
            price
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

  private async reorderCollectionProducts(payload: { collectionId: string; moves: any[] }) {
    const query = `
      mutation collectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
        collectionReorderProducts(id: $id, moves: $moves) {
          job {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, { id: payload.collectionId, moves: payload.moves });
  }

  private async updateProductTags(payload: { id: string; tags: string[] }) {
    const query = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, { input: { id: payload.id, tags: payload.tags } });
  }

  private async updateProductMetafields(payload: { id: string; metafields: any[] }) {
    const query = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            metafields(first: 10) {
              edges {
                node {
                  id
                  key
                  value
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, { input: { id: payload.id, metafields: payload.metafields } });
  }

  private async updateInventory(payload: { inventoryItemId: string; locationId: string; delta: number }) {
    const query = `
      mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
        inventoryAdjustQuantity(input: $input) {
          inventoryLevel {
            id
            available
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return this.shopify(query, {
      input: {
        inventoryItemId: payload.inventoryItemId,
        locationId: payload.locationId,
        availableDelta: payload.delta
      }
    });
  }

  async snapshot(): Promise<any> {
    // For products, we might snapshot the products being modified
    // In a generic adapter, we could store the IDs and their full data
    // This is a mock implementation
    return snapshotStore.save('shopify.product', { products: [] }, 'Before product transaction');
  }

  async rollback(snapshotId: string): Promise<void> {
    const snapshot = await snapshotStore.getById(snapshotId);
    if (!snapshot || snapshot.domain !== 'shopify.product') return;

    console.log(`[ShopifyProductRuntime] Rolling back to snapshot: ${snapshotId}`);
    // Rollback logic for each product in snapshot.data.products
  }

  emitEvent(event: RuntimeEvent): void {
    console.log(`[ShopifyProductRuntime] Event: ${event.type}`);
  }
}
