# 多租户 AI Agent SaaS 系统 - 完整实施指南

**目标**：用一套 Laravel 后端 + 数据表，同时服务多个 Shopify 店铺的后台 AI 助手和前端 AI 导购。

---

## 快速导航

- [数据库设计](#数据库设计)
- [模型关系](#模型关系)
- [核心概念](#核心概念)
- [后台 AI 助手集成](#后台-ai-助手集成)
- [前端 Storefront MCP 集成](#前端-storefront-mcp-集成)
- [常用查询和报表](#常用查询和报表)
- [计费和成本追踪](#计费和成本追踪)
- [实施清单](#实施清单)

---

## 数据库设计

### 表结构总览

```
shopify_shops
  ├─ id (PK)
  ├─ shop_domain (唯一)
  ├─ access_token (Admin API)
  ├─ vendor_id (可选，关联到你的商家)
  └─ is_active

ai_configs
  ├─ id (PK)
  ├─ shopify_shop_id (FK)
  ├─ agent_type ('backend_assistant' / 'storefront_agent' / ...)
  ├─ enabled
  ├─ tone_of_voice
  └─ settings (JSON: 功能开关、限流、模型配置等)

ai_conversations
  ├─ id (PK)
  ├─ shopify_shop_id (FK) ← 租户隔离关键
  ├─ ai_config_id (FK)
  ├─ tenant_key (shop_domain，冗余便于查询)
  ├─ agent_type
  ├─ started_at / ended_at
  └─ metadata (IP、User-Agent 等)

ai_messages
  ├─ id (PK)
  ├─ conversation_id (FK)
  ├─ tenant_key (冗余)
  ├─ role ('user' / 'assistant' / 'tool' / 'system')
  ├─ content
  ├─ tool_name / tool_input / tool_output
  ├─ tokens_used
  └─ model

ai_usage_metrics
  ├─ id (PK)
  ├─ shopify_shop_id (FK)
  ├─ metric_date
  ├─ agent_type
  ├─ conversation_count
  ├─ token_used / tokens_cost_cents
  └─ feature_usage (JSON)
```

---

## 模型关系

```php
// 店铺 → 配置 → 会话 → 消息
ShopifyShop::find($id)
  ->aiConfigs()              // 一个店铺可有多个配置（不同 agent）
  ->conversations()          // 所有对话
  ->messages()               // 所有消息

AiConfig::where('shopify_shop_id', $id)
  ->where('agent_type', 'backend_assistant')
  ->first()
  ->conversations()          // 该配置下的会话
  ->messages()               // 所有消息

AiConversation::find($id)
  ->shop()                   // 关联的店铺
  ->aiConfig()               // 使用的配置
  ->messages()               // 该会话的所有消息
```

---

## 核心概念

### 1. 租户隔离 (Tenant Isolation)

**关键**：每条记录都要标记 `shopify_shop_id` 或 `tenant_key`

```php
// ✅ 正确：始终按 shop 过滤
AiConversation::where('shopify_shop_id', $shop->id)->get();

// ❌ 危险：不加店铺过滤，可能泄露其他商家数据
AiConversation::all();
```

### 2. Agent 类型 (Agent Type)

一个店铺可以同时有多个 agent：

```
一个店 = 后台 AI 助手 + 前端 AI 导购 + ...
        (backend_assistant) + (storefront_agent) + (customer_service, 等等)
```

### 3. 配置集中管理

所有"品牌风格"配置都在 `AiConfig.settings` (JSON)：

```json
{
  "welcome_message": "嗨～我是 AI 导购",
  "suggested_prompts": ["推荐商品", ...],
  "features": {
    "product_search": true,
    "cart_operations": true
  },
  "limits": {
    "daily_limit": 50000,
    "max_messages_per_session": 30
  },
  "model_config": {
    "model": "gpt-4-mini",
    "temperature": 0.8
  }
}
```

---

## 后台 AI 助手集成

### 使用流程

```
1. 用户请求后台 AI 助手
    ↓
2. 验证权限、确定 shop_id
    ↓
3. 获取 AiConfig (agent_type='backend_assistant')
    ↓
4. 创建 AiConversation
    ↓
5. 调用 LLM（注入 shop_domain / tenant_key 标签）
    ↓
6. 记录 AiMessage (role='user', role='assistant', role='tool', ...)
    ↓
7. 更新 AiUsageMetric（累加 token 和成本）
    ↓
8. 返回结果给前端
```

### 代码示例

```php
// ① 获取店铺和配置
$shop = ShopifyShop::findOrFail($shopId);
$config = AiConfig::where('shopify_shop_id', $shop->id)
                   ->where('agent_type', 'backend_assistant')
                   ->first();

// ② 创建对话
$conversation = AiConversation::create([
    'shopify_shop_id' => $shop->id,
    'ai_config_id' => $config->id,
    'tenant_key' => $shop->getTenantKey(),
    'agent_type' => 'backend_assistant',
    'user_id' => auth()->id(),
    'started_at' => now(),
    'metadata' => [
        'ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
    ],
]);

// ③ 保存用户消息
$conversation->addMessage('user', $userPrompt);

// ④ 调用 LLM（伪代码）
$systemPrompt = "你是 {$shop->shop_domain} 的 AI 运营助手。"
              . "语气：{$config->tone_of_voice}\n"
              . "功能开关：" . json_encode($config->getFeatureFlags());

$response = $llmService->chat([
    'system' => $systemPrompt,
    'messages' => [...],
    'metadata' => [
        'tenant_key' => $shop->getTenantKey(),
        'shop_id' => $shop->id,
    ],
]);

// ⑤ 保存 AI 回复和工具调用
$conversation->addMessage('assistant', $response->content);

foreach ($response->tool_calls as $toolCall) {
    AiMessage::recordToolCall(
        $conversation,
        $shop->getTenantKey(),
        $toolCall->name,
        $toolCall->arguments,
        $toolCall->result,
        $toolCall->tokens
    );
}

// ⑥ 更新计数和成本
$conversation->update([
    'message_count' => $conversation->messages()->count(),
    'token_used' => $response->usage->total_tokens,
    'ended_at' => now(),
]);

// ⑦ 记录每日指标
$metric = AiUsageMetric::recordForToday(
    $shop->id,
    $shop->getTenantKey(),
    'backend_assistant'
);
$metric->incrementConversationCount();
$metric->incrementMessageCount($conversation->messages()->count());
$metric->incrementTokenUsed(
    $response->usage->total_tokens,
    $response->usage->cost_usd
);
```

---

## 前端 Storefront MCP 集成

### 关键差异

| 方面 | 后台助手 | 前端导购 |
|------|--------|--------|
| `agent_type` | `backend_assistant` | `storefront_agent` |
| `user_id` | ✓（商家用户） | ✗ |
| `customer_id` | ✗ | ✓（匿名或登录顾客） |
| `session_id` | ✗ | ✓（前端 session） |
| 配置来源 | Laravel API | Laravel API / 本地缓存 |

### Node.js MCP 服务器侧

```javascript
// servers/storefront/src/tenant.ts

import axios from 'axios';

class TenantManager {
  private shopDomain: string;
  private config: any;

  async initialize(shopDomain: string) {
    this.shopDomain = shopDomain;
    
    // 从 Laravel 拉取该店的 AI 配置
    const response = await axios.get(
      `${process.env.LARAVEL_API_URL}/api/shops/${shopDomain}/ai-config/storefront_agent`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`,
        }
      }
    );
    
    this.config = response.data;
    return this;
  }

  getConfig() {
    return this.config;
  }

  getTenantKey() {
    return this.shopDomain;
  }

  getWelcomeMessage() {
    return this.config.settings?.welcome_message || 'Hello!';
  }

  getSuggestedPrompts() {
    return this.config.settings?.suggested_prompts || [];
  }

  getModelConfig() {
    return this.config.settings?.model_config || {};
  }

  async recordMessage(
    sessionId: string,
    customerId: string,
    role: string,
    content: string,
    toolName?: string
  ) {
    // 发送消息到 Laravel，记录到 ai_messages 表
    await axios.post(
      `${process.env.LARAVEL_API_URL}/api/shops/${this.shopDomain}/conversations/messages`,
      {
        session_id: sessionId,
        customer_id: customerId,
        role,
        content,
        tool_name: toolName,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`,
        }
      }
    );
  }
}

export default TenantManager;
```

### MCP 工具集成示例

```javascript
// servers/storefront/src/tools.ts

import TenantManager from './tenant';

export const createTools = (tenant: TenantManager) => [
  {
    name: 'search_products',
    description: 'Search for products in the store',
    handler: async (input) => {
      const results = await shopifyStorefrontAPI.searchProducts(
        tenant.getTenantKey(),
        input.query
      );

      // 记录工具调用
      await tenant.recordMessage(
        input.sessionId,
        input.customerId,
        'tool',
        JSON.stringify({ tool: 'search_products', results }),
        'search_products'
      );

      return results;
    }
  },
  // ... 更多工具
];
```

---

## 常用查询和报表

### 1. 按店铺、按天统计会话数

```php
$dailyConversations = AiConversation::select(
    'shopify_shop_id',
    \DB::raw('DATE(started_at) as day'),
    \DB::raw('COUNT(*) as conversations')
)
->where('agent_type', 'backend_assistant')
->groupBy('shopify_shop_id', 'day')
->orderBy('day', 'desc')
->get();

// 结果示例：
// [
//   { shopify_shop_id: 1, day: '2026-05-31', conversations: 5 },
//   { shopify_shop_id: 2, day: '2026-05-31', conversations: 3 },
// ]
```

### 2. 按 Agent 类型统计

```php
$byAgentType = AiConversation::select('agent_type')
    ->selectRaw('COUNT(*) as count')
    ->groupBy('agent_type')
    ->get();

// [
//   { agent_type: 'backend_assistant', count: 100 },
//   { agent_type: 'storefront_agent', count: 250 },
// ]
```

### 3. 每个店铺的 token 消耗

```php
$tokenUsage = AiMessage::select(
    'c.shopify_shop_id',
    \DB::raw('SUM(am.tokens_used) as total_tokens')
)
->from('ai_messages', 'am')
->join('ai_conversations as c', 'am.conversation_id', '=', 'c.id')
->where('am.role', 'assistant')
->groupBy('c.shopify_shop_id')
->get();

// 或用 Eloquent
$tokenUsage = ShopifyShop::with(['conversations.messages'])
    ->get()
    ->map(fn($shop) => [
        'shop_id' => $shop->id,
        'domain' => $shop->shop_domain,
        'total_tokens' => $shop->messages->sum('tokens_used'),
    ]);
```

### 4. 本月成本统计

```php
$monthlyCost = AiUsageMetric::thisMonth()
    ->forShop($shopId)
    ->get()
    ->sum(fn($m) => $m->getCostInDollars());

echo "本月成本: \${$monthlyCost}";
```

### 5. 工具调用最频繁的店铺

```php
$toolUsage = AiMessage::where('role', 'tool')
    ->select('c.shopify_shop_id', 'tool_name')
    ->selectRaw('COUNT(*) as calls')
    ->join('ai_conversations as c', 'message.conversation_id', '=', 'c.id')
    ->groupBy('c.shopify_shop_id', 'tool_name')
    ->orderBy('calls', 'desc')
    ->limit(10)
    ->get();
```

---

## 计费和成本追踪

### 成本模型

```
成本 = tokens × 单价

例如（OpenAI GPT-4-turbo）:
- 输入: $0.03 / 1K tokens
- 输出: $0.06 / 1K tokens
- 平均: ~$0.04 / 1K tokens (简化)
- 即: $0.00004 / token
```

### 记录成本

```php
// 方式 1：自动计算
$metric->incrementTokenUsed(2500, $costUsd = 0.10);

// 方式 2：从 API 响应
$response = $llmService->chat([...]);
$metric->incrementTokenUsed(
    $response->usage->total_tokens,
    $response->usage->cost_usd
);

// 查询某店本月成本
$shop = ShopifyShop::find($shopId);
$monthlyCost = AiUsageMetric::getTotalCostForRange(
    $shop->id,
    now()->startOfMonth(),
    now()->endOfMonth()
);
echo "本月花费: \${$monthlyCost}";
```

### 超额控制

```php
// 检查日限
$todayUsage = AiUsageMetric::today()
    ->forShop($shop->id)
    ->byAgentType('backend_assistant')
    ->sum('token_used');

$config = $shop->aiTenantConfig;
$dailyLimit = $config->getDailyLimit();

if ($todayUsage >= $dailyLimit) {
    return response()->json(['error' => 'Daily limit exceeded'], 429);
}

// 检查月限
$monthlyUsage = AiUsageMetric::thisMonth()
    ->forShop($shop->id)
    ->sum('token_used');

$monthlyLimit = $config->getQuota()['monthly_limit'];

if ($monthlyUsage >= $monthlyLimit) {
    // 降级到更便宜的模型（gpt-3.5-turbo 而非 gpt-4）
    $config->updateSetting('model_config.model', 'gpt-3.5-turbo');
}
```

---

## 实施清单

### Phase 1: 基础架构 (第 1 周)
- [ ] 运行迁移文件创建 5 张表
- [ ] 验证数据库结构
- [ ] 补充 ShopifyShop 模型的关系方法
- [ ] 完善 AiConfig 的默认值和业务方法
- [ ] 完善 AiConversation 和 AiMessage 模型
- [ ] 完善 AiUsageMetric 模型

### Phase 2: 后台 AI 助手 (第 2-3 周)
- [ ] 创建 `TenantContext` 服务类（租户管理）
- [ ] 创建 `AiConversationService`（会话生命周期）
- [ ] 创建 `AdminAiService`（调用 LLM、保存消息）
- [ ] 创建 `AiMetricsService`（记录成本和使用量）
- [ ] 修改现有 Admin API 端点，集成多租户逻辑
- [ ] 编写测试，确保数据隔离

### Phase 3: 前端 Storefront MCP (第 4-5 周)
- [ ] 修改 MCP 服务器，支持从 Laravel 拉取配置
- [ ] 为每个 MCP 工具添加租户识别
- [ ] 为 MCP 工具添加消息记录（ai_messages）
- [ ] 测试多店 MCP 独立运行

### Phase 4: 报表和管理界面 (第 6 周)
- [ ] 创建后台管理页面（AI 配置管理）
- [ ] 创建报表页面（使用统计、成本、转化率）
- [ ] 添加 webhook，实时同步 Shopify 安装/卸载事件

### Phase 5: 生产准备 (第 7 周)
- [ ] 负载测试（多店并发对话）
- [ ] 安全审计（租户隔离、token 加密）
- [ ] 监控告警（配置告警规则）
- [ ] 文档完善

---

## 关键代码片段

### 创建会话和消息

```php
// 在 AiConversationService 中
class AiConversationService
{
    public function startConversation(
        ShopifyShop $shop,
        string $agentType,
        ?string $userId = null,
        ?string $customerId = null
    ): AiConversation {
        $config = AiConfig::where('shopify_shop_id', $shop->id)
                         ->where('agent_type', $agentType)
                         ->firstOrFail();

        return AiConversation::create([
            'shopify_shop_id' => $shop->id,
            'ai_config_id' => $config->id,
            'tenant_key' => $shop->getTenantKey(),
            'agent_type' => $agentType,
            'user_id' => $userId,
            'customer_id' => $customerId,
            'started_at' => now(),
            'metadata' => [
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ],
        ]);
    }

    public function addMessage(
        AiConversation $conversation,
        string $role,
        string $content,
        ?string $toolName = null,
        ?array $toolInput = null,
        ?array $toolOutput = null
    ): AiMessage {
        return $conversation->addMessage(
            $role,
            $content,
            $toolName,
            $toolInput,
            $toolOutput
        );
    }

    public function endConversation(AiConversation $conversation): void
    {
        $conversation->update([
            'message_count' => $conversation->messages()->count(),
            'token_used' => $conversation->messages()->sum('tokens_used'),
            'ended_at' => now(),
        ]);
    }
}
```

### 中间件：租户隔离

```php
// app/Http/Middleware/TenantMiddleware.php
class TenantMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // 从路由或请求头获取 shop_id
        $shopId = $request->route('shopId');
        $shop = ShopifyShop::findOrFail($shopId);

        if (!$shop->isActive()) {
            return response()->json(['error' => 'Shop not active'], 403);
        }

        // 保存到容器，供后续使用
        app()->instance('current_shop', $shop);
        app()->instance('current_tenant_key', $shop->getTenantKey());

        return $next($request);
    }
}
```

### 快速访问当前租户

```php
// 在任何地方使用
$shop = app('current_shop');        // ShopifyShop instance
$tenantKey = app('current_tenant_key');  // string (shop_domain)

// 或创建一个 Helper
function currentShop(): ShopifyShop {
    return app('current_shop');
}

function currentTenantKey(): string {
    return app('current_tenant_key');
}
```

---

## 总结

这套系统的核心是：

1. **租户隔离**：每条记录都带 `shopify_shop_id`
2. **配置集中**：所有 agent 配置都在 `ai_configs.settings` JSON
3. **消息记录**：详细保存每条消息、每次工具调用
4. **计量准确**：按天汇总成本和使用情况
5. **扩展灵活**：支持添加新的 agent 类型而不改表结构

**下一步**：开始实施 Phase 1，创建迁移和模型，然后逐步集成到现有的后台和前端 AI 逻辑中。

