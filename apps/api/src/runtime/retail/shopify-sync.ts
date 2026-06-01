import { createShopifyClient } from '../shopify/client';
import { prisma } from '../../lib/prisma';
import { emitOsEvent } from '../../os/event-stream';

export class ShopifyRetailSync {
  private shopify = createShopifyClient();

  /**
   * 同步门店库存到 Shopify
   */
  async syncInventoryToShopify(storeInventoryId: string) {
    const inventory = await prisma.storeInventory.findUnique({
      where: { id: storeInventoryId },
      include: { store: true }
    });

    if (!inventory || !inventory.shopifyLocationId || !inventory.shopifyInventoryId) {
      console.warn(`[Retail Sync] No shopify mapping for inventory ${storeInventoryId}`);
      return;
    }

    const query = `
      mutation inventorySet($input: InventorySetInput!) {
        inventorySet(input: $input) {
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

    try {
      await this.shopify(query, {
        input: {
          inventoryItemId: inventory.shopifyInventoryId,
          locationId: inventory.shopifyLocationId,
          available: inventory.stock
        }
      });

      emitOsEvent({
        type: 'inventory.changed',
        payload: {
          storeId: inventory.storeId,
          productId: inventory.productId,
          stock: inventory.stock,
          source: 'retail_runtime'
        }
      });
    } catch (err) {
      console.error(`[Retail Sync] Failed to sync inventory to Shopify:`, err);
    }
  }

  /**
   * 从 Shopify POS 同步订单
   */
  async handlePOSOrder(shop: string, orderData: any) {
    // 假设 orderData 来自 Shopify POS Webhook
    const { id, location_id, total_price, line_items, customer } = orderData;

    // 查找对应门店
    const store = await prisma.store.findFirst({
      where: {
        merchant: { shopDomain: shop },
        inventory: {
          some: { shopifyLocationId: `gid://shopify/Location/${location_id}` }
        }
      }
    });

    if (!store) {
      console.error(`[Retail Sync] No store found for Shopify Location ${location_id}`);
      return;
    }

    const storeOrder = await prisma.storeOrder.create({
      data: {
        storeId: store.id,
        orderId: String(id),
        type: 'walk_in',
        status: 'completed',
        amount: parseFloat(total_price),
        items: line_items,
        customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Walk-in Customer',
      }
    });

    emitOsEvent({
      type: 'pos.order.synced',
      payload: {
        storeId: store.id,
        orderId: storeOrder.id,
        shopifyOrderId: id,
        amount: total_price
      }
    });

    // 自动扣减本地库存 (如果需要)
    for (const item of line_items) {
      if (item.product_id) {
        await prisma.storeInventory.updateMany({
          where: {
            storeId: store.id,
            productId: String(item.product_id)
          },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }
    }
  }
}

export const shopifyRetailSync = new ShopifyRetailSync();
