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
  tokenCost: merchant.tokenCost
})

export async function PATCH(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  try {
    // 1. 身份权限校验，仅在生产环境中开启
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { merchantId } = params
    const body = await request.json()
    
    // 2. 严格字段校验：仅提取允许更新的 status 字段
    const status = body?.status

    if (status !== 'active' && status !== 'suspended') {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // 3. 数据库操作增加错误处理与 404 处理
    const merchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { status }
    })

    // 4. 记录审计日志 (从请求头获取真实操作用户ID)
    const userId = request.headers.get('x-user-id') || 'system'
    await createAuditLog({
      userId,
      merchantId: merchant.id,
      action: 'UPDATE_MERCHANT_STATUS',
      resource: 'Merchant',
      resourceId: merchant.id,
      payload: { status }
    })

    // 5. 发送实时事件
    await emitOsEvent({
      type: 'merchant.updated',
      merchantId: merchant.id,
      payload: { status }
    })

    return NextResponse.json(normalizeMerchant(merchant))
  } catch (error: any) {
    console.error(`[PATCH /api/merchants/${params.merchantId}] Error:`, error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  try {
    // 1. 身份权限校验，仅在生产环境中开启
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

    await prisma.merchant.delete({
      where: { id: merchantId }
    })

    // 2. 记录审计日志 (从请求头获取真实操作用户ID)
    const userId = request.headers.get('x-user-id') || 'system'
    await createAuditLog({
      userId,
      merchantId: merchant.id,
      action: 'DELETE_MERCHANT',
      resource: 'Merchant',
      resourceId: merchant.id
    })

    // 3. 发送实时事件
    await emitOsEvent({
      type: 'merchant.deleted',
      merchantId: merchant.id,
      payload: { id: merchantId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`[DELETE /api/merchants/${params.merchantId}] Error:`, error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
