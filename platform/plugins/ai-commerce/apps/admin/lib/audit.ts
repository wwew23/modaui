import { prisma } from '@/lib/db/prisma'

export interface CreateAuditParams {
  userId: string
  merchantId: string
  action: string
  resource: string
  resourceId?: string
  payload?: Record<string, unknown>
  ipAddress?: string
}

export async function createAuditLog(params: CreateAuditParams) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      merchantId: params.merchantId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      payload: params.payload ?? {},
      ipAddress: params.ipAddress,
    },
  })
}

export interface PublishEventParams {
  merchantId: string
  eventType: string
  payload: Record<string, unknown>
}

export async function publishRuntimeEvent(params: PublishEventParams) {
  return prisma.eventLog.create({
    data: {
      merchantId: params.merchantId,
      eventType: params.eventType,
      payload: params.payload,
    },
  })
}

export function resolveMerchantId(request: Request) {
  const url = new URL(request.url)
  const merchantId = url.searchParams.get('merchantId') || request.headers.get('x-merchant-id') || process.env.DEFAULT_MERCHANT_ID || 'merchant-001'
  return merchantId
}
