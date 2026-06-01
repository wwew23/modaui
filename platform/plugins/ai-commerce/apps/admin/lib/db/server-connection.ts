import { Database, Merchant, Product, Order, Agent } from './schema';
import { initialSeedData } from './seed';

const REAL_DATA_ONLY = process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true' || process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true';

if (REAL_DATA_ONLY) {
  throw new Error('REAL_DATA_ONLY active — in-memory server DB is disabled');
}

// Non-production mode: Initialize with seed data
let db: Database = { ...initialSeedData };

class ServerDatabaseService {
  getMerchants(): Merchant[] {
    return [...db.merchants];
  }

  getMerchantById(id: string): Merchant | undefined {
    return db.merchants.find(m => m.id === id);
  }

  addMerchant(merchant: Omit<Merchant, 'createdAt' | 'updatedAt'>): Merchant {
    const now = new Date().toISOString();
    const newMerchant: Merchant = {
      ...merchant,
      createdAt: now,
      updatedAt: now
    };
    db.merchants.push(newMerchant);
    return newMerchant;
  }

  updateMerchant(id: string, updates: Partial<Omit<Merchant, 'id' | 'createdAt'>>): Merchant | undefined {
    const index = db.merchants.findIndex(m => m.id === id);
    if (index !== -1) {
      db.merchants[index] = {
        ...db.merchants[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return db.merchants[index];
    }
    return undefined;
  }

  getProducts(merchantId?: string): Product[] {
    if (merchantId) {
      return db.products.filter(p => p.merchantId === merchantId);
    }
    return [...db.products];
  }

  getOrders(merchantId?: string): Order[] {
    if (merchantId) {
      return db.orders.filter(o => o.merchantId === merchantId);
    }
    return [...db.orders];
  }

  getAgents(merchantId?: string): Agent[] {
    if (merchantId) {
      return db.agents.filter(a => a.merchantId === merchantId || !a.merchantId);
    }
    return [...db.agents];
  }

  addProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      createdAt: now,
      updatedAt: now
    };
    db.products.push(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | undefined {
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      db.products[index] = {
        ...db.products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return db.products[index];
    }
    return undefined;
  }

  deleteProduct(id: string): boolean {
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      db.products.splice(index, 1);
      return true;
    }
    return false;
  }

  addOrder(order: Omit<Order, 'createdAt'>): Order {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      createdAt: now
    };
    db.orders.push(newOrder);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | undefined {
    const index = db.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      db.orders[index] = {
        ...db.orders[index],
        ...updates
      };
      return db.orders[index];
    }
    return undefined;
  }

  reset(): void {
    // REAL_DATA_ONLY: Cannot reset to seed data
    db = { merchants: [], products: [], orders: [], agents: [] };
  }

  export(): Database {
    return { ...db };
  }
}

export const serverDb = new ServerDatabaseService();
