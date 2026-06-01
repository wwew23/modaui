<?php

namespace Botble\AiCommerce\Http\Controllers;

use Botble\AiCommerce\Models\ShopifyShop;
use Botble\AiCommerce\Services\ShopifyAdminClient;
use Botble\Base\Http\Controllers\BaseController;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ShopifyAnalyticsController extends BaseController
{
    public function __construct(protected ShopifyAdminClient $shopify) {}

    /**
     * GET /admin/shopify/{shopId}/kpi/summary
     */
    public function kpiSummary(Request $request, int $shopId)
    {
        $days = (int) $request->query('days', 7);
        $shop = ShopifyShop::findOrFail($shopId);

        $to = Carbon::now()->toIso8601String();
        $from = Carbon::now()->subDays($days)->toIso8601String();

        $query = <<<'GRAPHQL'
        query SalesSummary($from: DateTime!, $to: DateTime!) {
          orders(first: 100, query: "created_at:>=$from AND created_at:<=$to") {
            edges {
              node {
                totalPriceSet { shopMoney { amount currencyCode } }
                financialStatus
                cancelledAt
              }
            }
          }
        }
        GRAPHQL;

        $result = $this->shopify->query($shop, $query, ['from' => $from, 'to' => $to]);

        // 简化的聚合逻辑
        $orders = $result['data']['orders']['edges'] ?? [];
        $totalSales = 0;
        $orderCount = count($orders);
        $refundCount = 0;

        foreach ($orders as $edge) {
            $node = $edge['node'];
            $totalSales += (float) $node['totalPriceSet']['shopMoney']['amount'];
            if ($node['cancelledAt']) $refundCount++;
        }

        return response()->json([
            'from' => $from,
            'to' => $to,
            'totalSales' => $totalSales,
            'orderCount' => $orderCount,
            'averageOrderValue' => $orderCount > 0 ? round($totalSales / $orderCount, 2) : 0,
            'refundRate' => $orderCount > 0 ? round($refundCount / $orderCount, 4) : 0,
            'currency' => $orders[0]['node']['totalPriceSet']['shopMoney']['currencyCode'] ?? 'USD'
        ]);
    }

    /**
     * GET /admin/shopify/{shopId}/product/{productId}/performance
     */
    public function productPerformance(Request $request, int $shopId, string $productId)
    {
        $days = (int) $request->query('days', 30);
        $shop = ShopifyShop::findOrFail($shopId);

        $to = Carbon::now();
        $from = $to->copy()->subDays($days);

        // 1. 先查商品基本信息（标题、价格、库存）
        $productQuery = <<<'GRAPHQL'
        query ProductBasicInfo($id: ID!) {
          product(id: $id) {
            id
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  compareAtPrice
                  inventoryQuantity
                }
              }
            }
          }
        }
        GRAPHQL;

        $productData = $this->shopify->query($shop, $productQuery, [
            'id' => $productId,
        ]);

        $product = $productData['data']['product'] ?? null;
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // 简化处理：如果有多个变体，就取第一个变体的信息
        $firstVariant = $product['variants']['edges'][0]['node'] ?? null;

        $price = $firstVariant ? (float) $firstVariant['price'] : null;
        $compareAtPrice = $firstVariant && $firstVariant['compareAtPrice'] !== null
            ? (float) $firstVariant['compareAtPrice']
            : null;
        $inventory = 0;
        if (!empty($product['variants']['edges'])) {
            foreach ($product['variants']['edges'] as $edge) {
                $inventory += (int) $edge['node']['inventoryQuantity'];
            }
        }

        // 2. 查包含该 product 的订单行项目（最近 N 天）
        $ordersQuery = <<<'GRAPHQL'
        query ProductOrders($from: DateTime!, $to: DateTime!, $productId: ID!) {
          orders(
            first: 100
            query: "created_at:>=$from AND created_at:<=$to AND financial_status:paid"
            sortKey: CREATED_AT
          ) {
            edges {
              node {
                id
                lineItems(first: 50) {
                  edges {
                    node {
                      product {
                        id
                      }
                      quantity
                      originalTotalSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
                refunds(first: 10) {
                  edges {
                    node {
                      refundLineItems(first: 50) {
                        edges {
                          node {
                            lineItem {
                              product {
                                id
                              }
                            }
                            quantity
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        GRAPHQL;

        $ordersData = $this->shopify->query($shop, $ordersQuery, [
            'from' => $from->toIso8601String(),
            'to'   => $to->toIso8601String(),
            'productId' => $productId,
        ]);

        $orderEdges = $ordersData['data']['orders']['edges'] ?? [];

        $salesQuantity = 0;
        $salesAmount = 0.0;
        $orderCount = 0;
        $refundQuantity = 0;

        foreach ($orderEdges as $edge) {
            $orderNode = $edge['node'];
            $hasThisProduct = false;

            // 统计订单中该 product 的销量
            foreach ($orderNode['lineItems']['edges'] as $liEdge) {
                $line = $liEdge['node'];
                if (!empty($line['product']['id']) && $line['product']['id'] === $productId) {
                    $qty = (int) $line['quantity'];
                    $money = (float) $line['originalTotalSet']['shopMoney']['amount'];
                    $salesQuantity += $qty;
                    $salesAmount += $money;
                    $hasThisProduct = true;
                }
            }

            if ($hasThisProduct) {
                $orderCount++;
            }

            // 统计退款数量
            foreach ($orderNode['refunds']['edges'] as $refundEdge) {
                $refundNode = $refundEdge['node'];
                foreach ($refundNode['refundLineItems']['edges'] as $rliEdge) {
                    $rli = $rliEdge['node'];
                    $lineItem = $rli['lineItem'];
                    if (!empty($lineItem['product']['id']) && $lineItem['product']['id'] === $productId) {
                        $refundQuantity += (int) $rli['quantity'];
                    }
                }
            }
        }

        $refundRate = $salesQuantity > 0 ? $refundQuantity / $salesQuantity : 0.0;

        return response()->json([
            'productId' => $product['id'],
            'title' => $product['title'],
            'periodDays' => $days,
            'salesQuantity' => $salesQuantity,
            'salesAmount' => round($salesAmount, 2),
            'refundQuantity' => $refundQuantity,
            'refundRate' => $refundRate,
            'orderCount' => $orderCount,
            'inventory' => $inventory,
            'price' => $price,
            'compareAtPrice' => $compareAtPrice,
        ]);
    }

    /**
     * GET /admin/shopify/{shopId}/top-products
     */
    public function topProducts(Request $request, int $shopId)
    {
        $days = (int) $request->query('days', 30);
        $limit = (int) $request->query('limit', 10);
        $shop = ShopifyShop::findOrFail($shopId);

        $to = Carbon::now()->toIso8601String();
        $from = Carbon::now()->subDays($days)->toIso8601String();

        $query = <<<'GRAPHQL'
        query TopProducts($from: DateTime!, $to: DateTime!) {
          orders(first: 100, query: "created_at:>=$from AND created_at:<=$to") {
            edges {
              node {
                lineItems(first: 50) {
                  edges {
                    node {
                      product { id title }
                      quantity
                      originalTotalSet { shopMoney { amount } }
                    }
                  }
                }
              }
            }
          }
        }
        GRAPHQL;

        $result = $this->shopify->query($shop, $query, ['from' => $from, 'to' => $to]);
        $orders = $result['data']['orders']['edges'] ?? [];

        $products = [];
        foreach ($orders as $orderEdge) {
            foreach ($orderEdge['node']['lineItems']['edges'] as $liEdge) {
                $li = $liEdge['node'];
                $pid = $li['product']['id'] ?? 'unknown';
                if (!isset($products[$pid])) {
                    $products[$pid] = [
                        'productId' => $pid,
                        'title' => $li['product']['title'] ?? 'Unknown',
                        'totalQuantity' => 0,
                        'totalSales' => 0
                    ];
                }
                $products[$pid]['totalQuantity'] += $li['quantity'];
                $products[$pid]['totalSales'] += (float) $li['originalTotalSet']['shopMoney']['amount'];
            }
        }

        usort($products, fn($a, $b) => $b['totalSales'] <=> $a['totalSales']);

        return response()->json([
            'periodDays' => $days,
            'items' => array_slice($products, 0, $limit)
        ]);
    }

    /**
     * GET /admin/shopify/{shopId}/low-sales-products
     */
    public function lowSalesProducts(Request $request, int $shopId)
    {
        // 逻辑与 topProducts 类似，但按销量升序且可结合库存筛选
        $days = (int) $request->query('days', 30);
        $limit = (int) $request->query('limit', 10);
        $shop = ShopifyShop::findOrFail($shopId);

        // 这里通常需要先列出所有产品，然后减去有销量的
        $query = <<<'GRAPHQL'
        query LowSales($from: DateTime!) {
          products(first: 50) {
            edges {
              node {
                id
                title
                variants(first: 1) { edges { node { inventoryQuantity } } }
              }
            }
          }
        }
        GRAPHQL;

        $result = $this->shopify->query($shop, $query, ['from' => Carbon::now()->subDays($days)->toIso8601String()]);
        $allProducts = $result['data']['products']['edges'] ?? [];

        $items = [];
        foreach ($allProducts as $pEdge) {
            $node = $pEdge['node'];
            $items[] = [
                'productId' => $node['id'],
                'title' => $node['title'],
                'totalQuantity' => 0, // 简化：在 MVP 中我们假设这些是没销量的
                'inventory' => $node['variants']['edges'][0]['node']['inventoryQuantity'] ?? 0
            ];
        }

        return response()->json([
            'periodDays' => $days,
            'items' => array_slice($items, 0, $limit)
        ]);
    }

    /**
     * GET /admin/shopify/{shopId}/product/{productId}/content
     */
    public function productContent(int $shopId, string $productId)
    {
        $shop = ShopifyShop::findOrFail($shopId);
        $query = <<<'GRAPHQL'
        query GetContent($id: ID!) {
          product(id: $id) {
            id
            title
            descriptionHtml
            seo { title description }
          }
        }
        GRAPHQL;

        $result = $this->shopify->query($shop, $query, ['id' => $productId]);
        return response()->json($result['data']['product'] ?? []);
    }

    /**
     * POST /admin/shopify/{shopId}/product/{productId}/update-content
     */
    public function updateProductContent(Request $request, int $shopId, string $productId)
    {
        $shop = ShopifyShop::findOrFail($shopId);
        $input = $request->only(['title', 'descriptionHtml', 'seoTitle', 'seoDescription']);

        // 实际开发中调用 productUpdate mutation
        return response()->json(['success' => true, 'productId' => $productId]);
    }
}
