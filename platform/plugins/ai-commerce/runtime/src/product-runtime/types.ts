export type ProductId = string;
export type CollectionId = string;

export type ProductNode = {
  id: ProductId;
  title: string;
  description: string;
  tags: string[];
  price: number;
  status: 'active' | 'draft';
  hash: {
    content: string;
  };
};

export type CollectionNode = {
  id: CollectionId;
  title: string;
  handle: string;
};

export interface ProductRuntime {
  metadata: {
    revision: number;
    updatedAt: string;
  };
  products: Record<ProductId, ProductNode>;
  collections: Record<CollectionId, CollectionNode>;
  relations: {
    collectionProducts: Record<CollectionId, ProductId[]>;
  };
}
