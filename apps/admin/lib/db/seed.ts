import { Database } from './schema';

const now = new Date().toISOString();

export const initialSeedData: Database = {
  merchants: [
    {
      id: 'MRCH-901',
      name: '极简科技旗舰店',
      merchantName: 'Aero Labs Inc.',
      plan: 'Enterprise',
      aiUsage: '3.4M / 5M',
      aiUsageNumeric: 3400000,
      limitPattern: '68%',
      status: 'active',
      tokenCost: 142.20,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'MRCH-902',
      name: '潮流服饰专营店',
      merchantName: 'Zane Parker',
      plan: 'Pro',
      aiUsage: '1.8M / 2M',
      aiUsageNumeric: 1800000,
      limitPattern: '90%',
      status: 'active',
      tokenCost: 64.12,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'MRCH-903',
      name: '简约家居生活馆',
      merchantName: 'Sarah K.',
      plan: 'Starter',
      aiUsage: '450K / 500K',
      aiUsageNumeric: 450000,
      limitPattern: '90%',
      status: 'active',
      tokenCost: 18.00,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'MRCH-904',
      name: '数码配件专卖店',
      merchantName: 'Takashi N.',
      plan: 'Pro',
      aiUsage: '1.2M / 2M',
      aiUsageNumeric: 1200000,
      limitPattern: '60%',
      status: 'active',
      tokenCost: 48.00,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'MRCH-905',
      name: '户外运动装备店',
      merchantName: 'Elena Rostova',
      plan: 'Starter',
      aiUsage: '520K / 500K',
      aiUsageNumeric: 520000,
      limitPattern: '超限',
      status: 'suspended',
      tokenCost: 24.50,
      createdAt: now,
      updatedAt: now
    }
  ],
  products: [
    {
      id: 'PROD-001',
      title: '北欧极简橡木台灯',
      description: '简约设计，温暖光线，适合现代家居',
      price: 299,
      sku: 'LAMP-001',
      category: '家居',
      stock: 45,
      sales: 128,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      merchantId: 'MRCH-903',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'PROD-002',
      title: '苹果铝合金高度可调支架',
      description: '适用于MacBook和显示器的优雅支架',
      price: 599,
      sku: 'STAND-002',
      category: '数码配件',
      stock: 23,
      sales: 87,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
      merchantId: 'MRCH-904',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'PROD-003',
      title: '人体工学网眼办公椅',
      description: '舒适透气，长时间办公必备',
      price: 1299,
      sku: 'CHAIR-003',
      category: '办公',
      stock: 15,
      sales: 56,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
      merchantId: 'MRCH-901',
      createdAt: now,
      updatedAt: now
    }
  ],
  orders: [
    {
      id: 'ORD-001',
      orderId: 'ORD-2024-0527-001',
      customerId: 'CUST-001',
      status: 'Delivered',
      amount: 299,
      date: '2024-05-25',
      city: '上海',
      merchantId: 'MRCH-903',
      createdAt: now
    },
    {
      id: 'ORD-002',
      orderId: 'ORD-2024-0527-002',
      customerId: 'CUST-002',
      status: 'Shipped',
      amount: 599,
      date: '2024-05-26',
      city: '北京',
      merchantId: 'MRCH-904',
      createdAt: now
    },
    {
      id: 'ORD-003',
      orderId: 'ORD-2024-0527-003',
      customerId: 'CUST-003',
      status: 'Processing',
      amount: 1299,
      date: '2024-05-27',
      city: '深圳',
      merchantId: 'MRCH-901',
      createdAt: now
    }
  ],
  agents: [
    {
      id: 'marketing-agent',
      name: 'marketing',
      displayName: '营销助理',
      status: 'idle',
      model: 'gemini-2.5-flash',
      taskCount: 142,
      memory: '14.2 MB',
      tools: ['create-discount-code', 'generate-copywriting', 'simulate-ctr', 'send-newsletter'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'support-agent',
      name: 'support',
      displayName: '客服助理',
      status: 'executing',
      model: 'gemini-2.5-pro',
      taskCount: 389,
      memory: '28.9 MB',
      tools: ['retrieve-tickets', 'analyze-sentiment', 'draft-response', 'escalate-to-human'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'product-agent',
      name: 'product',
      displayName: '商品助理',
      status: 'idle',
      model: 'gemini-2.8-ultra',
      taskCount: 94,
      memory: '42.1 MB',
      tools: ['scrape-supplier-catalog', 'auto-generate-tags', 'optimize-images', 'sync-inventory'],
      createdAt: now,
      updatedAt: now
    }
  ]
};
