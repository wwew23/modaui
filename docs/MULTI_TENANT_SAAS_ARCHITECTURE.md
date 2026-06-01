# ModaUI AI Agent - 多商家 SaaS 架构设计

**目标**：一个统一的 AI Agent 服务，可同时服务多个 Shopify 店铺，每个店铺有独立配置、权限和数据隔离。

---

## 整体架构图

```
ModaUI Platform (Laravel/Botble)
│
├─ 多租户层
│  ├─ ShopifyShop (店铺映射)
│  ├─ AiTenantConfig (配置管理)
│  └─ AiConversation (会话隔离)
│
├─ 后台 AI 助手 (Admin Agent)
│  ├─ /api/shops/{shopId}/ai/kpi-summary
│  ├─ /api/shops/{shopId}/ai/product-diagnosis
│  └─ /api/shops/{shopId}/ai/copywriting-suggestions
│  └─ 每个请求都需要验证该店的权限和配置
│
├─ 前端 AI 导购 (Storefront Agent)
│  ├─ Storefront MCP Server (Node.js)
│  ├─ MCP 工具集 (search_products, add_to_cart 等)
│  └─ 从 Laravel 拉取配置和上下文
│
└─ LLM 层（共享）
   ├─ OpenAI / 内部模型
   ├─ 记录每个 shop_id 的 token 消耗
   └─ 根据店铺配额进行降级处理
```

---

## 核心概念

### 1. 多租户识别（Tenant Key）

**唯一标识一个店铺的组合**：
- `shop_domain` (如 `demo-shop.myshopify.com`) - 来自 Shopify
- `shopify_shop_id` - Shopify 平台的店铺 ID
- 内部 `vendor_id` - ModaUI 系统的商家 ID

**信息流**：
```
Shopify 店铺安装 App → 获得 shop_domain + access_token
                    ↓
               Laravel 保存到 ShopifyShop 表
                    ↓
               关联到 vendor_id（可选，多租户）
                    ↓
               创建 AiTenantConfig 配置记录
                    ↓
    后台 AI / 前端 MCP 都用 shop_domain 做请求标识
```

---

## 二、数据库设计

### 2.1 表结构

#### `shopify_shops` - Shopify 店铺映射

```php
Schema::create('shopify_shops', function (Blueprint $table) {
    $table->id();
    $table->string('shop_domain')->unique();           // xxx.myshopify.com
    $table->string('shopify_shop_id')->nullable();     // Shopify 内部 ID
    $table->unsignedBigInteger('vendor_id')->nullable(); // 关联到 ModaUI 商家（可选）
    $table->string('access_token');                    // Admin API Token
    $table->string('scope')->nullable();               // 权限范围
    $table->string('currency')->default('EUR');
    $table->string('timezone')->default('UTC');
    $table->boolean('is_active')->default(true);
    $table->dateTime('installed_at')->useCurrent();
    $table->dateTime('uninstalled_at')->nullable();
    $table->timestamps();
    
    $table->index(['vendor_id', 'is_active']);
    $table->index('shop_domain');
});
```

#### `ai_tenant_configs` - AI 配置中心（关键表）

```php
Schema::create('ai_tenant_configs', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('shopify_shop_id');
    $table->string('tenant_key')->unique();            // shop_domain 或 hash(shop_id)
    
    // 后台 AI 助手配置
    $table->json('backend_assistant')->nullable();
    /*
    {
        "enabled": true,
        "tone": "专业、简洁",
        "features": {
            "sales_overview": true,
            "product_diagnosis": true,
            "copywriting": true
        },
        "model": "gpt-4",
        "daily_limit": 1000,
        "current_day_usage": 0,
        "usage_reset_date": "2026-05-31"
    }
    */
    
    // 前端 AI 导购配置
    $table->json('storefront_agent')->nullable();
    /*
    {
        "enabled": true,
        "tone": "友好、口语化",
        "welcome_message": "嗨，我是...",
        "suggested_prompts": [...],
        "language": "zh-CN",
        "model": "gpt-4-mini",
        "limits": {
            "max_daily_conversations": 500,
            "max_messages_per_session": 50
        }
    }
    */
    
    // Storefront MCP 连接信息
    $table->string('storefront_mcp_endpoint')->nullable();
    $table->string('storefront_mcp_api_key')->nullable();
    
    // 成本控制和计量
    $table->json('quota')->nullable();
    /*
    {
        "monthly_limit": 100000,
        "monthly_used": 45000,
        "monthly_reset_date": "2026-06-01",
        "per_message_limit": 5000,
        "feature_flags": {
            "vision": false,
            "file_search": true
        }
    }
    */
    
    // 监控和日志
    $table->boolean('enable_logging')->default(true);
    $table->string('logging_level')->default('info'); // debug, info, warn, error
    $table->json('webhook_config')->nullable();
    
    $table->timestamps();
    $table->softDeletes();
    
    $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops');
    $table->index('tenant_key');
});
```

#### `ai_conversations` - 会话记录（按店铺隔离）

```php
Schema::create('ai_conversations', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('shopify_shop_id');
    $table->string('tenant_key');                      // 冗余，便于快速查询
    $table->enum('agent_type', ['backend_assistant', 'storefront_agent']);
    $table->string('session_id')->nullable();          // 前端导购的 session ID
    $table->unsignedBigInteger('user_id')->nullable(); // 对于后台助手：商家用户
    $table->string('customer_id')->nullable();         // 对于前端导购：顾客标识
    $table->json('metadata')->nullable();              // IP、User-Agent、来源等
    $table->integer('message_count')->default(0);
    $table->integer('token_used')->default(0);         // LLM token 用量
    $table->dateTime('started_at');
    $table->dateTime('ended_at')->nullable();
    $table->timestamps();
    
    $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops');
    $table->index(['shopify_shop_id', 'agent_type', 'created_at']);
    $table->index(['tenant_key', 'created_at']);
});
```

#### `ai_messages` - 消息记录

```php
Schema::create('ai_messages', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('conversation_id');
    $table->string('tenant_key');                      // 冗余，便于跨表查询
    $table->enum('role', ['user', 'assistant', 'tool', 'system']);
    $table->longText('content');
    $table->string('tool_name')->nullable();           // 工具调用标识
    $table->json('tool_input')->nullable();
    $table->json('tool_output')->nullable();
    $table->integer('tokens_used')->default(0);        // 该条消息的 token 用量
    $table->string('model')->nullable();               // 使用的模型
    $table->timestamps();
    
    $table->foreign('conversation_id')->references('id')->on('ai_conversations');
    $table->index(['tenant_key', 'created_at']);
});
```

#### `ai_usage_metrics` - 使用计量（便于 SaaS 计费）

```php
Schema::create('ai_usage_metrics', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('shopify_shop_id');
    $table->string('tenant_key');
    $table->date('metric_date');
    $table->enum('agent_type', ['backend_assistant', 'storefront_agent']);
    $table->integer('conversation_count')->default(0);
    $table->integer('message_count')->default(0);
    $table->integer('token_used')->default(0);
    $table->integer('tokens_cost_usd')->nullable();    // 成本（美分）
    $table->integer('tool_call_count')->default(0);
    $table->json('feature_usage')->nullable();         // 各功能的使用情况
    $table->timestamps();
    
    $table->unique(['shopify_shop_id', 'metric_date', 'agent_type']);
    $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops');
});
```

---

## 三、核心模型设计

### 3.1 ShopifyShop 模型

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShopifyShop extends Model
{
    use SoftDeletes;

    protected $table = 'shopify_shops';

    protected $fillable = [
        'shop_domain',
        'shopify_shop_id',
        'vendor_id',
        'access_token',
        'scope',
        'currency',
        'timezone',
        'is_active',
        'installed_at',
        'uninstalled_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'installed_at' => 'datetime',
        'uninstalled_at' => 'datetime',
    ];

    // 关系
    public function aiTenantConfig()
    {
        return $this->hasOne(AiTenantConfig::class, 'shopify_shop_id');
    }

    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class, 'shopify_shop_id');
    }

    public function aiMessages()
    {
        return $this->hasManyThrough(
            AiMessage::class,
            AiConversation::class,
            'shopify_shop_id',
            'conversation_id'
        );
    }

    // 实用方法
    public static function findByDomain(string $domain): ?self
    {
        return static::where('shop_domain', $domain)->first();
    }

    public function isActive(): bool
    {
        return $this->is_active && $this->uninstalled_at === null;
    }

    public function getTenantKey(): string
    {
        return $this->shop_domain;
    }

    public function getDailyLimit($agentType = 'backend_assistant'): int
    {
        $config = $this->aiTenantConfig;
        if (!$config) return 0;
        
        $agent = $agentType === 'backend_assistant' 
            ? $config->backend_assistant 
            : $config->storefront_agent;
            
        return $agent['daily_limit'] ?? 1000;
    }
}
```

### 3.2 AiTenantConfig 模型（新建）

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiTenantConfig extends Model
{
    use SoftDeletes;

    protected $table = 'ai_tenant_configs';

    protected $fillable = [
        'shopify_shop_id',
        'tenant_key',
        'backend_assistant',
        'storefront_agent',
        'storefront_mcp_endpoint',
        'storefront_mcp_api_key',
        'quota',
        'enable_logging',
        'logging_level',
        'webhook_config',
    ];

    protected $casts = [
        'backend_assistant' => 'array',
        'storefront_agent' => 'array',
        'quota' => 'array',
        'webhook_config' => 'array',
        'enable_logging' => 'boolean',
    ];

    // 关系
    public function shopifyShop()
    {
        return $this->belongsTo(ShopifyShop::class, 'shopify_shop_id');
    }

    // 获取后台助手配置
    public function getBackendAssistantConfig(): array
    {
        return $this->backend_assistant ?? $this->getDefaultBackendConfig();
    }

    // 获取前端导购配置
    public function getStorefrontAgentConfig(): array
    {
        return $this->storefront_agent ?? $this->getDefaultStorefrontConfig();
    }

    // 获取配额
    public function getQuota(): array
    {
        return $this->quota ?? $this->getDefaultQuota();
    }

    // 检查今日是否超限
    public function isBackendDailyLimitExceeded(): bool
    {
        $config = $this->getBackendAssistantConfig();
        if (!isset($config['daily_limit'])) return false;
        
        $usage = AiUsageMetric::where('shopify_shop_id', $this->shopify_shop_id)
            ->where('metric_date', now()->toDateString())
            ->where('agent_type', 'backend_assistant')
            ->sum('token_used');
            
        return $usage >= $config['daily_limit'];
    }

    // 检查月度配额
    public function isMonthlyQuotaExceeded(): bool
    {
        $quota = $this->getQuota();
        if (!isset($quota['monthly_limit'])) return false;
        
        $startOfMonth = now()->startOfMonth();
        $usage = AiUsageMetric::where('shopify_shop_id', $this->shopify_shop_id)
            ->where('metric_date', '>=', $startOfMonth->toDateString())
            ->sum('token_used');
            
        return $usage >= $quota['monthly_limit'];
    }

    // 默认配置
    private function getDefaultBackendConfig(): array
    {
        return [
            'enabled' => true,
            'tone' => '专业、简洁、有运营思维',
            'features' => [
                'sales_overview' => true,
                'product_diagnosis' => true,
                'copywriting' => true,
            ],
            'model' => 'gpt-4-turbo',
            'daily_limit' => 100000,
            'current_day_usage' => 0,
        ];
    }

    private function getDefaultStorefrontConfig(): array
    {
        return [
            'enabled' => true,
            'tone' => '友好、口语化、适度幽默',
            'welcome_message' => '嗨！我是你的 AI 导购，有什么问题随时问我～',
            'suggested_prompts' => [
                '帮我推荐 3 件适合的商品',
                '我 168cm，推荐我一条裤子',
                '查看我的订单状态',
            ],
            'language' => 'zh-CN',
            'model' => 'gpt-4-mini',
            'limits' => [
                'max_daily_conversations' => 500,
                'max_messages_per_session' => 50,
            ],
        ];
    }

    private function getDefaultQuota(): array
    {
        return [
            'monthly_limit' => 1000000,  // 1M tokens/month
            'monthly_used' => 0,
            'monthly_reset_date' => now()->addMonth()->startOfMonth()->toDateString(),
            'per_message_limit' => 5000,
            'feature_flags' => [
                'vision' => false,
                'file_search' => true,
                'tool_use' => true,
            ],
        ];
    }
}
```

---

## 四、多租户中间件 & 上下文管理

### 4.1 TenantMiddleware（确保每个请求都有租户上下文）

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ShopifyShop;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // 从路由参数或请求头获取租户标识
        $shopId = $request->route('shopId') ?? $request->header('X-Shop-ID');
        $shopDomain = $request->header('X-Shop-Domain');
        
        // 解析租户
        $shop = null;
        if ($shopId) {
            $shop = ShopifyShop::find($shopId);
        } elseif ($shopDomain) {
            $shop = ShopifyShop::findByDomain($shopDomain);
        }
        
        if (!$shop || !$shop->isActive()) {
            return response()->json(['error' => 'Invalid or inactive shop'], 401);
        }
        
        // 保存到上下文（便于后续使用）
        app()->singleton('current_shop', fn() => $shop);
        app()->singleton('current_tenant_key', fn() => $shop->getTenantKey());
        
        return $next($request);
    }
}
```

### 4.2 TenantContext 辅助类

```php
namespace App\Services;

use App\Models\ShopifyShop;

class TenantContext
{
    private static ?ShopifyShop $shop = null;

    public static function setShop(ShopifyShop $shop): void
    {
        static::$shop = $shop;
    }

    public static function getShop(): ShopifyShop
    {
        return static::$shop ?? app('current_shop');
    }

    public static function getTenantKey(): string
    {
        return static::getShop()->getTenantKey();
    }

    public static function getShopId(): int
    {
        return static::getShop()->id;
    }

    public static function getAccessToken(): string
    {
        return static::getShop()->access_token;
    }

    public static function getConfig(string $agentType = 'backend_assistant')
    {
        $config = static::getShop()->aiTenantConfig;
        
        if ($agentType === 'backend_assistant') {
            return $config?->getBackendAssistantConfig();
        }
        
        return $config?->getStorefrontAgentConfig();
    }

    public static function checkQuota(string $agentType, int $tokensToUse): bool
    {
        $shop = static::getShop();
        $config = $shop->aiTenantConfig;
        
        if (!$config) return true;
        
        // 检查日限
        if ($agentType === 'backend_assistant' && $config->isBackendDailyLimitExceeded()) {
            return false;
        }
        
        // 检查月限
        if ($config->isMonthlyQuotaExceeded()) {
            return false;
        }
        
        return true;
    }
}
```

---

## 五、后台 AI 助手 - 多租户 API 设计

### 5.1 API 路由

```php
// routes/api.php
Route::prefix('/api')->middleware('api', 'auth:sanctum', 'tenant')->group(function () {
    
    // 后台 AI 助手
    Route::prefix('/shops/{shopId}/ai')->group(function () {
        Route::post('/kpi-summary', 'KpiSummaryController@generate');
        Route::post('/product-diagnosis', 'ProductDiagnosisController@generate');
        Route::post('/copywriting', 'CopywritingController@generate');
        Route::get('/conversation/{conversationId}', 'ConversationController@show');
        Route::get('/conversations', 'ConversationController@list');
    });
    
});
```

### 5.2 控制器示例 - KPI Summary

```php
namespace App\Http\Controllers\Api;

use App\Models\ShopifyShop;
use App\Services\TenantContext;
use App\Services\AdminAiService;
use Illuminate\Http\Request;

class KpiSummaryController extends Controller
{
    public function generate(Request $request, $shopId)
    {
        $shop = ShopifyShop::findOrFail($shopId);
        
        // 设置租户上下文
        TenantContext::setShop($shop);
        
        // 检查权限
        if (!$this->authorize('view-ai', $shop)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // 检查配额
        if (!TenantContext::checkQuota('backend_assistant', 2000)) {
            return response()->json([
                'error' => 'Daily quota exceeded',
                'shop_id' => $shop->id,
                'tenant_key' => TenantContext::getTenantKey(),
            ], 429);
        }
        
        // 从 Shopify Admin API 获取数据
        $adminService = new AdminAiService($shop);
        $kpiData = $adminService->fetchKpiData($request->all());
        
        // 创建会话
        $conversation = AiConversation::create([
            'shopify_shop_id' => $shop->id,
            'tenant_key' => TenantContext::getTenantKey(),
            'agent_type' => 'backend_assistant',
            'user_id' => auth()->id(),
            'metadata' => [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
            'started_at' => now(),
        ]);
        
        // 调用 LLM
        $aiService = new BackendAiService();
        $result = $aiService->generateSummary(
            shop: $shop,
            tenantKey: TenantContext::getTenantKey(),
            kpiData: $kpiData,
            conversation: $conversation
        );
        
        // 更新会话记录
        $conversation->update([
            'ended_at' => now(),
            'message_count' => 2,
            'token_used' => $result['tokens_used'],
        ]);
        
        // 记录使用指标
        $this->recordUsageMetric($shop, 'backend_assistant', $result['tokens_used']);
        
        return response()->json([
            'conversation_id' => $conversation->id,
            'shop_id' => $shop->id,
            'tenant_key' => TenantContext::getTenantKey(),
            'summary' => $result['content'],
            'tokens_used' => $result['tokens_used'],
        ]);
    }

    private function recordUsageMetric($shop, $agentType, $tokensUsed)
    {
        AiUsageMetric::updateOrCreate(
            [
                'shopify_shop_id' => $shop->id,
                'metric_date' => now()->toDateString(),
                'agent_type' => $agentType,
            ],
            [
                'tenant_key' => TenantContext::getTenantKey(),
                'token_used' => \DB::raw("token_used + {$tokensUsed}"),
                'tokens_cost_usd' => \DB::raw("token_used * 0.00003"),  // 示例：$0.03/1K tokens
                'message_count' => \DB::raw("message_count + 1"),
            ]
        );
    }
}
```

---

## 六、前端 AI 导购（Storefront MCP）- 多租户集成

### 6.1 MCP 服务器 - 租户识别层

在你的 Node.js MCP Server 中，添加租户识别逻辑：

```javascript
// servers/storefront/src/tenantContext.ts

class TenantContext {
    private static shopDomain: string;
    private static config: any;

    static async initialize(shopDomain: string) {
        this.shopDomain = shopDomain;
        
        // 从 Laravel API 拉取该店的配置
        this.config = await fetch(
            `${LARAVEL_API_URL}/api/shops/config/${shopDomain}`,
            {
                headers: {
                    'Authorization': `Bearer ${LARAVEL_API_TOKEN}`,
                    'X-Shop-Domain': shopDomain,
                }
            }
        ).then(r => r.json());
        
        return this;
    }

    static getShopDomain(): string {
        return this.shopDomain;
    }

    static getConfig() {
        return this.config;
    }

    static getTone(): string {
        return this.config.storefront_agent?.tone || '友好、口语化';
    }

    static getWelcomeMessage(): string {
        return this.config.storefront_agent?.welcome_message || '你好！我是 AI 导购～';
    }

    static getSuggestedPrompts(): string[] {
        return this.config.storefront_agent?.suggested_prompts || [];
    }

    static checkMessageLimit(currentCount: number): boolean {
        const limit = this.config.storefront_agent?.limits?.max_messages_per_session || 50;
        return currentCount < limit;
    }
}

export default TenantContext;
```

### 6.2 MCP 工具 - 注入租户标识

```javascript
// servers/storefront/src/tools.ts

import TenantContext from './tenantContext';

export const tools = [
    {
        name: 'search_products',
        description: '搜索店铺中的商品',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                filters: { type: 'object' },
            },
        },
        handler: async (input) => {
            const shopDomain = TenantContext.getShopDomain();
            const tenantKey = shopDomain; // 或 hash(shopId)
            
            // 调用 Shopify Storefront API
            const results = await searchProducts(
                shopDomain,
                input.query,
                {
                    ...input.filters,
                    // 注入租户标识
                    _tenant_key: tenantKey,
                    _shop_domain: shopDomain,
                }
            );
            
            // 记录使用
            await recordToolUsage(shopDomain, 'search_products');
            
            return results;
        }
    },
    
    {
        name: 'add_to_cart',
        description: '添加商品到购物车',
        inputSchema: {
            type: 'object',
            properties: {
                product_id: { type: 'string' },
                quantity: { type: 'number' },
            },
        },
        handler: async (input) => {
            const shopDomain = TenantContext.getShopDomain();
            
            // 调用 Storefront API
            const cartResult = await addToCart(shopDomain, input.product_id, input.quantity);
            
            // 记录到 Laravel
            await recordConversion(shopDomain, input.product_id);
            
            return cartResult;
        }
    },
];

async function recordToolUsage(shopDomain: string, toolName: string) {
    await fetch(`${LARAVEL_API_URL}/api/shops/ai/tool-usage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LARAVEL_API_TOKEN}`,
        },
        body: JSON.stringify({
            shop_domain: shopDomain,
            tool_name: toolName,
            timestamp: new Date().toISOString(),
        }),
    });
}

async function recordConversion(shopDomain: string, productId: string) {
    // 记录转化事件（便于评估 AI 价值）
    await fetch(`${LARAVEL_API_URL}/api/shops/ai/conversions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LARAVEL_API_TOKEN}`,
        },
        body: JSON.stringify({
            shop_domain: shopDomain,
            product_id: productId,
            event_type: 'add_to_cart',
            timestamp: new Date().toISOString(),
        }),
    });
}
```

---

## 七、LLM 调用 - 统一的租户标签

### 7.1 AdminAiService - 后台调用

```php
namespace App\Services;

use OpenAI\Client;
use App\Models\ShopifyShop;
use App\Models\AiMessage;

class AdminAiService
{
    private Client $openai;

    public function generateSummary(ShopifyShop $shop, string $tenantKey, array $kpiData, $conversation): array
    {
        $config = $shop->aiTenantConfig->getBackendAssistantConfig();
        
        $systemPrompt = $this->buildSystemPrompt($shop, $config);
        
        $response = $this->openai->chat()->create([
            'model' => $config['model'] ?? 'gpt-4-turbo',
            'temperature' => 0.7,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => "请分析以下 KPI 数据并给出运营建议：\n" . json_encode($kpiData),
                ],
            ],
            // 重要：添加租户标签（便于日志追踪和成本分配）
            'metadata' => [
                'tenant_key' => $tenantKey,
                'shop_id' => $shop->id,
                'shop_domain' => $shop->shop_domain,
                'agent_type' => 'backend_assistant',
            ],
        ]);
        
        $content = $response->choices[0]->message->content;
        $tokensUsed = $response->usage->totalTokens;
        
        // 保存消息记录
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'tenant_key' => $tenantKey,
            'role' => 'assistant',
            'content' => $content,
            'tokens_used' => $tokensUsed,
            'model' => $config['model'] ?? 'gpt-4-turbo',
        ]);
        
        return [
            'content' => $content,
            'tokens_used' => $tokensUsed,
        ];
    }

    private function buildSystemPrompt(ShopifyShop $shop, array $config): string
    {
        return "你是 {$shop->shop_domain} 店铺的 AI 运营助手。\n\n"
            . "你的语气是：{$config['tone']}\n\n"
            . "你可以帮助分析销售数据、诊断商品问题、建议文案优化。\n\n"
            . "始终以店铺的商业目标和数据驱动的见解来回答。";
    }
}
```

### 7.2 LLM 日志和追踪

```php
namespace App\Services;

use Illuminate\Support\Facades\Log;

class LlmLoggingService
{
    public static function logCall(
        string $tenantKey,
        int $shopId,
        string $agentType,
        int $inputTokens,
        int $outputTokens,
        float $costUsd
    ) {
        Log::channel('llm')->info('LLM call', [
            'timestamp' => now()->toIso8601String(),
            'tenant_key' => $tenantKey,
            'shop_id' => $shopId,
            'agent_type' => $agentType,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'total_tokens' => $inputTokens + $outputTokens,
            'cost_usd' => $costUsd,
        ]);
    }
}
```

---

## 八、配置管理后台（Botble）

建议添加一个后台页面供商家管理 AI 配置：

```
Admin → AI Agent 配置 → 选择店铺
├─ 后台助手设置
│  ├─ ☑️ 启用后台助手
│  ├─ 语气/风格: [文本框]
│  ├─ 启用功能: ☑️KPI分析 ☑️商品诊断 ☑️文案建议
│  └─ 日限额: [输入框] tokens/day
├─ 前端导购设置
│  ├─ ☑️ 启用前端导购
│  ├─ 欢迎语: [文本框]
│  ├─ 建议提问: [重复块 ×3]
│  ├─ 模型选择: [gpt-4-mini ▼]
│  ├─ 每日对话限制: [输入框]
│  └─ 每session消息限制: [输入框]
├─ Storefront MCP
│  ├─ MCP Endpoint: [URL输入框]
│  └─ API Key: [密码输入框]
└─ 成本控制
   ├─ 月度额度: [输入框] tokens
   ├─ 当前使用: 45,000 / 100,000
   ├─ 费用预警阈值: [输入框] %
   └─ 超额处理: [降级到mini ▼]
```

---

## 九、实施顺序（推荐）

### Phase 1: 基础架构 (POC - 样板店)
- [ ] 创建 `ShopifyShop`, `AiTenantConfig`, `AiConversation` 表
- [ ] 完成 `TenantContext` 和中间件
- [ ] 后台 API 路由（1-2 个端点测试）
- [ ] 后台 AI 助手（KPI Summary 示例）

### Phase 2: 前后端集成
- [ ] Storefront MCP 服务器租户识别
- [ ] MCP 工具的多租户改造
- [ ] 前后端共享 `AiTenantConfig`
- [ ] 消息和会话记录

### Phase 3: 多店支持
- [ ] 添加第二家 Shopify 店
- [ ] 验证数据隔离
- [ ] 验证配置独立
- [ ] 计量系统验证

### Phase 4: SaaS 化
- [ ] 后台管理页面（Botble）
- [ ] 使用统计报表
- [ ] 配额和计费逻辑
- [ ] 成本控制（模型降级）

---

## 十、关键安全事项

1. **租户隔离**：
   - 每个 API 都要验证请求者是否有权访问该店
   - 所有查询都要加上 `shopify_shop_id` 过滤
   - 使用 `tenant_key` 做二次检查

2. **Token 安全**：
   - `access_token` 永不返回给前端
   - 使用环境变量或 Laravel `encryption`
   - 定期轮换 token

3. **API 认证**：
   - 使用 `auth:sanctum` 或 OAuth
   - 每个店铺配有 API Key，用于 MCP server 回调

4. **速率限制**：
   - 按 shop_id + endpoint 做速率限制
   - 防止某个商家的高频调用影响其他店

5. **日志和监审**：
   - 所有 LLM 调用都记录 `tenant_key` 和 `shop_id`
   - 按月汇总成本报表

---

## 关键指标模板

**后台 AI 助手**：
```
每月指标
├─ 使用频率: 商家打开助手的次数
├─ 功能分布: 各功能（KPI/诊断/文案）的使用占比
├─ 采纳率: 商家实际采纳建议的比例（如通过修改商品数来衡量）
└─ ROI: 使用后销售额/转化率的提升

实现：通过埋点追踪商家的后续行为（修改文案、调整价格等）
```

**前端 AI 导购**：
```
每月指标
├─ 参与率: AI 参与的对话数 / 总对话数
├─ 满意度: 用户评分或留存
├─ 转化: AI 对话→加购→下单
├─ AOV 提升: AI 对话用户的平均客单价 vs. 无 AI 用户
└─ 成本: tokens 成本 / 新增 GMV

实现：在转化漏斗中标记 "AI 参与" 的用户
```

