import { RuntimeStore } from '../theme-importer/runtime-core/store';
import { RuntimePatch } from '../theme-importer/runtime-core/patch';
import { ProductRuntime, ProductId, CollectionId } from './types';

export interface ProductActionContext {
  store: RuntimeStore;
  actor: 'ai' | 'user';
}

export class ProductActionLibrary {
  constructor(private context: ProductActionContext) {}

  /**
   * 1. smartSortCollection
   * 按策略排序集合中的商品 (conversion, inventory, margin)
   */
  async smartSortCollection(collectionId: CollectionId, strategy: 'conversion' | 'inventory' | 'margin') {
    const state = this.context.store.getState() as any; // Cast for now, will fix type later
    const productIds = state.relations?.collectionProducts?.[collectionId] || [];
    const products = productIds.map((id: string) => state.products[id]);

    let sortedIds = [...productIds];

    // Mock sorting logic
    if (strategy === 'inventory') {
      sortedIds = products
        .sort((a: any, b: any) => (b.inventory || 0) - (a.inventory || 0))
        .map((p: any) => p.id);
    } else if (strategy === 'margin') {
      sortedIds = products
        .sort((a: any, b: any) => (b.margin || 0) - (a.margin || 0))
        .map((p: any) => p.id);
    }

    const patches: RuntimePatch[] = [
      {
        op: 'replace',
        path: `/relations/collectionProducts/${collectionId}`,
        value: sortedIds,
        scope: 'structure',
        description: `Smart sort collection ${collectionId} by ${strategy}`
      }
    ];

    return patches;
  }

  /**
   * 2. generateProductCopy
   * AI 生成商品文案 (title, description, SEO)
   */
  async generateProductCopy(productId: ProductId, tone: string = 'professional') {
    // In a real system, this would call LLM
    const patches: RuntimePatch[] = [
      {
        op: 'replace',
        path: `/products/${productId}/description`,
        value: `[AI Generated ${tone}] Optimized product description...`,
        scope: 'content'
      },
      {
        op: 'replace',
        path: `/products/${productId}/seo/title`,
        value: `SEO Title for ${productId}`,
        scope: 'content'
      }
    ];

    return patches;
  }

  /**
   * 3. bulkTagProducts
   * 批量打标签
   */
  async bulkTagProducts(productIds: ProductId[], tagRules: { tag: string; condition: string }) {
    const patches: RuntimePatch[] = productIds.map(id => ({
      op: 'add',
      path: `/products/${id}/tags/-`, // JSON Patch append syntax
      value: tagRules.tag,
      scope: 'content'
    }));

    return patches;
  }
}
