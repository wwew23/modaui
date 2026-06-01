import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/prisma';

export async function GET(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  const { merchantId } = params;

  const stores = await prisma.store.findMany({
    where: { merchantId },
    include: {
      staff: true,
      inventory: true,
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return NextResponse.json({ stores });
}

export async function POST(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  const { merchantId } = params;
  const body = await request.json();

  const store = await prisma.store.create({
    data: {
      ...body,
      merchantId
    }
  });

  return NextResponse.json(store);
}
