import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

/**
 * POST /api/merchants/[merchantId]/theme/control
 * 总后台直接控制商家的主题操作
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

    // 1. 验证商家权限
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    if (merchant.status !== 'active') {
      return NextResponse.json({ error: 'Merchant is not active' }, { status: 403 })
    }

    // 2. 调用 OS API 执行真实操作
    // 注意：这里需要根据实际环境配置 API_BASE_URL
    const API_BASE_URL = process.env.OS_API_BASE_URL || 'http://localhost:4000'
    
    const response = await fetch(`${API_BASE_URL}/api/os/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 这里的 Auth 应该是系统内部的 Secret 或者 Admin 的 Token
        'Authorization': `Bearer ${process.env.INTERNAL_SYSTEM_TOKEN}`
      },
      body: JSON.stringify({
        domain: 'shopify.theme',
        action,
        payload: {
          ...payload,
          shop: merchant.merchantName // 确保操作的是正确的店铺
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
      traceId: result.traceId,
      message: `Action ${action} dispatched to merchant ${merchantId}`
    })

  } catch (error: any) {
    console.error(`[POST /api/merchants/${params.merchantId}/theme] Error:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
