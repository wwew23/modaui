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

export async function PATCH(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  const { merchantId } = params
  const body = await request.json()
  const status = body?.status

  if (status !== 'active' && status !== 'suspended') {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  const merchant = await prisma.merchant.update({
    where: { id: merchantId },
    data: { status }
  })

  return NextResponse.json(normalizeMerchant(merchant))
}
