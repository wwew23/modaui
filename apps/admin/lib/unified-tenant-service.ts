import { UnifiedTenant, convertMerchantStoreToUnified, convertTenantToUnified } from './shared-types';
import { MerchantStore } from './types';

export interface TenantDataSyncConfig {
  syncInterval?: number;
  enableLocalStorage?: boolean;
  localStorageKey?: string;
}

const DEFAULT_CONFIG: TenantDataSyncConfig = {
  syncInterval: 30000,
  enableLocalStorage: true,
  localStorageKey: 'unified_tenants_cache'
};

class UnifiedTenantService {
  private tenants: Map<string, UnifiedTenant> = new Map();
  private config: TenantDataSyncConfig;
  private subscribers: Set<(tenants: UnifiedTenant[]) => void> = new Set();

  constructor(config: TenantDataSyncConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (!this.config.enableLocalStorage) return;
    try {
      const stored = localStorage.getItem(this.config.localStorageKey!);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((t: UnifiedTenant) => {
          this.tenants.set(t.id, t);
        });
      }
    } catch (e) {
      console.error('Failed to load tenants from storage:', e);
    }
  }

  private saveToStorage() {
    if (!this.config.enableLocalStorage) return;
    try {
      const data = Array.from(this.tenants.values());
      localStorage.setItem(this.config.localStorageKey!, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save tenants to storage:', e);
    }
  }

  private notifySubscribers() {
    const tenants = this.getAllTenants();
    this.subscribers.forEach(cb => cb(tenants));
  }

  subscribe(callback: (tenants: UnifiedTenant[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getAllTenants(): UnifiedTenant[] {
    return Array.from(this.tenants.values());
  }

  getTenantById(id: string): UnifiedTenant | undefined {
    return this.tenants.get(id);
  }

  addTenant(tenant: UnifiedTenant): void {
    this.tenants.set(tenant.id, tenant);
    this.saveToStorage();
    this.notifySubscribers();
  }

  updateTenant(id: string, updates: Partial<UnifiedTenant>): void {
    const existing = this.tenants.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.tenants.set(id, updated);
      this.saveToStorage();
      this.notifySubscribers();
    }
  }

  deleteTenant(id: string): void {
    this.tenants.delete(id);
    this.saveToStorage();
    this.notifySubscribers();
  }

  importFromMerchantStores(merchants: MerchantStore[]): void {
    merchants.forEach(m => {
      const unified = convertMerchantStoreToUnified(m);
      this.tenants.set(unified.id, unified);
    });
    this.saveToStorage();
    this.notifySubscribers();
  }

  importFromAdminsTenants(tenants: any[]): void {
    tenants.forEach(t => {
      const unified = convertTenantToUnified(t);
      this.tenants.set(unified.id, unified);
    });
    this.saveToStorage();
    this.notifySubscribers();
  }

  clearAll(): void {
    this.tenants.clear();
    this.saveToStorage();
    this.notifySubscribers();
  }
}

export const tenantService = new UnifiedTenantService();

export function useTenantService() {
  return tenantService;
}
