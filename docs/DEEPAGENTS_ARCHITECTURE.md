# DeepAgents 分层架构设计文档

## 架构概览

小球电商系统采用**三层代理架构**，职责清晰、松耦合：

```
用户请求
    ↓
Laravel 业务系统 (用户/团队/店铺/商品/订单/权限/计费)
    ↓
LarAgent (前台接待 + 调度中心)
    ├── 意图识别
    ├── 上下文管理
    ├── 用户权限检查
    ├── 获取业务数据 (ProductTools, OrderTools 等)
    └── 判断是否需要深度分析
         ↓
    DeepBallTool (工具层网关)
         ↓
    DeepAgents API (后端重任务引擎)
    ├── Research Agent (市场调研)
    ├── Competitor Agent (竞品分析)
    ├── SEO Agent (SEO 优化)
    ├── Ads Agent (广告策略)
    └── Report Agent (报告生成)
         ↓
    分析结果 → LarAgent → 整合输出 → 用户
```

## 层级职责说明

### 第一层：Laravel 业务系统

**职责**:
- 存储和管理数据（用户、团队、店铺、商品、订单、权限、计费）
- 处理 HTTP 请求路由
- 提供数据访问接口

**关键模型**:
- `User`, `Shop`, `Product`, `Order` 等

**特点**:
- 同步操作为主
- 实时数据读写
- 支持多租户

---

### 第二层：LarAgent (前台接待 + 调度中心)

**职责**:
- 接收用户请求（聊天消息）
- 进行意图识别（商家想干什么？）
- 管理用户上下文（历史消息、选中商品等）
- 权限检查
- 调度本地工具（ProductTools, OrderTools, AnalyticsTools, MarketingTools）
- 判断是否需要复杂分析，若需要则调用 DeepBallTool

**核心特性**:
- 流式响应（SSE）支持
- 工具调用与返回处理
- 对话历史管理
- 会话隔离（每个商家一个会话）

**工具列表**:
1. **ProductTools**: 获取商品信息、库存、性能数据
2. **OrderTools**: 查询订单、退货、客户信息
3. **AnalyticsTools**: KPI 汇总、销售趋势、热销商品
4. **MarketingTools**: 营销建议、文案优化
5. **DeepBallTool**: 调用 DeepAgents 进行深度分析 ← **新增**

---

### 第三层：DeepBallTool (工具层网关)

**职责**:
- 封装 DeepAgents API 调用
- 收集 LarAgent 上下文（product, market, shop）
- 构建请求 Payload
- 发送到 DeepAgents 后端
- 处理异步响应与错误

**支持的任务类型**:
- `market_research`: 市场机会与竞争分析
- `competitor_analysis`: 竞品策略分析
- `seo_optimization`: SEO 优化建议
- `ad_strategy`: 广告投放策略
- `supply_chain`: 供应链分析

**工作流**:
```
LarAgent 判断 (例如: "帮我分析这款银河底板在德国市场的机会")
    ↓
调用 DeepBallTool 并传递参数:
{
    "task_type": "market_research",
    "product_id": 123,
    "market": "Germany",
    "shop_id": 1
}
    ↓
DeepBallTool 执行:
1. 验证参数 (product_id, market 必填)
2. 从数据库获取 Product 和 Shop 数据
3. 规范化数据为可序列化格式
4. 调用 DeepAgentsService
    ↓
DeepAgentsService 执行:
1. 构建 HTTP 请求 Payload
2. POST 到 DeepAgents API: /api/run
3. 等待响应 (可能 30-120 秒)
4. 解析响应并返回
    ↓
DeepBallTool 返回结果给 LarAgent
    ↓
LarAgent 整合结果，返回给用户
```

---

### 第四层：DeepAgents (深度分析引擎)

**职责**:
- 执行复杂、耗时的分析任务
- 协调多个专家 Agent（Research, Competitor, SEO, Ads, Report）
- 生成深度报告

**特点**:
- 异步执行
- 长时间运行（30-120 秒）
- 结果质量高
- 可独立部署和扩展

---

## 工作流示例

### 场景：商家询问「银河底板在德国市场有机会吗？」

```
1. 用户输入: "帮我分析这款银河底板在德国市场的机会"
   ↓
2. LarAgent.respond() 调用
   - 意图识别: "这是市场分析任务，需要深度研究"
   - 权限检查: ✓ 用户有访问权限
   - 获取上下文: product_id=123, shop_id=1
   ↓
3. LarAgent 判断是否需要 DeepBallTool
   - 简单查询? NO (不是"最近表现如何？")
   - 跨境分析? YES (涉及国际市场)
   - 调用 DeepBallTool ✓
   ↓
4. DeepBallTool.execute({
     task_type: "market_research",
     product_id: 123,
     market: "Germany",
     shop_id: 1
   })
   ↓
5. DeepAgentsService.runMarketResearch(...)
   - 获取 Product#123 数据: {name: "银河底板", category: "乒乓球拍", ...}
   - 获取 Shop#1 数据: {name: "小球电商", established: 2022, ...}
   - 构建 Payload 并 POST 到 DeepAgents
   ↓
6. DeepAgents 处理 (30-120 秒)
   - Research Agent: 德国乒乓球市场趋势
   - Competitor Agent: 竞品对比（Butterfly, Stiga, DHS 等）
   - SEO Agent: 德文关键词建议
   - Ads Agent: 广告预算分配（Google Shopping, Amazon Ads）
   - Report Agent: 综合报告
   ↓
7. DeepAgents 返回结果:
   {
     "success": true,
     "data": {
       "market_size": "€450M annually",
       "market_growth": "5.2% CAGR",
       "competitors": [...],
       "seo_keywords": [...],
       "ad_budget": {...},
       "recommendations": [...]
     }
   }
   ↓
8. DeepBallTool 返回给 LarAgent
   ↓
9. LarAgent 整合输出:
   "德国市场分析完成！根据 DeepAgents 深度研究：
    • 市场规模：4.5 亿欧元/年，增长 5.2%
    • 竞品分析：Butterfly 占 35%，Stiga 占 20%...
    • 建议关键词：Tischtennisschläger, 乒乓球拍...
    • 广告策略：建议投入 €5k/月，重点投放 Google Shopping..."
   ↓
10. 用户收到完整的市场分析报告
```

---

## 配置与启动

### 1. 环境变量配置

在 `.env` 中添加：

```bash
# DeepAgents 后端服务 URL
DEEPAGENTS_URL=http://localhost:8001

# 调试模式（生产设为 false）
DEEPAGENTS_DEBUG=true

# 请求超时时间（秒）
DEEPAGENTS_TIMEOUT=120
```

### 2. DeepAgents 后端部署

下载或克隆 DeepAgents 仓库：

```bash
git clone https://github.com/langchain-ai/deepagents.git
cd deepagents
npm install
npm start
# 服务启动在 http://localhost:8001
```

### 3. 验证集成

使用 `php artisan tinker` 测试：

```php
use App\Services\DeepAgentsService;

$service = new DeepAgentsService();

// 健康检查
$service->isHealthy(); // true/false

// 执行市场研究任务
$result = $service->runMarketResearch(
    Product::find(1),      // 商品对象
    'Germany',             // 目标市场
    Shop::find(1)          // 店铺对象
);

dd($result);
```

---

## 最佳实践

### 1. **何时调用 DeepBallTool**

✓ 应该调用：
- 商家询问跨境市场分析
- 需要竞品深度对比
- SEO 优化建议（多语言）
- 广告策略制定
- 供应链优化

✗ 不应该调用：
- 简单查询（"最近表现如何？"） → 使用 AnalyticsTools
- 单品库存检查 → 使用 ProductTools
- 客户反馈汇总 → 使用 OrderTools

### 2. **错误处理**

DeepBallTool 返回标准格式：

```json
{
  "success": true/false,
  "data": {...} 或 null,
  "error": "错误消息" 或 null
}
```

LarAgent 应检查 `success` 字段，若失败则告知用户：
```
"抱歉，深度分析暂时失败，请稍后重试。"
```

### 3. **性能考虑**

- DeepAgents 任务耗时 30-120 秒，应告知用户"正在分析..."
- 避免连续多次调用（会导致堆积）
- 可考虑缓存常见市场的分析结果

### 4. **成本管理**

如果 DeepAgents 基于 API 调用计费：
- 在 `AiMetricsService` 中记录 DeepBallTool 调用
- 限制免费用户的深度分析次数
- 商业用户支持无限调用

---

## 文件结构

```
app/
├── Services/
│   ├── DeepAgentsService.php        ← DeepAgents HTTP 驱动
│   ├── TenantManager.php
│   ├── AiConversationService.php
│   └── AiMetricsService.php
├── AgentTools/
│   └── DeepBallTool.php             ← LarAgent 工具实现
└── Models/
    └── AiConfig.php, Shop.php, Product.php, ...

platform/plugins/ai-commerce/src/
└── AiAgents/
    └── MartfuryShopkeeperAgent.php   ← 注册了 DeepBallTool

config/
└── deepagents.php                   ← 配置文件

.env.deepagents.example              ← 环境变量示例
```

---

## 下一步计划

1. ✓ 创建 DeepAgentsService 与 DeepBallTool
2. ✓ 注册到 MartfuryShopkeeperAgent
3. ✓ 编写配置与文档
4. □ 部署 DeepAgents 后端（独立服务）
5. □ 端到端测试（LarAgent → DeepBallTool → DeepAgents）
6. □ 与 AiConversationService/AiMetricsService 集成记录
7. □ 添加缓存策略（Redis）
8. □ 性能优化（并发控制、超时处理）
