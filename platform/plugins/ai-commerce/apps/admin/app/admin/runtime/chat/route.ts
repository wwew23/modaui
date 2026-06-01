import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const merchantId = body.merchantId || 'merchant-001';
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const reply = `已收到消息：${message}`;

    await prisma.eventLog.create({
      data: {
        merchantId,
        eventType: 'runtime.chat',
        status: 'processed',
        payload: { message, reply },
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[Admin Runtime Chat] Error:', error);
    return NextResponse.json({ error: 'Unable to process chat message' }, { status: 500 });
  }
}
