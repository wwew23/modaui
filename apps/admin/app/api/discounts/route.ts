import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, publishRuntimeEvent, resolveMerchantId } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const discounts = await prisma.discount.findMany({ where: { merchantId } });
    return NextResponse.json(discounts);
  } catch (error) {
    console.error('[Discounts API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const body = await request.json();
    const newDiscount = await prisma.discount.create({
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        usageCount: 0,
        usageLimit: body.usageLimit,
        status: 'active',
        startDate: body.startDate,
        endDate: body.endDate,
        merchantId,
      },
    });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'DISCOUNT_CREATED',
      resource: 'Discount',
      resourceId: newDiscount.id,
      payload: { code: newDiscount.code, value: newDiscount.value },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'DISCOUNT_CREATED',
      payload: { discountId: newDiscount.id, merchantId },
    });

    return NextResponse.json(newDiscount);
  } catch (error) {
    console.error('[Discounts API] Error:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        usageCount: body.usageCount,
        usageLimit: body.usageLimit,
        status: body.status,
        startDate: body.startDate,
        endDate: body.endDate,
      },
    });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'DISCOUNT_UPDATED',
      resource: 'Discount',
      resourceId: id,
      payload: body,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'DISCOUNT_UPDATED',
      payload: { discountId: id, updates: body },
    });

    return NextResponse.json(updatedDiscount);
  } catch (error) {
    console.error('[Discounts API] Error:', error);
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    await prisma.discount.delete({ where: { id } });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'DISCOUNT_DELETED',
      resource: 'Discount',
      resourceId: id,
      payload: {},
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'DISCOUNT_DELETED',
      payload: { discountId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Discounts API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
  }
}
