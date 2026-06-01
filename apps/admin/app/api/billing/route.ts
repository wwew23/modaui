import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    // 获取账单趋势 (UsageMetrics)
    const usageMetrics = await prisma.usageMetric.findMany({
      where: { merchantId },
      orderBy: { timestamp: 'asc' },
    });

    // 简单聚合逻辑：按月统计 token 消耗（模拟费用计算）
    const trendsMap = new Map();
    usageMetrics.forEach(metric => {
      const month = metric.timestamp.toISOString().substring(0, 7);
      const current = trendsMap.get(month) || 0;
      trendsMap.set(month, current + (metric.value || 0));
    });

    const trends = Array.from(trendsMap.entries()).map(([month, value]) => ({
      month,
      amount: value * 0.0001, // 模拟计费率
    }));

    // 获取历史账单 (BillingRecords)
    const billingRecords = await prisma.billingRecord.findMany({
      where: { merchantId },
      orderBy: { periodStart: 'desc' },
    });

    return NextResponse.json({
      trends,
      invoices: billingRecords.map(record => ({
        id: record.id,
        date: record.periodStart.toISOString().split('T')[0],
        amount: record.amount,
        status: record.status,
      })),
    });
  } catch (error) {
    console.error('[Billing API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}
