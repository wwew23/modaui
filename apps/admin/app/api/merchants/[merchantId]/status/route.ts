import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createAuditLog } from '@/lib/audit'
import { emitOsEvent } from '@/lib/events'

const normalizeMerchant = (merchant: any) => ({
  id: merchant.id,
  name: merchant.name,
  merchantName: merchant.merchantName,
  plan: merchant.plan as 'Starter' | 'Pro' | 'Enterprise',
  aiUsage: merchant.aiUsage,
  limitPattern: merchant.limitPattern,
  status: merchant.status as 'active' | 'suspended',
  tokenCost: merchant.tokenCost,
})

export async function POST(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { merchantId } = params
    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const nextStatus = merchant.status === 'active' ? 'suspended' : 'active'

    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { status: nextStatus }
    })

    const userId = request.headers.get('x-user-id') || 'system'
    await createAuditLog({
      userId,
      merchantId: updatedMerchant.id,
      action: 'TOGGLE_MERCHANT_STATUS',
      resource: 'Merchant',
      resourceId: updatedMerchant.id,
      payload: { status: nextStatus }
    })

    await emitOsEvent({
      type: 'merchant.updated',
      merchantId: updatedMerchant.id,
      payload: { status: nextStatus }
    })

    return NextResponse.json(normalizeMerchant(updatedMerchant))
  } catch (error: any) {
    console.error(`[POST /api/merchants/${params.merchantId}/status] Error:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
