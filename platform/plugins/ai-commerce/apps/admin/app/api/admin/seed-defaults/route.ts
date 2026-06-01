import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    // Allow local/dev triggering without auth, but require auth in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const existing = await prisma.merchant.count()
    if (existing > 0) {
      return NextResponse.json({ ok: true, message: 'merchants already exist, skipping' })
    }

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

    return NextResponse.json({ ok: true, message: 'seed applied' })
  } catch (error: any) {
    console.error('[seed-defaults API] Error:', error)
    return NextResponse.json({ error: 'Failed to apply seed', details: error.message }, { status: 500 })
  }
}
