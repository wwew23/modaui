import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('[GET /api/audit-logs] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
