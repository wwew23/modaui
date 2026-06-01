import { shopify } from './client';

/**
 * Shopify Theme 原子操作
 */
export const themeActions = {
  /**
   * 更新主题资源 (Asset)
   */
  async updateAsset(themeId: string, key: string, value: string) {
    return (shopify as any).rest(`themes/${themeId}/assets.json`, {
      method: 'PUT',
      body: JSON.stringify({
        asset: { key, value }
      })
    });
  },

  /**
   * 发布主题
   */
  async publish(themeId: string) {
    const query = `
      mutation themePublish($id: ID!) {
        themePublish(id: $id) {
          theme {
            id
            role
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return shopify(query, { id: themeId });
  },

  /**
   * 更新主题信息 (如名称)
   */
  async updateTheme(themeId: string, input: any) {
    const query = `
      mutation themeUpdate($id: ID!, $input: ThemeInput!) {
        themeUpdate(id: $id, input: $input) {
          theme { id name }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { id: themeId, input });
  },

  /**
   * 删除资源 (Asset)
   */
  async deleteAsset(themeId: string, key: string) {
    return (shopify as any).rest(`themes/${themeId}/assets.json?asset[key]=${key}`, {
      method: 'DELETE'
    });
  },

  /**
   * 获取主题资源
   */
  async getAsset(themeId: string, key: string) {
    const data = await (shopify as any).rest(`themes/${themeId}/assets.json?asset[key]=${key}`);
    return data.asset;
  }
};
