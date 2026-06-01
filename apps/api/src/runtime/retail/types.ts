export interface StoreInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface StaffInfo {
  id?: string;
  storeId: string;
  name: string;
  email?: string;
  role: 'manager' | 'staff';
  status: 'active' | 'inactive';
}

export interface InventoryInfo {
  storeId: string;
  productId: string;
  sku: string;
  stock: number;
  shopifyLocationId?: string;
  shopifyInventoryId?: string;
}

export interface StoreOrderInfo {
  id?: string;
  storeId: string;
  orderId?: string;
  type: 'walk_in' | 'pickup' | 'delivery';
  status: 'completed' | 'pending' | 'cancelled';
  amount: number;
  items: any;
  customerName?: string;
  pickupEta?: Date;
}

export interface MapEngine {
  searchNearbyStores(lat: number, lng: number, radius: number): Promise<StoreInfo[]>;
  getInventory(productId: string, lat: number, lng: number): Promise<any>;
  calculateDistance(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }): Promise<number>;
  estimatePickupEta(storeId: string, orderId: string): Promise<Date>;
}
