import { prisma } from '../../lib/prisma';
import { StoreInfo, StaffInfo, InventoryInfo, StoreOrderInfo } from './types';

export class StoreRuntime {
  /**
   * Store CRUD
   */
  async createStore(merchantId: string, data: StoreInfo) {
    return await prisma.store.create({
      data: {
        ...data,
        merchantId,
      },
    });
  }

  async getStore(id: string) {
    return await prisma.store.findUnique({
      where: { id },
      include: {
        staff: true,
        inventory: true,
      },
    });
  }

  async updateStore(id: string, data: Partial<StoreInfo>) {
    return await prisma.store.update({
      where: { id },
      data,
    });
  }

  async deleteStore(id: string) {
    return await prisma.store.delete({
      where: { id },
    });
  }

  async listStores(merchantId: string) {
    return await prisma.store.findMany({
      where: { merchantId },
      include: {
        staff: true,
        inventory: true,
      },
    });
  }

  /**
   * Staff Management
   */
  async addStaff(storeId: string, staff: StaffInfo) {
    return await prisma.storeStaff.create({
      data: {
        ...staff,
        storeId,
      },
    });
  }

  async removeStaff(staffId: string) {
    return await prisma.storeStaff.delete({
      where: { id: staffId },
    });
  }

  /**
   * Inventory Management
   */
  async updateInventory(storeId: string, productId: string, stock: number) {
    return await prisma.storeInventory.upsert({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
      update: { stock },
      create: {
        storeId,
        productId,
        sku: '', // Should be fetched from product service
        stock,
      },
    });
  }

  /**
   * Order Management
   */
  async createStoreOrder(order: StoreOrderInfo) {
    return await prisma.storeOrder.create({
      data: {
        ...order,
      },
    });
  }
}

export const storeRuntime = new StoreRuntime();
