const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const shopDomain = process.env.SHOPIFY_STORE || 'modaui-test-store.myshopify.com';
  
  const merchant = await prisma.merchant.upsert({
    where: { 
      // Using id or a unique field if available, but since we use cuid() we'll just create or find by merchantName
      id: 'real-merchant-id-001' 
    },
    update: {
      merchantName: shopDomain,
      status: 'active',
      limitPattern: 'shopify-native',
    },
    create: {
      id: 'real-merchant-id-001',
      name: 'Real Test Merchant',
      merchantName: shopDomain,
      plan: 'Enterprise',
      aiUsage: '0/10000',
      aiUsageNumeric: 0,
      limitPattern: 'shopify-native',
      status: 'active',
    },
  });

  console.log('Merchant created/updated:', merchant);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
