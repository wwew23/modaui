import { prisma } from '../../lib/prisma';
import { emitOsEvent } from '../../os/event-stream';

/**
 * ShopifyIngressService
 * 负责处理来自 Shopify Webhooks 的原始数据并摄取到本地 CommerceOS 数据库
 */
export class ShopifyIngressService {
  /**
   * handleWebhook
   * 核心摄取逻辑：Topic -> DB -> Stream
   */
  async handleWebhook(topic: string, shop: string, payload: any) {
    console.log(`[Shopify Ingress] Processing ${topic} for ${shop}`);

    // 1. 查找商户租户
    const merchant = await prisma.merchant.findFirst({
      where: { shopDomain: shop }
    });

    if (!merchant) {
      console.warn(`[Shopify Ingress] No merchant found for shop: ${shop}`);
      return;
    }

    // 2. 写入 EventLog (原始审计)
    const event = await prisma.eventLog.create({
      data: {
        merchantId: merchant.id,
        eventType: topic,
        payload: payload,
        status: 'created'
      }
    });

    try {
      // 3. 业务数据持久化
      switch (topic) {
        case 'orders/create':
          await this.ingestOrder(merchant.id, payload);
          break;
        
        case 'products/create':
        case 'products/update':
          await this.ingestProduct(merchant.id, payload);
          break;
        
        case 'customers/create':
          await this.ingestCustomer(merchant.id, payload);
          break;
      }

      // 4. 更新事件状态
      await prisma.eventLog.update({
        where: { id: event.id },
        data: { status: 'processed', processedAt: new Date() }
      });

      // 5. 广播实时流
      emitOsEvent({
        type: `shopify:${topic.replace('/', '.')}`,
        merchantId: merchant.id,
        payload: {
          id: payload.id,
          source: 'shopify',
          timestamp: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error(`[Shopify Ingress] Failed to process ${topic}:`, err);
      await prisma.eventLog.update({
        where: { id: event.id },
        data: { status: 'failed' }
      });
    }
  }

  private async ingestOrder(merchantId: string, payload: any) {
    return await prisma.order.upsert({
      where: { id: `shopify_${payload.id}` },
      update: {
        amount: parseFloat(payload.total_price),
        status: 'Delivered',
        date: new Date(payload.created_at).toISOString().split('T')[0]
      },
      create: {
        id: `shopify_${payload.id}`,
        orderId: String(payload.order_number || payload.id),
        customerId: payload.customer?.email || 'Guest',
        amount: parseFloat(payload.total_price),
        status: 'Delivered',
        date: new Date(payload.created_at).toISOString().split('T')[0],
        city: payload.shipping_address?.city || 'Online',
        merchantId: merchantId
      }
    });
  }

  private async ingestProduct(merchantId: string, payload: any) {
    return await prisma.product.upsert({
      where: { id: `shopify_${payload.id}` },
      update: {
        title: payload.title,
        description: payload.body_html || '',
        price: parseFloat(payload.variants?.[0]?.price || '0'),
        sku: payload.variants?.[0]?.sku || '',
        stock: payload.variants?.[0]?.inventory_quantity || 0,
      },
      create: {
        id: `shopify_${payload.id}`,
        title: payload.title,
        description: payload.body_html || '',
        price: parseFloat(payload.variants?.[0]?.price || '0'),
        sku: payload.variants?.[0]?.sku || '',
        stock: payload.variants?.[0]?.inventory_quantity || 0,
        category: payload.product_type || 'General',
        merchantId: merchantId
      }
    });
  }

  private async ingestCustomer(merchantId: string, payload: any) {
    return await prisma.customer.upsert({
      where: { id: `shopify_${payload.id}` },
      update: {
        name: `${payload.first_name || ''} ${payload.last_name || ''}`.trim(),
        email: payload.email,
        status: 'active'
      },
      create: {
        id: `shopify_${payload.id}`,
        name: `${payload.first_name || ''} ${payload.last_name || ''}`.trim(),
        email: payload.email,
        status: 'active',
        merchantId: merchantId,
        orders: payload.orders_count || 0,
        spent: parseFloat(payload.total_spent || '0'),
        lastOrder: payload.last_order_id ? String(payload.last_order_id) : undefined
      }
    });
  }
}

export const shopifyIngress = new ShopifyIngressService();
