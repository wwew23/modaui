import { StoreInfo, MapEngine } from './types';
import { prisma } from '../../lib/prisma';

const REAL_DATA_ONLY = process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true'

export class MapService implements MapEngine {
  private engine: 'google' | 'amap' = 'amap'; // Default to AMap for China

  setEngine(engine: 'google' | 'amap') {
    this.engine = engine;
  }

  async searchNearbyStores(lat: number, lng: number, radius: number = 10000): Promise<any[]> {
    // 实际生产中这里会调用 Google/AMap API 进行空间索引查询
    // 这里使用 Prisma 的原始查询模拟
    const stores = await prisma.store.findMany({
      where: {
        status: 'active'
      }
    });

    // 简单的勾股定理过滤 (近似)
    return stores.filter(store => {
      if (!store.latitude || !store.longitude) return false;
      const distance = Math.sqrt(
        Math.pow(store.latitude - lat, 2) + Math.pow(store.longitude - lng, 2)
      );
      return distance < (radius / 111320); // 粗略转换
    });
  }

  async getInventory(productId: string, lat: number, lng: number): Promise<any> {
    const stores = await this.searchNearbyStores(lat, lng);
    const storeIds = stores.map(s => s.id);

    return await prisma.storeInventory.findMany({
      where: {
        productId,
        storeId: { in: storeIds },
        stock: { gt: 0 }
      },
      include: {
        store: true
      }
    });
  }

  async calculateDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<number> {
    if (REAL_DATA_ONLY) {
      throw new Error('REAL DATA ONLY MODE VIOLATION: calculateDistance attempted to use mocked return value')
    }

    if (this.engine === 'google') {
      // Call Google Distance Matrix API
      // TODO: implement real call
      return 5.5;
    } else {
      // Call AMap Distance API
      // TODO: implement real call
      return 5.2;
    }
  }

  async estimatePickupEta(storeId: string, orderId: string): Promise<Date> {
    // 根据门店繁忙程度和距离预估
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // 默认 30 分钟
    return now;
  }
}

export const mapService = new MapService();
