import { createShopifyAdminClient } from './client';

export const shopifyGraphQL = createShopifyAdminClient();

/**
 * 常用 Shopify GraphQL Fragments
 */
export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    tags
    status
    variants(first: 10) {
      edges {
        node {
          id
          title
          price
          inventoryQuantity
          sku
        }
      }
    }
  }
`;

export const COLLECTION_FRAGMENT = `
  fragment CollectionFields on Collection {
    id
    title
    handle
    productsCount
  }
`;
