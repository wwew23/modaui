import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, publishRuntimeEvent, resolveMerchantId } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const customers = await prisma.customer.findMany({ where: { merchantId } });
    return NextResponse.json(customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      orders: c.orders,
      spent: c.spent,
      lastOrder: c.lastOrder,
      status: c.status,
    })));
  } catch (error) {
    console.error('[Customers API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: {
        id: body.id || `CUST-${Date.now()}`,
        name: body.name,
        email: body.email,
        orders: body.orders ?? 0,
        spent: body.spent ?? 0,
        lastOrder: body.lastOrder ?? new Date().toISOString().split('T')[0],
        status: body.status ?? 'active',
        merchantId,
      },
    });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'CUSTOMER_CREATED',
      resource: 'Customer',
      resourceId: customer.id,
      payload: { name: customer.name, email: customer.email },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'CUSTOMER_CREATED',
      payload: { customerId: customer.id, merchantId },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('[Customers API] Error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
