import { prisma } from '../lib/prisma';

export class CoreProductActionLibrary {
  /**
   * 创建产品
   */
  async create(input: any) {
    console.log('[CoreProductActionLibrary] Creating product:', input);
    
    try {
      const product = await prisma.ec_products.create({
        data: {
          name: input.name,
          slug: input.slug || input.name.toLowerCase().replace(/ /g, '-'),
          description: input.description,
          content: input.content,
          sku: input.sku,
          price: input.price,
          sale_price: input.sale_price,
          images: JSON.stringify(input.images || []),
          status: input.status || 'published',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      return {
        success: true,
        result: {
          id: product.id.toString(),
          name: product.name
        }
      };
    } catch (err: any) {
      console.error('[CoreProductActionLibrary] Create failed:', err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * 更新产品
   */
  async update(id: string, input: any) {
    try {
      const product = await prisma.ec_products.update({
        where: { id: BigInt(id) },
        data: {
          ...input,
          updated_at: new Date(),
        }
      });

      return {
        success: true,
        result: {
          id: product.id.toString(),
          name: product.name
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
