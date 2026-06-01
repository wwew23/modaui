import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/merchants/[merchantId]/runtime
 * 获取商家的实时运行时状态
 */
export async function GET(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  try {
    const { merchantId } = params
    
    // 1. 从数据库获取商家基本信息
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // 2. 模拟/获取实时运行时指标 (在真实生产环境中，这里会请求 apps/api 的监控端点)
    // 目前根据 merchant 的配置返回“真实”的状态
    const runtimeState = {
      merchantId,
      status: merchant.status,
      shopify: {
        connected: !!merchant.limitPattern, // 假设有 limitPattern 代表已接入
        store: merchant.merchantName,
        apiVersion: '2026-01',
      },
      os: {
        version: 'v1.2.0-native',
        uptime: '48h 12m',
        activeAgents: ['marketing-agent', 'theme-agent'],
        lastActionAt: new Date().toISOString(),
      },
      usage: {
        aiTasksToday: merchant.aiUsage,
        tokenCostTotal: merchant.tokenCost,
        quotaLimit: merchant.plan === 'Enterprise' ? 10000 : 1000,
      }
    }

    return NextResponse.json(runtimeState)
  } catch (error: any) {
    console.error(`[GET /api/merchants/${params.merchantId}/runtime] Error:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
