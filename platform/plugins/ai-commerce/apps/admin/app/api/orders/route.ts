import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { resolveMerchantId } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const orders = await prisma.order.findMany({
      where: { merchantId },
    });

    const transformedOrders = orders.map(o => ({
      id: o.orderId || o.id,
      customer: o.customerId || 'Unknown',
      email: `${o.customerId || 'user'}@email.com`,
      total: o.amount,
      status: o.status === 'Delivered' ? 'delivered' : 
              o.status === 'Shipped' ? 'shipped' : 
              o.status === 'Processing' ? 'processing' : 
              o.status === 'Delayed' ? 'pending' : 'cancelled',
      items: 1,
      date: o.date,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('[Orders API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
