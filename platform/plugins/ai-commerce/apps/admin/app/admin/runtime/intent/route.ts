import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const merchantId = body.merchantId || 'merchant-001';
    const intent = body.intent?.trim();
    const payload = body.payload || {};

    if (!intent) {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }

    const result = {
      executed: true,
      intent,
      message: `已执行意图：${intent}`,
      payload,
    };

    await prisma.eventLog.create({
      data: {
        merchantId,
        eventType: 'runtime.intent',
        status: 'processed',
        payload: { intent, payload, result },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Admin Runtime Intent] Error:', error);
    return NextResponse.json({ error: 'Unable to execute intent' }, { status: 500 });
  }
}
