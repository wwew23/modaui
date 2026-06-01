import { Database, Merchant, Product, Order, Agent } from './schema';
import { initialSeedData } from './seed';

const STORAGE_KEY = 'adminc_database';

class DatabaseService {
  private db: Database;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.db = this.loadFromStorage();
    if (!this.db.merchants.length) {
      this.db = initialSeedData;
      this.saveToStorage();
    }
  }

  private loadFromStorage(): Database {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load database from storage, using seed data');
    }
    return initialSeedData;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
      this.notifySubscribers();
    } catch (e) {
      console.error('Failed to save database to storage', e);
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(cb => cb());
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getMerchants(): Merchant[] {
    return [...this.db.merchants];
  }

  getMerchantById(id: string): Merchant | undefined {
    return this.db.merchants.find(m => m.id === id);
  }

  addMerchant(merchant: Omit<Merchant, 'createdAt' | 'updatedAt'>): Merchant {
    const now = new Date().toISOString();
    const newMerchant: Merchant = {
      ...merchant,
      createdAt: now,
      updatedAt: now
    };
    this.db.merchants.push(newMerchant);
    this.saveToStorage();
    return newMerchant;
  }

  updateMerchant(id: string, updates: Partial<Omit<Merchant, 'id' | 'createdAt'>>): Merchant | undefined {
    const index = this.db.merchants.findIndex(m => m.id === id);
    if (index !== -1) {
      this.db.merchants[index] = {
        ...this.db.merchants[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
      return this.db.merchants[index];
    }
    return undefined;
  }

  getProducts(merchantId?: string): Product[] {
    if (merchantId) {
      return this.db.products.filter(p => p.merchantId === merchantId);
    }
    return [...this.db.products];
  }

  getOrders(merchantId?: string): Order[] {
    if (merchantId) {
      return this.db.orders.filter(o => o.merchantId === merchantId);
    }
    return [...this.db.orders];
  }

  getAgents(merchantId?: string): Agent[] {
    if (merchantId) {
      return this.db.agents.filter(a => a.merchantId === merchantId || !a.merchantId);
    }
    return [...this.db.agents];
  }

  addProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      createdAt: now,
      updatedAt: now
    };
    this.db.products.push(newProduct);
    this.saveToStorage();
    return newProduct;
  }

  addOrder(order: Omit<Order, 'createdAt'>): Order {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      createdAt: now
    };
    this.db.orders.push(newOrder);
    this.saveToStorage();
    return newOrder;
  }

  reset(): void {
    this.db = { ...initialSeedData };
    this.saveToStorage();
  }

  export(): Database {
    return { ...this.db };
  }
}

export const db = new DatabaseService();
