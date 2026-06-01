import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { v4 as uuidv4 } from 'uuid';
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
  apiKey: merchant.apiKey,
  tenantId: merchant.tenantId
})

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(merchants.map(normalizeMerchant))
  } catch (error: any) {
    console.error('[GET /api/merchants] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Require auth in production to avoid accidental public creation
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json();
    const { name, merchantName, shopDomain, plan } = body;

    if (!name || !merchantName) {
      return NextResponse.json({ error: 'Name and Merchant Name are required' }, { status: 400 });
    }

    // 商户创建全流程：Tenant, Shop, API Keys 生成与初始化
    const result = await prisma.$transaction(async (tx) => {
      const apiKey = `os_${uuidv4().replace(/-/g, '')}`;
      const tenantId = `tenant_${uuidv4().split('-')[0]}`;

      const merchant = await tx.merchant.create({
        data: {
          name,
          merchantName,
          shopDomain,
          plan: plan || 'Starter',
          apiKey,
          tenantId,
          aiUsage: plan === 'Enterprise' ? '0 / 5M' : plan === 'Pro' ? '0 / 2M' : '0 / 500K',
          limitPattern: '0%',
        } as any
      });

      // 初始化订阅 (Subscription)
      const tokenQuota = plan === 'Enterprise' ? 5000000n : plan === 'Pro' ? 2000000n : 500000n;
      const agentQuota = plan === 'Enterprise' ? 10 : plan === 'Pro' ? 5 : 2;
      const storeQuota = plan === 'Enterprise' ? 20 : plan === 'Pro' ? 5 : 1;

      await (tx as any).subscription.create({
        data: {
          merchantId: merchant.id,
          planId: plan || 'Starter',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          tokenQuota,
          agentQuota,
          storeQuota,
        }
      });

      return merchant;
    });

    // 记录审计与发事件
    const userId = request.headers.get('x-user-id') || 'system'
    await createAuditLog({
      userId,
      merchantId: result.id,
      action: 'CREATE_MERCHANT',
      resource: 'Merchant',
      resourceId: result.id,
      payload: { name: result.name, merchantName: result.merchantName }
    })

    await emitOsEvent({ type: 'merchant.created', merchantId: result.id, payload: { id: result.id } })

    return NextResponse.json(normalizeMerchant(result));
  } catch (error: any) {
    console.error('[POST /api/merchants] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
