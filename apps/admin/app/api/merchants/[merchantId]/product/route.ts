import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

/**
 * POST /api/merchants/[merchantId]/product/control
 * 总后台直接控制商家的商品操作
 */
export async function POST(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  try {
    const { merchantId } = params
    const { action, payload } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // 调用 OS API 执行真实操作
    const API_BASE_URL = process.env.OS_API_BASE_URL || 'http://localhost:4000'
    
    const response = await fetch(`${API_BASE_URL}/api/os/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_SYSTEM_TOKEN}`
      },
      body: JSON.stringify({
        domain: 'shopify.product',
        action,
        payload: {
          ...payload,
          shop: merchant.merchantName
        },
        meta: {
          source: 'admin-console',
          merchantId
        }
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'OS API Error', details: result.error },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      planId: result.planId,
      traceId: result.traceId
    })

  } catch (error: any) {
    console.error(`[POST /api/merchants/${params.merchantId}/product] Error:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
