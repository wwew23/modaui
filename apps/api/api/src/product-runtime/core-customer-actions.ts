import { prisma } from '../lib/prisma';

export class CoreCustomerActionLibrary {
  /**
   * 创建客户
   */
  async create(input: any) {
    try {
      const customer = await prisma.ec_customers.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          password: input.password || '12345678', // Default password if not provided
          status: input.status || 'activated',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      return {
        success: true,
        result: {
          id: customer.id.toString(),
          name: customer.name
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 查找客户
   */
  async findByEmail(email: string) {
    try {
      const customer = await prisma.ec_customers.findFirst({
        where: { email }
      });
      return { success: true, result: customer };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
