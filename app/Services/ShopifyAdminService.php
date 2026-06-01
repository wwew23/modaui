<?php

namespace App\Services;

use App\Models\Shop;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopifyAdminService
{
    /**
     * Get shop by domain
     */
    public function getShop(string $shopDomain): ?Shop
    {
        // Normalize domain
        if (!str_contains($shopDomain, '.myshopify.com')) {
            $shopDomain .= '.myshopify.com';
        }

        return Shop::where('shop_domain', $shopDomain)->first();
    }

    /**
     * Call Shopify Admin GraphQL API
     */
    public function callGraphql(string $shopDomain, string $query, array $variables = []): array
    {
        $shop = $this->getShop($shopDomain);
        
        if (!$shop || !$shop->access_token) {
            // Fallback for demo/test if no shop found in DB
            if (app()->environment('local')) {
                return $this->mockGraphqlResponse($query, $variables);
            }
            throw new \RuntimeException("Shop {$shopDomain} not found or access token missing.");
        }

        $apiVersion = config('services.shopify.api_version', '2024-04');
        $url = "https://{$shop->shop_domain}/admin/api/{$apiVersion}/graphql.json";

        try {
            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $shop->access_token,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post($url, [
                'query' => $query,
                'variables' => $variables,
            ]);

            if ($response->failed()) {
                Log::error('Shopify API Request Failed', [
                    'shop' => $shopDomain,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \RuntimeException('Shopify API error: ' . $response->status());
            }

            $body = $response->json();
            if (isset($body['errors'])) {
                Log::error('Shopify GraphQL Errors', [
                    'shop' => $shopDomain,
                    'errors' => $body['errors']
                ]);
                throw new \RuntimeException('Shopify GraphQL errors detected.');
            }

            return $body['data'] ?? [];
        } catch (\Throwable $e) {
            Log::error('Shopify Admin Service Error', [
                'message' => $e->getMessage(),
                'shop' => $shopDomain
            ]);
            throw $e;
        }
    }

    /**
     * Get product details
     */
    public function getProduct(string $shopDomain, string $productId): ?array
    {
        $query = <<<'GRAPHQL'
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            descriptionHtml
            tags
            variants(first: 10) {
              nodes {
                id
                price
                sku
              }
            }
          }
        }
GRAPHQL;

        // Ensure GID format
        if (!str_contains($productId, 'gid://')) {
            $productId = "gid://shopify/Product/{$productId}";
        }

        $data = $this->callGraphql($shopDomain, $query, ['id' => $productId]);
        return $data['product'] ?? null;
    }

    /**
     * Update product
     */
    public function updateProduct(string $shopDomain, string $productId, array $input): array
    {
        $query = <<<'GRAPHQL'
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
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
GRAPHQL;

        if (!str_contains($productId, 'gid://')) {
            $productId = "gid://shopify/Product/{$productId}";
        }
        
        $input['id'] = $productId;

        return $this->callGraphql($shopDomain, $query, ['input' => $input]);
    }

    public function createProduct(string $shopDomain, array $input): array
    {
        $query = <<<'GRAPHQL'
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              descriptionHtml
            }
            userErrors {
              field
              message
            }
          }
        }
GRAPHQL;

        return $this->callGraphql($shopDomain, $query, ['input' => $input]);
    }

    public function createCollection(string $shopDomain, array $input): array
    {
        $query = <<<'GRAPHQL'
        mutation collectionCreate($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
GRAPHQL;

        return $this->callGraphql($shopDomain, $query, ['input' => $input]);
    }

    public function updateCollection(string $shopDomain, string $collectionId, array $input): array
    {
        if (!str_contains($collectionId, 'gid://')) {
            $collectionId = "gid://shopify/Collection/{$collectionId}";
        }

        $query = <<<'GRAPHQL'
        mutation collectionUpdate($input: CollectionInput!) {
          collectionUpdate(input: $input) {
            collection {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
GRAPHQL;

        $input['id'] = $collectionId;
        return $this->callGraphql($shopDomain, $query, ['input' => $input]);
    }

    public function createDiscountCode(string $shopDomain, array $input): array
    {
        $query = <<<'GRAPHQL'
        mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            discountCodeBasic {
              code
              id
            }
            userErrors {
              field
              message
            }
          }
        }
GRAPHQL;

        return $this->callGraphql($shopDomain, $query, ['basicCodeDiscount' => $input]);
    }

    public function getOrder(string $shopDomain, string $orderId): array
    {
        $query = <<<'GRAPHQL'
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            name
            email
            totalPrice
            currencyCode
            financialStatus
            fulfillmentStatus
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
GRAPHQL;

        if (!str_contains($orderId, 'gid://')) {
            $orderId = "gid://shopify/Order/{$orderId}";
        }

        return $this->callGraphql($shopDomain, $query, ['id' => $orderId]);
    }

    public function getDraftOrder(string $shopDomain, string $draftOrderId): array
    {
        $query = <<<'GRAPHQL'
        query GetDraftOrder($id: ID!) {
          draftOrder(id: $id) {
            id
            name
            email
            totalPrice
            currencyCode
            invoiceUrl
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
GRAPHQL;

        if (!str_contains($draftOrderId, 'gid://')) {
            $draftOrderId = "gid://shopify/DraftOrder/{$draftOrderId}";
        }

        return $this->callGraphql($shopDomain, $query, ['id' => $draftOrderId]);
    }

    public function checkDomainAvailability(string $domain): array
    {
        $query = <<<'GRAPHQL'
        query CheckDomainAvailability($domain: String!) {
          domainAvailability(domain: $domain) {
            status
            suggestedDomains
          }
        }
GRAPHQL;

        try {
            return $this->callGraphql($this->getDefaultShopDomain(), $query, ['domain' => $domain]);
        } catch (\Throwable $e) {
            return [
                'domain' => $domain,
                'available' => !str_contains($domain, '.myshopify.com'),
                'status' => 'unknown',
                'message' => '无法直接调用 Shopify 域名可用性接口，已返回安全提示。',
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function getDefaultShopDomain(): string
    {
        $shop = $this->getShop(config('ai.default_shop_domain', ''));
        return $shop?->shop_domain ?? '';
    }

    /**
     * Mock response for local development
     */
    protected function mockGraphqlResponse(string $query, array $variables): array
    {
        if (str_contains($query, 'query GetProduct')) {
            return [
                'product' => [
                    'id' => $variables['id'],
                    'title' => 'Sample Shopify Product',
                    'descriptionHtml' => '<p>This is a sample product description from mock API.</p>',
                    'tags' => ['Mock', 'Test'],
                    'variants' => ['nodes' => [['id' => 'v1', 'price' => '19.99', 'sku' => 'MOCK-SKU']]]
                ]
            ];
        }
        
        return [];
    }
}
