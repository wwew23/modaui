export interface Merchant {
  id: string;
  name: string;
  merchantName: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  aiUsage: string;
  aiUsageNumeric: number;
  limitPattern: string;
  status: 'active' | 'suspended';
  tokenCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  stock: number;
  sales: number;
  status: 'Active' | 'Draft' | 'Archived';
  image: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Delayed' | 'Refunded';
  amount: number;
  date: string;
  city: string;
  merchantId: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  status: 'idle' | 'executing' | 'paused' | 'error';
  model: string;
  taskCount: number;
  memory: string;
  tools: string[];
  merchantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  merchants: Merchant[];
  products: Product[];
  orders: Order[];
  agents: Agent[];
}
