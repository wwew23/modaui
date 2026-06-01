import { shopify } from './client';

/**
 * Shopify Product 原子操作
 */
export const productActions = {
  /**
   * 更新产品基本信息
   */
  async update(id: string, input: any) {
    const query = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            status
            tags
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return shopify(query, { input: { id, ...input } });
  },

  /**
   * 创建产品
   */
  async create(input: any) {
    const query = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return shopify(query, { input });
  },

  /**
   * 删除产品
   */
  async delete(id: string) {
    const query = `
      mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;
    return shopify(query, { input: { id } });
  },

  /**
   * 批量更新变体
   */
  async bulkUpdateVariants(productId: string, variants: any[]) {
    const query = `
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product { id }
          productVariants { id title price inventoryQuantity }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { productId, variants });
  },

  /**
   * 集合产品重排
   */
  async reorderCollection(collectionId: string, moves: any[]) {
    const query = `
      mutation collectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
        collectionReorderProducts(id: $id, moves: $moves) {
          job { id }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { id: collectionId, moves });
  },

  /**
   * 创建集合
   */
  async createCollection(input: any) {
    const query = `
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id title }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { input });
  },

  /**
   * 库存调整
   */
  async adjustInventory(inventoryItemId: string, locationId: string, delta: number) {
    const query = `
      mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
        inventoryAdjustQuantity(input: $input) {
          inventoryLevel {
            id
            available
          }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, {
      input: {
        inventoryItemId,
        locationId,
        availableDelta: delta
      }
    });
  },

  /**
   * 更新 Metafields
   */
  async updateMetafields(metafields: any[]) {
    const query = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    return shopify(query, { metafields });
  },

  /**
   * 创建/更新 Metaobject
   */
  async upsertMetaobject(handle: { type: string; handle: string }, fields: any[]) {
    const query = `
      mutation metaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
        metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
          metaobject { id handle }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { handle, metaobject: { fields } });
  },

  /**
   * 运行批量操作
   */
  async runBulkOperation(stagedUploadPath: string) {
    const query = `
      mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
        bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) {
          bulkOperation { id status }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { stagedUploadPath });
  },

  /**
   * 更新自动集合规则
   */
  async updateCollectionRules(id: string, rules: any[]) {
    const query = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection { id title }
          userErrors { field message }
        }
      }
    `;
    return shopify(query, { input: { id, ruleSet: { rules } } });
  }
};
