import { prisma } from '../lib/prisma';

export class CoreOrderActionLibrary {
  /**
   * 创建订单 (简版)
   */
  async create(input: any) {
    try {
      const order = await prisma.ec_orders.create({
        data: {
          amount: input.amount || 0,
          sub_total: input.sub_total || input.amount || 0,
          status: input.status || 'pending',
          user_id: input.user_id ? BigInt(input.user_id) : null,
          description: input.description,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      return {
        success: true,
        result: {
          id: order.id.toString(),
          status: order.status
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 更新订单状态
   */
  async updateStatus(id: string, status: string) {
    try {
      await prisma.ec_orders.update({
        where: { id: BigInt(id) },
        data: { status, updated_at: new Date() }
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
