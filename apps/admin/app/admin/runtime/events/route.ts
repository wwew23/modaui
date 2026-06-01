import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const events = await prisma.eventLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      events.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        status: event.status,
        payload: event.payload,
        createdAt: event.createdAt,
      }))
    );
  } catch (error) {
    console.error('[Admin Runtime Events] Error:', error);
    return NextResponse.json({ error: 'Unable to load runtime events' }, { status: 500 });
  }
}
