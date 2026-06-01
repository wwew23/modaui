import { shopify } from './client';

/**
 * Shopify Campaign 原子操作
 */
export const campaignActions = {
  /**
   * 创建基本代码折扣
   */
  async createDiscount(input: any) {
    const query = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeAppDiscount {
            discountId
          }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { basicCodeDiscount: input });
  },

  /**
   * 创建自动折扣
   */
  async createAutomaticDiscount(input: any) {
    const query = `
      mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode {
            id
          }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { automaticBasicDiscount: input });
  },

  /**
   * 建立出版物 (Publication)
   */
  async publishToPublication(publicationId: string, productIds: string[]) {
    const query = `
      mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable { id }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { 
      id: publicationId, 
      input: productIds.map(id => ({ publicationId, publishDate: new Date().toISOString() }))
    });
  }
};
