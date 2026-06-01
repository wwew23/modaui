import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const activeAgents = await prisma.agent.count({
      where: { status: { in: ['executing', 'active'] } },
    });

    const totalTasks = await prisma.actionPlan.count();
    const recentEvents = await prisma.eventLog.count({
      where: {
        createdAt: {
          gt: new Date(Date.now() - 1000 * 60 * 60),
        },
      },
    });

    return NextResponse.json({
      status: 'running',
      activeAgents,
      totalTasks,
      recentEvents,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Admin Runtime Status] Error:', error);
    return NextResponse.json({ error: 'Unable to load runtime status' }, { status: 500 });
  }
}
