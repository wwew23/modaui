import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 [CRITICAL] Purging all data from database. Resetting system to 0...');

  // 按照依赖关系逆序删除，彻底物理清除所有记录
  await prisma.usageMetric.deleteMany();
  await prisma.assistantUsage.deleteMany();
  await prisma.billingRecord.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.storeOrder.deleteMany();
  await prisma.storeInventory.deleteMany();
  await prisma.storeStaff.deleteMany();
  await prisma.store.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.actionTrace.deleteMany();
  await prisma.actionPlan.deleteMany();
  await prisma.merchant.deleteMany();

  console.log('✨ Database is now 100% physically empty. All counters are reset to 0.');
  console.log('🎉 Reset completed!');
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
