import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, publishRuntimeEvent, resolveMerchantId } from '@/lib/audit';

const transformProduct = (product: any) => ({
  id: product.id,
  name: product.title,
  sku: product.sku,
  price: product.price,
  stock: product.stock,
  status: product.status === 'Active' ? 'active' : product.status === 'Draft' ? 'draft' : 'archived',
  category: product.category,
  image: product.image || '',
  description: product.description || '',
});

export async function GET(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const products = await prisma.product.findMany({
      where: { merchantId },
    });

    const transformedProducts = products.map(transformProduct);
    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        id: body.id || `PRD-${Date.now()}`,
        title: body.name,
        description: body.description || '',
        price: body.price,
        sku: body.sku,
        category: body.category || 'uncategorized',
        stock: body.stock || 0,
        sales: 0,
        status: body.status === 'active' ? 'Active' : body.status === 'draft' ? 'Draft' : 'Archived',
        image: body.image || '',
        merchantId,
      },
    });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'PRODUCT_CREATED',
      resource: 'Product',
      resourceId: product.id,
      payload: {
        title: product.title,
        sku: product.sku,
        price: product.price,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'PRODUCT_CREATED',
      payload: { productId: product.id, merchantId },
    });

    return NextResponse.json(transformProduct(product));
  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updates: any = {};
    if (body.name) updates.title = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = body.price;
    if (body.stock !== undefined) updates.stock = body.stock;
    if (body.status) updates.status = body.status === 'active' ? 'Active' : body.status === 'draft' ? 'Draft' : 'Archived';
    if (body.category) updates.category = body.category;
    if (body.image) updates.image = body.image;
    if (body.sku) updates.sku = body.sku;

    const product = await prisma.product.update({
      where: { id, merchantId },
      data: updates,
    });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'PRODUCT_UPDATED',
      resource: 'Product',
      resourceId: product.id,
      payload: updates,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'PRODUCT_UPDATED',
      payload: { productId: product.id, updates },
    });

    return NextResponse.json(transformProduct(product));
  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const merchantId = resolveMerchantId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id, merchantId } });

    await createAuditLog({
      userId: request.headers.get('x-user-id') || 'system',
      merchantId,
      action: 'PRODUCT_DELETED',
      resource: 'Product',
      resourceId: id,
      payload: {},
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    await publishRuntimeEvent({
      merchantId,
      eventType: 'PRODUCT_DELETED',
      payload: { productId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
