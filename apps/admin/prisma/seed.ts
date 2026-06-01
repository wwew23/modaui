import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.merchant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.agent.deleteMany();

  const now = new Date();

  const merchant = await prisma.merchant.create({
    data: {
      id: 'merchant-001',
      name: '极简科技旗舰店',
      merchantName: 'Aero Labs Inc.',
      plan: 'Enterprise',
      aiUsage: '3.4M / 5M',
      aiUsageNumeric: 3400000,
      limitPattern: '68%',
      status: 'active',
      tokenCost: 142.20,
    },
  });

  console.log('✅ Merchant created:', merchant.name);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: 'PRD-001',
        title: '智能手表 Pro Max',
        description: '高品质智能手表',
        price: 2999,
        sku: 'SW-PRO-001',
        category: '智能设备',
        stock: 156,
        sales: 0,
        status: 'Active',
        image: '',
        merchantId: merchant.id,
      },
    }),
    prisma.product.create({
      data: {
        id: 'PRD-002',
        title: '无线降噪耳机',
        description: '高品质无线耳机',
        price: 899,
        sku: 'WH-NC-002',
        category: '音频设备',
        stock: 342,
        sales: 0,
        status: 'Active',
        image: '',
        merchantId: merchant.id,
      },
    }),
    prisma.product.create({
      data: {
        id: 'PRD-003',
        title: '便携充电宝 20000mAh',
        description: '大容量充电宝',
        price: 199,
        sku: 'PB-20K-003',
        category: '配件',
        stock: 0,
        sales: 0,
        status: 'Draft',
        image: '',
        merchantId: merchant.id,
      },
    }),
    prisma.product.create({
      data: {
        id: 'PRD-004',
        title: '机械键盘 87键',
        description: '高品质机械键盘',
        price: 599,
        sku: 'KB-87-004',
        category: '外设',
        stock: 89,
        sales: 0,
        status: 'Active',
        image: '',
        merchantId: merchant.id,
      },
    }),
    prisma.product.create({
      data: {
        id: 'PRD-005',
        title: '4K显示器 27英寸',
        description: '高品质显示器',
        price: 2499,
        sku: 'MN-4K27-005',
        category: '显示器',
        stock: 45,
        sales: 0,
        status: 'Active',
        image: '',
        merchantId: merchant.id,
      },
    }),
    prisma.product.create({
      data: {
        id: 'PRD-006',
        title: '人体工学椅',
        description: '舒适人体工学椅',
        price: 1899,
        sku: 'CH-ERG-006',
        category: '办公家具',
        stock: 23,
        sales: 0,
        status: 'Archived',
        image: '',
        merchantId: merchant.id,
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        id: 'ORD-001',
        orderId: 'ORD-9921',
        customerId: '张伟',
        status: 'Delivered',
        amount: 3898,
        date: '2024-01-15',
        city: '上海',
        merchantId: merchant.id,
      },
    }),
    prisma.order.create({
      data: {
        id: 'ORD-002',
        orderId: 'ORD-9920',
        customerId: '李娜',
        status: 'Shipped',
        amount: 899,
        date: '2024-01-15',
        city: '北京',
        merchantId: merchant.id,
      },
    }),
    prisma.order.create({
      data: {
        id: 'ORD-003',
        orderId: 'ORD-9919',
        customerId: '王芳',
        status: 'Processing',
        amount: 5497,
        date: '2024-01-14',
        city: '广州',
        merchantId: merchant.id,
      },
    }),
    prisma.order.create({
      data: {
        id: 'ORD-004',
        orderId: 'ORD-9918',
        customerId: '刘强',
        status: 'Delivered',
        amount: 199,
        date: '2024-01-13',
        city: '深圳',
        merchantId: merchant.id,
      },
    }),
    prisma.order.create({
      data: {
        id: 'ORD-005',
        orderId: 'ORD-9917',
        customerId: '陈静',
        status: 'Delayed',
        amount: 2999,
        date: '2024-01-12',
        city: '杭州',
        merchantId: merchant.id,
      },
    }),
  ]);

  console.log('✅ Orders created:', orders.length);

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        id: 'CUS-001',
        name: '张伟',
        email: 'zhang.wei@email.com',
        orders: 12,
        spent: 25680,
        lastOrder: '2024-01-15',
        status: 'active',
        merchantId: merchant.id,
      },
    }),
    prisma.customer.create({
      data: {
        id: 'CUS-002',
        name: '李娜',
        email: 'li.na@email.com',
        orders: 8,
        spent: 12450,
        lastOrder: '2024-01-15',
        status: 'active',
        merchantId: merchant.id,
      },
    }),
    prisma.customer.create({
      data: {
        id: 'CUS-003',
        name: '王芳',
        email: 'wang.fang@email.com',
        orders: 23,
        spent: 45890,
        lastOrder: '2024-01-14',
        status: 'active',
        merchantId: merchant.id,
      },
    }),
    prisma.customer.create({
      data: {
        id: 'CUS-004',
        name: '刘强',
        email: 'liu.qiang@email.com',
        orders: 3,
        spent: 2890,
        lastOrder: '2024-01-13',
        status: 'inactive',
        merchantId: merchant.id,
      },
    }),
  ]);

  console.log('✅ Customers created:', customers.length);

  const discounts = await Promise.all([
    prisma.discount.create({
      data: {
        id: 'DSC-001',
        code: 'SUMMER2024',
        type: 'percentage',
        value: 20,
        usageCount: 156,
        usageLimit: 500,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        merchantId: merchant.id,
      },
    }),
    prisma.discount.create({
      data: {
        id: 'DSC-002',
        code: 'NEWUSER50',
        type: 'fixed',
        value: 50,
        usageCount: 89,
        usageLimit: 1000,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        merchantId: merchant.id,
      },
    }),
    prisma.discount.create({
      data: {
        id: 'DSC-003',
        code: 'VIP15OFF',
        type: 'percentage',
        value: 15,
        usageCount: 45,
        usageLimit: 100,
        status: 'expired',
        startDate: '2023-12-01',
        endDate: '2023-12-31',
        merchantId: merchant.id,
      },
    }),
  ]);

  console.log('✅ Discounts created:', discounts.length);

  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        id: 'agent-001',
        name: '客服助理',
        displayName: '客服助理',
        status: 'idle',
        model: 'gemini-2.5-flash',
        taskCount: 12580,
        memory: '45MB',
        tools: JSON.stringify(['chat', 'search', 'ticket']),
      },
    }),
  ]);

  console.log('✅ Agents created:', agents.length);
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
