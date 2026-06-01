import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.merchant.count()
  if (existing > 0) {
    console.log('[seed-defaults] merchants already exist, skipping')
    return
  }

  console.log('[seed-defaults] Seeding default merchants...')
  const now = new Date()

  const m1 = await prisma.merchant.create({
    data: {
      name: '极简科技旗舰店',
      merchantName: 'Aero Labs Inc.',
      plan: 'Enterprise',
      aiUsage: '0 / 5M',
      aiUsageNumeric: 0n,
      limitPattern: '0%',
      status: 'active',
      tokenCost: 0,
      createdAt: now,
      updatedAt: now,
    }
  })

  await prisma.subscription.create({
    data: {
      merchantId: m1.id,
      planId: 'Enterprise',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tokenQuota: 5000000n,
      agentQuota: 10,
      storeQuota: 20,
    }
  })

  // add a second sample merchant
  const m2 = await prisma.merchant.create({
    data: {
      name: '潮流服饰专营店',
      merchantName: 'Zane Parker',
      plan: 'Pro',
      aiUsage: '0 / 2M',
      aiUsageNumeric: 0n,
      limitPattern: '0%',
      status: 'active',
      tokenCost: 0,
      createdAt: now,
      updatedAt: now,
    }
  })

  await prisma.subscription.create({
    data: {
      merchantId: m2.id,
      planId: 'Pro',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tokenQuota: 2000000n,
      agentQuota: 5,
      storeQuota: 5,
    }
  })

  console.log('[seed-defaults] Done')
}

main()
  .catch((e) => {
    console.error('[seed-defaults] Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
