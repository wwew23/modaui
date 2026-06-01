import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const normalizeMerchant = (merchant: any) => ({
  id: merchant.id,
  name: merchant.name,
  merchantName: merchant.merchantName,
  plan: merchant.plan as 'Starter' | 'Pro' | 'Enterprise',
  aiUsage: merchant.aiUsage,
  limitPattern: merchant.limitPattern,
  status: merchant.status as 'active' | 'suspended',
  tokenCost: merchant.tokenCost
})

export async function GET() {
  const merchants = await prisma.merchant.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
  return NextResponse.json(merchants.map(normalizeMerchant))
}
