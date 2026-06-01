import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    // 简单查询验证数据库连接
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true })
  } catch (error: any) {
    console.error('[GET /api/health] DB error', error)
    return NextResponse.json({ ok: false, db: false, error: error?.message || String(error) }, { status: 500 })
  }
}
