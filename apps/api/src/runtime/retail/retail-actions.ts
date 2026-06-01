import { prisma } from '../../lib/prisma';
import { emitOsEvent } from '../../os/event-stream';
import { shopifyRetailSync } from './shopify-sync';

export class RetailActionLibrary {
  /**
   * 1. transferInventory
   * "把北京店库存调到上海"
   */
  async transferInventory(input: { fromStoreId: string; toStoreId: string; productId: string; quantity: number }) {
    const { fromStoreId, toStoreId, productId, quantity } = input;

    // Use a transaction for atomic transfer
    return await prisma.$transaction(async (tx) => {
      // 1. Decrement source store
      const from = await tx.storeInventory.update({
        where: { storeId_productId: { storeId: fromStoreId, productId } },
        data: { stock: { decrement: quantity } }
      });

      // 2. Increment target store
      const to = await tx.storeInventory.upsert({
        where: { storeId_productId: { storeId: toStoreId, productId } },
        update: { stock: { increment: quantity } },
        create: {
          storeId: toStoreId,
          productId,
          sku: from.sku,
          stock: quantity
        }
      });

      emitOsEvent({
        type: 'inventory.changed',
        payload: {
          productId,
          transfers: [
            { storeId: fromStoreId, delta: -quantity },
            { storeId: toStoreId, delta: quantity }
          ]
        }
      });

      // 3. Sync to Shopify if needed
      await shopifyRetailSync.syncInventoryToShopify(from.id);
      await shopifyRetailSync.syncInventoryToShopify(to.id);

      return { success: true, from, to };
    });
  }

  /**
   * 2. closeStore
   * "关闭低销量门店"
   */
  async closeStore(input: { storeId: string }) {
    const { storeId } = input;
    const store = await prisma.store.update({
      where: { id: storeId },
      data: { status: 'inactive' }
    });

    emitOsEvent({
      type: 'store.updated',
      payload: { storeId, status: 'inactive' }
    });

    return { success: true, store };
  }

  /**
   * 3. runPromotion
   * "给广州店做活动"
   */
  async runPromotion(input: { storeId: string; promotionType: string; discount: number }) {
    // In a real system, this would create a local promotion record or sync with Shopify Discounts
    emitOsEvent({
      type: 'store.updated',
      payload: { storeId: input.storeId, event: 'promotion_started', data: input }
    });
    return { success: true };
  }

  /**
   * 4. syncOrders
   * "同步线下订单"
   */
  async syncOrders(input: { storeId?: string }) {
    // Force a sync from POS
    emitOsEvent({
      type: 'pos.order.synced',
      payload: { storeId: input.storeId, status: 'sync_requested' }
    });
    return { success: true };
  }
}

export const retailActionLibrary = new RetailActionLibrary();
