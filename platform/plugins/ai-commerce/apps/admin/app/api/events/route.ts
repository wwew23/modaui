import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { resolveMerchantId } from '@/lib/audit'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const merchantId = url.searchParams.get('merchantId')
    
    const where: any = {}
    if (merchantId) {
      where.merchantId = merchantId
    }

    const events = await prisma.eventLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('[Events API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
