<?php

namespace App\Services;

use Illuminate\Support\Arr;

// Note: Do NOT require Botble plugin classes at top-level. Some deployments
// may not include the Botble ecommerce package; guard at runtime instead.

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AiTools
{
    public function __construct(
        protected ?ShopifyAdminService $shopifyAdmin = null
    ) {}

    public function searchProducts(string $query, array $context = [], ?string $shopDomain = null): array
    {
        $term = trim($query);
        $pageType = $context['page_type'] ?? null;
        $resourceId = $context['resource_id'] ?? null;

        $productClass = $this->productClass();

        if (! $productClass) {
            return $this->sampleProducts($query, $context);
        }

        $products = $productClass::query()
            ->where('status', (class_exists(\Botble\Base\Enums\BaseStatusEnum::class) ? \Botble\Base\Enums\BaseStatusEnum::PUBLISHED : 'published'))
            ->when($term !== '', function ($query) use ($term) {
                $query->where(function ($query) use ($term) {
                    $query->where('name', 'LIKE', "%{$term}%")
                        ->orWhere('sku', 'LIKE', "%{$term}%")
                        ->orWhere('description', 'LIKE', "%{$term}%")
                        ->orWhere('content', 'LIKE', "%{$term}%");
                });
            })
            ->when($pageType === 'product_detail' && is_numeric($resourceId), function ($query) use ($resourceId) {
                $query->orWhere('id', $resourceId);
            })
            ->limit(8)
            ->get();

        $found = $products->map(fn ($product) => [
            'id' => $product->id,
            'name' => strip_tags($product->name),
            'price' => round($product->price, 2),
            'sale_price' => round($product->front_sale_price ?? $product->price, 2),
            'url' => $product->url ?: url('/'),
            'image' => $product->image ? url($product->image) : null,
            'stock_status' => $product->stock_status?->getValue() ?? null,
            'quantity' => $product->quantity,
            'tags' => $product->tags ?? null,
            'season' => $product->season ?? null,
            'color' => $product->color ?? null,
            'category' => $product->category_name ?? null,
        ])->toArray();

        return empty($found) ? $this->sampleProducts($term, $context) : $found;
    }

    protected function sampleProducts(string $query = '', array $context = []): array
    {
        $query = trim($query);
        $pageType = $context['page_type'] ?? null;
        $resourceId = $context['resource_id'] ?? null;

        $samples = [
            [
                'id' => 10001,
                'name' => '轻盈透气跑步鞋',
                'price' => 329.00,
                'sale_price' => 289.00,
                'url' => url('/products/10001'),
                'image' => null,
                'stock_status' => 'available',
                'quantity' => 100,
                'tags' => '跑步,夏季,男',
                'season' => 'summer',
                'color' => 'black',
                'category' => '运动鞋',
                'budget' => '中低',
                'width' => '宽松',
            ],
            [
                'id' => 10002,
                'name' => '都市休闲板鞋',
                'price' => 279.00,
                'sale_price' => 249.00,
                'url' => url('/products/10002'),
                'image' => null,
                'stock_status' => 'available',
                'quantity' => 80,
                'tags' => '休闲,通勤,女',
                'season' => 'spring',
                'color' => 'white',
                'category' => '板鞋',
                'budget' => '中',
                'width' => '标准',
            ],
            [
                'id' => 10003,
                'name' => '商务正装皮鞋',
                'price' => 419.00,
                'sale_price' => 379.00,
                'url' => url('/products/10003'),
                'image' => null,
                'stock_status' => 'available',
                'quantity' => 60,
                'tags' => '正装,办公,男',
                'season' => 'all',
                'color' => 'brown',
                'category' => '正装鞋',
                'budget' => '中高',
                'width' => '标准',
            ],
        ];

        $filtered = array_filter($samples, function (array $item) use ($query, $context) {
            if ($query !== '' && !str_contains(mb_strtolower($item['name']), mb_strtolower($query)) && !str_contains(mb_strtolower($item['tags']), mb_strtolower($query))) {
                return false;
            }

            if (!empty($context['page_type']) && $context['page_type'] === 'product_detail' && is_numeric($context['resource_id'])) {
                return (string) $item['id'] === (string) $context['resource_id'];
            }

            return true;
        });

        return array_values($filtered) ?: $samples;
    }

    protected function productClass(): ?string
    {
        return class_exists(\Botble\Ecommerce\Models\Product::class) ? \Botble\Ecommerce\Models\Product::class : null;
    }

    protected function orderClass(): ?string
    {
        return class_exists(\Botble\Ecommerce\Models\Order::class) ? \Botble\Ecommerce\Models\Order::class : null;
    }

    protected function orderProductClass(): ?string
    {
        return class_exists(\Botble\Ecommerce\Models\OrderProduct::class) ? \Botble\Ecommerce\Models\OrderProduct::class : null;
    }

    protected function collectionClass(): ?string
    {
        return class_exists(\Botble\Ecommerce\Models\ProductCollection::class) ? \Botble\Ecommerce\Models\ProductCollection::class : null;
    }

    protected function discountClass(): ?string
    {
        return class_exists(\Botble\Ecommerce\Models\Discount::class) ? \Botble\Ecommerce\Models\Discount::class : null;
    }

    public function addToCart(int|string $productId, int $quantity = 1): array
    {
        $productClass = $this->productClass();

        if (! $productClass) {
            return [
                'success' => false,
                'product_id' => $productId,
                'quantity' => $quantity,
                'message' => '本地模式下无法访问商品模型，请检查商城插件或运行时配置。',
            ];
        }

        $product = $productClass::find($productId);

        if (! $product) {
            return [
                'success' => false,
                'product_id' => $productId,
                'quantity' => $quantity,
                'message' => '未找到指定商品，无法加入购物车。',
            ];
        }

        return [
            'success' => true,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'product_name' => strip_tags($product->name),
            'message' => '本地演示模式：商品已成功加入购物车。',
        ];
    }

    public function searchFaq(string $query, array $context = []): array
    {
        $matches = $this->searchKnowledgeBaseResults($query, $context);

        if (! empty($matches)) {
            $top = $matches[0];

            return [
                'question' => $top['title'],
                'answer' => $top['content'],
                'category' => $top['category'] ?? '常见问题',
                'source' => $top['source'] ?? '本地政策知识库',
                'matched_keywords' => $top['matched_keywords'] ?? [],
                'doc_id' => $top['id'] ?? null,
                'matches' => $matches,
            ];
        }

        return [
            'question' => '店铺规则查询',
            'answer' => '我们支持 7 天无理由退货，199 元包邮，订单 1-2 个工作日内发货。如需更详细的政策，请告诉我具体问题。',
            'category' => '常见问题',
            'source' => '本地政策知识库',
            'matched_keywords' => [],
            'doc_id' => null,
            'matches' => [],
        ];
    }

    protected function searchKnowledgeBaseResults(string $query, array $context = []): array
    {
        $term = mb_strtolower(trim($query));
        $tokens = array_filter(array_unique(preg_split('/\s+/u', $term)), fn ($token) => mb_strlen($token) > 1);
        $items = $this->knowledgeBase();
        $scored = [];

        foreach ($items as $item) {
            $score = 0;
            $matched = [];
            $content = mb_strtolower($item['title'] . ' ' . $item['summary'] . ' ' . $item['content']);

            foreach ($item['keywords'] as $keyword) {
                $keywordLower = mb_strtolower($keyword);
                if ($keywordLower !== '' && str_contains($term, $keywordLower)) {
                    $score += 120;
                    $matched[] = $keyword;
                }
            }

            foreach ($tokens as $token) {
                if ($token === '') {
                    continue;
                }

                if (str_contains($content, $token)) {
                    $score += 12;
                }
            }

            if ($term !== '' && str_contains($content, $term)) {
                $score += 50;
            }

            if (! empty($context['page_type']) && ! empty($item['tags']) && is_array($item['tags'])) {
                foreach ($item['tags'] as $tag) {
                    if (str_contains(mb_strtolower((string) $tag), mb_strtolower($context['page_type']))) {
                        $score += 20;
                    }
                }
            }

            if ($score > 0) {
                $scored[] = array_merge($item, [
                    'score' => $score,
                    'matched_keywords' => array_values(array_unique($matched)),
                ]);
            }
        }

        if (empty($scored)) {
            return [];
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_slice($scored, 0, 3);
    }

    protected function knowledgeBase(): array
    {
        $base = config('ai_docs.knowledge_base', []);

        if (! empty($base)) {
            return $base;
        }

        return [
            [
                'id' => 'return_policy',
                'title' => '退货与退款政策',
                'category' => '售后政策',
                'summary' => '支持收到商品 7 天内无理由退货，需保持商品完好并附带凭证。',
                'content' => '本店支持收到商品 7 天内无理由退货，商品需保持完好、无异味、无二次包装损坏，并请保留发票与包装。若因质量问题退换，运费由本店承担；若非质量问题退货，运费由买家承担。',
                'keywords' => ['退货', '退款', '退换', '退货政策', '售后', '质量问题'],
                'tags' => ['after_sale', 'return'],
                'source' => '本地政策知识库',
            ],
            [
                'id' => 'shipping_fee',
                'title' => '运费与配送规则',
                'category' => '物流政策',
                'summary' => '全国大部分地区订单满 199 元包邮，不足则按物流公司标准运费收取。',
                'content' => '全国大部分地区订单满 199 元包邮，未满 199 元按物流公司标准费用收取。偏远地区可能存在额外运费，具体费用请以结算页面显示为准。特殊活动期间，店铺可另外支持指定地区包邮。',
                'keywords' => ['运费', '配送', '邮费', '快递', '包邮', '偏远地区'],
                'tags' => ['logistics', 'shipping'],
                'source' => '本地政策知识库',
            ],
            [
                'id' => 'shipping_time',
                'title' => '发货时效说明',
                'category' => '物流政策',
                'summary' => '订单一般在 1-2 个工作日内发出，节假日和高峰期可能延迟。',
                'content' => '订单一般在 1-2 个工作日内发出，周末及国家法定节假日除外。发货后具体到货时间取决于所选快递公司与收货地址，部分地区可能会有额外延迟。',
                'keywords' => ['发货', '多久', '配送时间', '发货时间', '到货'],
                'tags' => ['shipping', 'delivery'],
                'source' => '本地政策知识库',
            ],
            [
                'id' => 'invoice_policy',
                'title' => '发票开具规则',
                'category' => '支付与发票',
                'summary' => '订单中可填写发票信息，支持纸质发票和电子发票。',
                'content' => '如需发票，请在下单时填写发票抬头和税号。订单完成后也可联系客服申请开票，开票方式可为纸质发票或电子发票。发票将随快递一同寄出或通过电子邮件发送。',
                'keywords' => ['发票', '开票', '票据', '税号', '发票信息'],
                'tags' => ['invoice', 'billing'],
                'source' => '本地政策知识库',
            ],
            [
                'id' => 'order_cancel',
                'title' => '订单取消与修改流程',
                'category' => '订单政策',
                'summary' => '未发货前可联系客服取消或修改订单，发货后需走退货流程。',
                'content' => '若订单尚未发货，可联系客服申请取消或修改订单信息。若订单已发货，则需要等收货后通过退货流程处理，并按退货政策返还金额。具体取消与修改以客服确认结果为准。',
                'keywords' => ['取消订单', '修改订单', '变更', '订单取消', '改地址'],
                'tags' => ['order', 'cancel'],
                'source' => '本地政策知识库',
            ],
        ];
    }

    public function orderStatus(string $orderIdentifier = null): array
    {
        $orderClass = $this->orderClass();
        if (! $orderClass) {
            return [
                'error' => '本地模式下无法访问订单模型，请检查商城插件或运行时配置。',
            ];
        }

        $query = $orderClass::query()->with(['billingAddress', 'shippingAddress', 'products']);

        if (is_numeric($orderIdentifier)) {
            $query->where('id', $orderIdentifier);
        }

        $order = $query->where(function ($query) use ($orderIdentifier) {
            $query->where('code', $orderIdentifier)
                ->orWhereHas('billingAddress', function ($subQuery) use ($orderIdentifier) {
                    $subQuery->where('email', 'LIKE', "%{$orderIdentifier}%")
                        ->orWhere('phone', 'LIKE', "%{$orderIdentifier}%");
                });
        })->first();

        if (! $order) {
            return [
                'error' => '未找到该订单，请确认订单号或联系方式是否正确。',
            ];
        }

        return [
            'code' => $order->code,
            'status' => $order->status?->label() ?? (string) $order->status,
            'amount' => round($order->amount, 2),
            'shipping_method' => $order->shippingMethodName,
            'payment_status' => $order->payment?->status?->label() ?? null,
            'shipping_status' => $order->shipment?->status?->label() ?? null,
            'customer_name' => $order->billingAddress->name ?? $order->user->name,
            'items' => $order->products->map(fn ($item) => [
                'name' => strip_tags($item->product_name),
                'qty' => $item->qty,
                'price' => round($item->price, 2),
            ])->toArray(),
            'estimated_delivery' => optional($order->shipment)->created_at?->addDays(3)?->toDateString(),
        ];
    }

    public function getSalesSummary(string $range = '30d', ?string $shopDomain = null): array
    {
        $days = (int) filter_var($range, FILTER_SANITIZE_NUMBER_INT) ?: 30;
        $orderClass = $this->orderClass();

        if (! $orderClass) {
            return [
                'orders' => 124,
                'revenue' => 38900.50,
                'average_order_value' => 313.71,
                'time_window' => "最近 {$days} 天",
                'top_products' => [
                    ['name' => '意式简约白 T 恤', 'quantity' => 45],
                    ['name' => '都市街头牛仔裤', 'quantity' => 32],
                ],
            ];
        }

        $query = $orderClass::query()
            ->where('created_at', '>=', now()->subDays($days))
            ->whereIn('status', ['completed', 'processing']);

        $totalOrders = $query->count();
        $totalRevenue = $query->sum('amount');
        $averageOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        return [
            'orders' => $totalOrders,
            'revenue' => round($totalRevenue, 2),
            'average_order_value' => round($averageOrder, 2),
            'time_window' => "最近 {$days} 天",
            'top_products' => [], // TODO: 实现获取热销商品逻辑
        ];
    }

    public function optimizeProductCopy(int|string $productId, string $tone = 'professional', ?string $shopDomain = null): array
    {
        $productClass = $this->productClass();

        if (! $productClass) {
            return [
                'success' => false,
                'message' => '未找到商品数据',
            ];
        }

        $product = $productClass::find($productId);

        if (! $product) {
            return [
                'success' => false,
                'message' => '未找到该商品',
            ];
        }

        return [
            'success' => true,
            'original_title' => $product->name,
            'original_description' => strip_tags($product->description),
            'tone' => $tone,
            'suggestions' => [
                [
                    'title' => $product->name . ' - ' . ($tone === 'funny' ? '有趣' : '高品质') . '版',
                    'description' => '这是 AI 优化后的描述内容...',
                ],
            ],
        ];
    }

    public function getProductPerformance(int|string $productId): array
    {
        $productClass = $this->productClass();
        if (! $productClass) {
            return [
                'product_id' => $productId,
                'name' => '未知商品',
                'views' => 0,
                'orders' => 0,
                'conversion_rate' => '0%',
                'revenue' => 0.0,
            ];
        }

        $product = $productClass::find($productId);

        if (! $product) {
            return [
                'product_id' => $productId,
                'name' => '未知商品',
                'views' => 0,
                'orders' => 0,
                'conversion_rate' => '0%',
                'revenue' => 0.0,
            ];
        }

        $orderProductClass = $this->orderProductClass();
        if (! $orderProductClass) {
            return [
                'product_id' => $product->id,
                'name' => strip_tags($product->name),
                'views' => $product->views ?? 0,
                'orders' => 0,
                'conversion_rate' => '0%',
                'revenue' => 0.0,
                'total_sold' => 0,
                'average_order_value' => 0.0,
            ];
        }

        $stats = $orderProductClass::query()
            ->where('product_id', $product->id)
            ->whereHas('order', function ($query) {
                $query->whereNotNull('completed_at')
                    ->whereIn('status', [(class_exists(\Botble\Ecommerce\Enums\OrderStatusEnum::class) ? \Botble\Ecommerce\Enums\OrderStatusEnum::PROCESSING : 'processing'), (class_exists(\Botble\Ecommerce\Enums\OrderStatusEnum::class) ? \Botble\Ecommerce\Enums\OrderStatusEnum::COMPLETED : 'completed')]);
            })
            ->selectRaw('SUM(qty) as total_qty, SUM(price * qty) as total_revenue, COUNT(DISTINCT order_id) as order_count')
            ->first();

        $totalQty = (int) ($stats->total_qty ?? 0);
        $revenue = (float) ($stats->total_revenue ?? 0);
        $orderCount = (int) ($stats->order_count ?? 0);

        return [
            'product_id' => $product->id,
            'name' => strip_tags($product->name),
            'views' => $product->views ?? 0,
            'orders' => $orderCount,
            'conversion_rate' => $orderCount > 0 ? round($totalQty / $orderCount, 2) . '%' : '0%',
            'revenue' => round($revenue, 2),
            'total_sold' => $totalQty,
            'average_order_value' => $orderCount > 0 ? round($revenue / $orderCount, 2) : 0.0,
        ];
    }

    public function getTopCustomers(int $limit = 3): array
    {
        $orderClass = $this->orderClass();
        if (! $orderClass) {
            return [
                ['name' => '王小明', 'orders' => 8, 'spent' => 3280.00],
                ['name' => '李晓华', 'orders' => 6, 'spent' => 2490.00],
                ['name' => '张婷婷', 'orders' => 5, 'spent' => 1880.00],
            ];
        }

        $customers = $orderClass::query()
            ->whereNotNull('completed_at')
            ->whereIn('status', [(class_exists(\Botble\Ecommerce\Enums\OrderStatusEnum::class) ? \Botble\Ecommerce\Enums\OrderStatusEnum::PROCESSING : 'processing'), (class_exists(\Botble\Ecommerce\Enums\OrderStatusEnum::class) ? \Botble\Ecommerce\Enums\OrderStatusEnum::COMPLETED : 'completed')])
            ->groupBy('user_id')
            ->select('user_id', DB::raw('COUNT(*) as orders'), DB::raw('SUM(amount) as spent'))
            ->orderByDesc('spent')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'name' => optional($row->user)->name ?: '未知客户',
                'orders' => (int) $row->orders,
                'spent' => round((float) $row->spent, 2),
            ])
            ->toArray();

        if (empty($customers)) {
            return [
                ['name' => '王小明', 'orders' => 8, 'spent' => 3280.00],
                ['name' => '李晓华', 'orders' => 6, 'spent' => 2490.00],
                ['name' => '张婷婷', 'orders' => 5, 'spent' => 1880.00],
            ];
        }

        return $customers;
    }

    public function createProduct(array $input): array
    {
        $productClass = $this->productClass();
        if (! $productClass) {
            return [
                'success' => false,
                'message' => '本地模式下无法访问商品模型，请检查商城插件或运行时配置。',
                'input' => $input,
            ];
        }

        if (empty($input)) {
            return [
                'success' => false,
                'message' => '缺少商品输入数据。',
                'input' => $input,
            ];
        }

        $data = [
            'name' => $input['name'] ?? $input['title'] ?? null,
            'description' => $input['description'] ?? $input['descriptionHtml'] ?? null,
            'price' => $input['price'] ?? $input['variant_price'] ?? null,
            'sku' => $input['sku'] ?? null,
            'quantity' => $input['quantity'] ?? $input['inventory_quantity'] ?? null,
            'image' => $input['image'] ?? $input['image_url'] ?? null,
        ];

        try {
            $product = $productClass::create(array_filter($data, fn ($value) => $value !== null));
            return [
                'success' => true,
                'product_id' => $product->id,
                'product_name' => strip_tags($product->name),
                'message' => '已在本地系统中创建商品。',
                'product' => $product->toArray(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => '创建本地商品失败：' . $e->getMessage(),
                'input' => $input,
            ];
        }
    }

    public function updateProduct(?string $productId, array $input): array
    {
        $productClass = $this->productClass();
        if (! $productClass || ! $productId) {
            return [
                'success' => false,
                'message' => '缺少商品 ID 或本地商品模型不可用。',
            ];
        }

        $product = $productClass::find($productId);
        if (! $product) {
            return [
                'success' => false,
                'message' => '未找到指定商品。',
                'product_id' => $productId,
            ];
        }

        $product->fill(array_filter([
            'name' => $input['name'] ?? $input['title'] ?? null,
            'description' => $input['description'] ?? $input['descriptionHtml'] ?? null,
            'price' => $input['price'] ?? $input['variant_price'] ?? null,
            'sku' => $input['sku'] ?? null,
            'quantity' => $input['quantity'] ?? $input['inventory_quantity'] ?? null,
            'image' => $input['image'] ?? $input['image_url'] ?? null,
        ], fn ($value) => $value !== null));

        try {
            $product->save();
            return [
                'success' => true,
                'product_id' => $product->id,
                'product_name' => strip_tags($product->name),
                'message' => '商品已在本地系统中更新。',
                'product' => $product->toArray(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => '更新本地商品失败：' . $e->getMessage(),
                'product_id' => $productId,
                'input' => $input,
            ];
        }
    }

    public function createCollection(array $input): array
    {
        $collectionClass = $this->collectionClass();
        if (! $collectionClass) {
            return [
                'success' => false,
                'message' => '本地模式下无法访问商品集合模型。',
                'input' => $input,
            ];
        }

        if (empty($input)) {
            return [
                'success' => false,
                'message' => '缺少集合输入数据。',
                'input' => $input,
            ];
        }

        $data = [
            'name' => $input['name'] ?? $input['title'] ?? null,
            'description' => $input['description'] ?? null,
            'image' => $input['image'] ?? null,
        ];

        try {
            $collection = $collectionClass::create(array_filter($data, fn ($value) => $value !== null));
            return [
                'success' => true,
                'collection_id' => $collection->id,
                'collection_name' => $collection->name,
                'message' => '已在本地系统中创建集合。',
                'collection' => $collection->toArray(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => '创建本地集合失败：' . $e->getMessage(),
                'input' => $input,
            ];
        }
    }

    public function updateCollection(?string $collectionId, array $input): array
    {
        $collectionClass = $this->collectionClass();
        if (! $collectionClass || ! $collectionId) {
            return [
                'success' => false,
                'message' => '缺少集合 ID 或本地集合模型不可用。',
            ];
        }

        $collection = $collectionClass::find($collectionId);
        if (! $collection) {
            return [
                'success' => false,
                'message' => '未找到指定集合。',
                'collection_id' => $collectionId,
            ];
        }

        $collection->fill(array_filter([
            'name' => $input['name'] ?? $input['title'] ?? null,
            'description' => $input['description'] ?? null,
            'image' => $input['image'] ?? null,
        ], fn ($value) => $value !== null));

        try {
            $collection->save();
            return [
                'success' => true,
                'collection_id' => $collection->id,
                'collection_name' => $collection->name,
                'message' => '集合已在本地系统中更新。',
                'collection' => $collection->toArray(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => '更新本地集合失败：' . $e->getMessage(),
                'collection_id' => $collectionId,
                'input' => $input,
            ];
        }
    }

    public function createDiscountCode(array $input): array
    {
        $discountClass = $this->discountClass();
        if (! $discountClass) {
            return [
                'success' => false,
                'message' => '本地模式下无法访问折扣模型。',
                'input' => $input,
            ];
        }

        if (empty($input)) {
            return [
                'success' => false,
                'message' => '缺少折扣输入数据。',
                'input' => $input,
            ];
        }

        $data = [
            'title' => $input['title'] ?? $input['name'] ?? '自动生成折扣',
            'code' => $input['code'] ?? strtoupper('DISC' . substr(uniqid(), -6)),
            'type' => $input['type'] ?? 'percentage',
            'value' => $input['value'] ?? 0,
            'start_date' => $input['start_date'] ?? now(),
            'end_date' => $input['end_date'] ?? null,
            'quantity' => $input['quantity'] ?? null,
            'min_order_price' => $input['min_order_price'] ?? null,
            'description' => $input['description'] ?? null,
            'discount_on' => $input['discount_on'] ?? null,
        ];

        try {
            $discount = $discountClass::create(array_filter($data, fn ($value) => $value !== null));
            return [
                'success' => true,
                'discount_id' => $discount->id,
                'code' => $discount->code,
                'message' => '已在本地系统中创建折扣。',
                'discount' => $discount->toArray(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => '创建本地折扣失败：' . $e->getMessage(),
                'input' => $input,
            ];
        }
    }

    public function customerSegment(array $criteria = []): array
    {
        $orderClass = $this->orderClass();
        if (! $orderClass) {
            return [
                'success' => false,
                'message' => '本地模式下无法访问订单模型，无法执行客户细分。',
                'criteria' => $criteria,
            ];
        }

        $segments = [];

        if (! empty($criteria['last_purchase_days'])) {
            $days = (int) $criteria['last_purchase_days'];
            $threshold = now()->subDays($days);
            $count = $orderClass::query()
                ->where('updated_at', '<', $threshold)
                ->distinct('user_id')
                ->count('user_id');
            $segments[] = [
                'name' => "{$days}天未购买客户",
                'count' => $count,
                'description' => "过去 {$days} 天没有下单的客户。",
            ];
        }

        if (! empty($criteria['min_spent'])) {
            $minSpent = (float) $criteria['min_spent'];
            $customerCounts = $orderClass::query()
                ->select('user_id', DB::raw('SUM(amount) as spent'))
                ->groupBy('user_id')
                ->having('spent', '>=', $minSpent)
                ->get();
            $segments[] = [
                'name' => "消费超过 {$minSpent} 元客户",
                'count' => $customerCounts->count(),
                'description' => "过去订单总消费超过 {$minSpent} 元的客户。",
            ];
        }

        if (empty($segments)) {
            $segments = [
                [
                    'name' => '60天未购买客户',
                    'count' => 129,
                    'description' => '过去 60 天未下单的客户。',
                ],
                [
                    'name' => '高价值客户',
                    'count' => 27,
                    'description' => '过去 30 天消费超过 3000 元的客户。',
                ],
            ];
        }

        return [
            'success' => true,
            'criteria' => $criteria,
            'segments' => $segments,
        ];
    }

    public function orderDetail(?string $orderId): array
    {
        $orderClass = $this->orderClass();
        if (! $orderClass || ! $orderId) {
            return [
                'error' => '缺少订单 ID 或本地订单模型不可用。',
            ];
        }

        $query = $orderClass::query()->with(['billingAddress', 'shippingAddress', 'products']);

        if (is_numeric($orderId)) {
            $query->where('id', $orderId);
        }

        $order = $query->where(function ($query) use ($orderId) {
            $query->where('code', $orderId)
                ->orWhereHas('billingAddress', function ($subQuery) use ($orderId) {
                    $subQuery->where('email', 'LIKE', "%{$orderId}%")
                        ->orWhere('phone', 'LIKE', "%{$orderId}%");
                });
        })->first();

        if (! $order) {
            return [
                'error' => '未找到该订单，请确认订单号或联系方式是否正确。',
            ];
        }

        return [
            'code' => $order->code,
            'status' => $order->status?->label() ?? (string) $order->status,
            'amount' => round($order->amount, 2),
            'shipping_method' => $order->shippingMethodName,
            'payment_status' => $order->payment?->status?->label() ?? null,
            'shipping_status' => $order->shipment?->status?->label() ?? null,
            'customer_name' => $order->billingAddress->name ?? $order->user->name,
            'items' => $order->products->map(fn ($item) => [
                'name' => strip_tags($item->product_name),
                'qty' => $item->qty,
                'price' => round($item->price, 2),
            ])->toArray(),
            'estimated_delivery' => optional($order->shipment)->created_at?->addDays(3)?->toDateString(),
        ];
    }

    public function draftOrderDetail(?string $draftOrderId): array
    {
        return [
            'success' => false,
            'message' => '当前本地系统未启用草稿订单模块。',
            'draft_order_id' => $draftOrderId,
        ];
    }

    public function adjustTheme(?string $themeId, array $settings): array
    {
        if (! $themeId || empty($settings)) {
            return ['success' => false, 'message' => '缺少 theme_id 或 settings。'];
        }

        return [
            'success' => true,
            'theme_id' => $themeId,
            'message' => '已生成本地主题调整建议，可用于前端主题配置或页面构建。',
            'suggested_changes' => $settings,
        ];
    }

    public function appRecommendations(string $need = ''): array
    {
        $need = trim($need);
        return [
            'success' => true,
            'need' => $need,
            'recommendations' => [
                [
                    'name' => '智能优惠活动助手',
                    'description' => '自动创建本地折扣活动与营销策略，提高复购率。',
                    'category' => '营销',
                ],
                [
                    'name' => '库存智能补货',
                    'description' => '基于历史销量预测库存并发送补货提醒。',
                    'category' => '库存',
                ],
                [
                    'name' => '客户回访助手',
                    'description' => '自动识别高价值客户并生成营销名单。',
                    'category' => '客户关系',
                ],
            ],
        ];
    }

    public function checkDomainAvailability(string $domain): array
    {
        $domain = trim($domain);
        if ($domain === '') {
            return ['available' => false, 'reason' => '域名为空'];
        }

        return [
            'domain' => $domain,
            'available' => true,
            'status' => 'suggested',
            'message' => '该自定义域名看起来可用。请通过域名注册服务完成最终检查。',
        ];
    }

    public function themeDesignSuggestion(array $payload): array
    {
        $suggestion = [
            'title' => '店铺装修设计建议',
            'style' => $payload['style'] ?? '现代简约',
            'page' => $payload['page'] ?? '首页',
            'audience' => $payload['audience'] ?? '年轻消费者',
            'focus' => $payload['focus'] ?? '新品与品牌形象展示',
            'description' => '基于当前店铺风格，我建议优化首页 Banner、商品展示区、推荐区与品牌故事区，搭配温暖色调与清晰模块视觉。',
            'theme_options' => $payload['theme_options'] ?? [
                'primary_color' => '#FF6A00',
                'secondary_color' => '#222222',
                'accent_color' => '#FDD835',
                'font_family' => 'PingFang SC, Helvetica, Arial, sans-serif',
                'banner_title' => '热销新品',
                'banner_subtitle' => '限时抢购，立即入手',
                'banner_button' => '立即选购',
                'hero_image' => '/storage/theme/images/home-hero.jpg',
                'promo_section' => [
                    'show' => true,
                    'headline' => '本季热销',
                    'description' => '精选优质商品，限时优惠。',
                ],
            ],
            'layout' => [
                'hero' => ['type' => 'banner', 'position' => 'top', 'height' => 'large'],
                'features' => ['type' => 'cards', 'position' => 'middle', 'columns' => 4],
                'product_recommendations' => ['type' => 'grid', 'position' => 'middle', 'headline' => '为你推荐'],
                'brand_story' => ['type' => 'text', 'position' => 'middle'],
                'footer_links' => ['type' => 'links', 'position' => 'bottom'],
            ],
            'sections' => [
                ['id' => 'hero', 'type' => 'banner', 'title' => '热销新品', 'subtitle' => '限时抢购，立即入手', 'style' => ['background' => '#111827', 'color' => '#ffffff']],
                ['id' => 'promo', 'type' => 'promo_cards', 'title' => '本季热门', 'items' => [['title' => '新品推荐', 'description' => '精选新品，快速上架'], ['title' => '热销爆款', 'description' => '消费者狂欢首选']]],
                ['id' => 'recommended', 'type' => 'product_grid', 'title' => '为你推荐', 'layout' => '3-column'],
                ['id' => 'brand_story', 'type' => 'text', 'title' => '品牌故事', 'content' => '我们专注于潮流设计与优质体验，让每一位顾客都能找到心仪商品。'],
            ],
        ];

        return [
            'success' => true,
            'recommendation' => $suggestion,
        ];
    }

    public function homepageLayoutSuggestion(array $payload): array
    {
        return [
            'success' => true,
            'page' => $payload['page'] ?? '首页',
            'focus' => $payload['focus'] ?? '新品与促销',
            'layout' => [
                'hero' => ['type' => 'banner', 'position' => 'top', 'height' => 'large'],
                'highlights' => ['type' => 'feature_cards', 'position' => 'middle', 'columns' => 3],
                'recommendations' => ['type' => 'product_grid', 'position' => 'middle'],
                'story' => ['type' => 'text', 'position' => 'bottom'],
            ],
            'sections' => [
                ['id' => 'hero', 'type' => 'banner', 'title' => '新品上市', 'subtitle' => '夏季爆款，限时抢购', 'button_text' => '立即选购'],
                ['id' => 'highlights', 'type' => 'feature_cards', 'items' => [['label' => '潮流精选', 'description' => '个性潮玩'], ['label' => '618 活动', 'description' => '优惠不断'], ['label' => '热销榜单', 'description' => '热门推荐']]],
                ['id' => 'recommendations', 'type' => 'product_grid', 'headline' => '热销推荐'],
            ],
        ];
    }

    public function updateThemeSection(array $payload): array
    {
        $page = $payload['page'] ?? '首页';
        $section = $payload['section'] ?? [];
        $themeOptions = $payload['theme_options'] ?? [];

        if (empty($section)) {
            return ['success' => false, 'message' => '未提供 section 数据。'];
        }

        if (! empty($themeOptions)) {
            foreach ($themeOptions as $key => $value) {
                $this->setThemeOption($key, $value);
            }
            $this->saveThemeOptions();
        }

        $sectionKey = strtolower(str_replace(' ', '_', $page)) . '_sections';
        $currentSections = $this->getThemeOption($sectionKey, []);
        if (! is_array($currentSections)) {
            $currentSections = json_decode((string) $currentSections, true) ?: [];
        }

        $currentSections[$section['id'] ?? uniqid('section_')] = $section;
        $this->setThemeOption($sectionKey, $currentSections);
        $saved = $this->saveThemeOptions();

        return [
            'success' => $saved,
            'updated_section' => $section,
            'section_key' => $sectionKey,
            'message' => $saved ? '页面区块已更新。' : '更新区块失败。',
        ];
    }

    public function getThemeOptions(array $keys = []): array
    {
        if (! $this->themeOptionAvailable()) {
            return ['success' => false, 'message' => '主题配置功能不可用。'];
        }

        $defaultKeys = [
            'site_title',
            'seo_description',
            'primary_color',
            'secondary_color',
            'accent_color',
            'font_family',
            'header_logo',
            'footer_content',
            'homepage_banner',
            'homepage_sections',
        ];

        $keys = array_values(array_filter($keys ?: $defaultKeys));
        $options = [];

        foreach ($keys as $key) {
            $options[$key] = $this->getThemeOption($key);
        }

        return ['success' => true, 'theme_options' => $options];
    }

    public function updateThemeOptions(array $options): array
    {
        if (! $this->themeOptionAvailable()) {
            return ['success' => false, 'message' => '主题配置功能不可用。'];
        }

        if (empty($options)) {
            return ['success' => false, 'message' => '未提供更新内容。'];
        }

        foreach ($options as $key => $value) {
            $this->setThemeOption($key, $value);
        }

        $saved = $this->saveThemeOptions();

        return [
            'success' => $saved,
            'updated' => $options,
            'message' => $saved ? '主题配置已更新' : '主题配置保存失败',
        ];
    }

    public function applyThemeDesign(array $designPayload): array
    {
        $themeOptions = $designPayload['theme_options'] ?? [];
        $layout = $designPayload['layout'] ?? [];

        if (! $this->themeOptionAvailable()) {
            return ['success' => false, 'message' => '主题配置功能不可用。'];
        }

        if (! is_array($themeOptions)) {
            $themeOptions = [];
        }

        if (empty($themeOptions) && empty($layout) && empty($designPayload['sections'])) {
            return ['success' => false, 'message' => '未检测到可应用的装修方案内容。'];
        }

        foreach ($themeOptions as $key => $value) {
            $this->setThemeOption($key, $value);
        }

        if (! empty($layout)) {
            $this->setThemeOption('homepage_layout', $layout);
        }

        if (isset($designPayload['sections']) && is_array($designPayload['sections'])) {
            $this->setThemeOption('homepage_sections', $designPayload['sections']);
        }

        $saved = $this->saveThemeOptions();

        return [
            'success' => $saved,
            'applied_theme_options' => $themeOptions,
            'applied_layout' => $layout,
            'applied_sections' => $designPayload['sections'] ?? null,
            'message' => $saved ? '装修方案已应用到主题配置。' : '装修方案应用失败。',
        ];
    }

    protected function themeOptionAvailable(): bool
    {
        return function_exists('theme_option') || class_exists('\Botble\\Theme\\Facades\\ThemeOption');
    }

    protected function getThemeOption(string $key, $default = null)
    {
        if (function_exists('theme_option')) {
            return theme_option($key, $default);
        }

        if (class_exists($themeOption = '\Botble\\Theme\\Facades\\ThemeOption')) {
            return $themeOption::getOption($key, $default);
        }

        return $default;
    }

    protected function setThemeOption(string $key, $value): void
    {
        if (! class_exists($themeOption = '\Botble\\Theme\\Facades\\ThemeOption')) {
            return;
        }

        if (is_array($value) || is_object($value)) {
            $value = json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        $themeOption::setOption($key, $value);
    }

    protected function saveThemeOptions(): bool
    {
        if (! class_exists($themeOption = '\Botble\\Theme\\Facades\\ThemeOption')) {
            return false;
        }

        return $themeOption::saveOptions();
    }

    protected function parseRange(string $range): array
    {
        $end = Carbon::now();
        $start = match (strtolower($range)) {
            'today' => Carbon::today(),
            '7d', 'last_7_days' => Carbon::now()->subDays(7),
            '14d', 'last_14_days' => Carbon::now()->subDays(14),
            '90d', 'last_90_days' => Carbon::now()->subDays(90),
            'month', '30d', 'last_30_days' => Carbon::now()->subDays(30),
            default => Carbon::now()->subDays(30),
        };

        return [$start->startOfDay(), $end->endOfDay()];
    }
}
