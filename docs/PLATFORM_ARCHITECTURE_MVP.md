# 小球电商平台架构设计（MVP）

## 核心理念

Agent 作为平台基础能力，而非独立产品。学习 Shopify 的成功要素：**统一数据模型 + 统一工作流 + 统一插件体系**

## 系统架构

```text
前端 (Vue/React/Next)
        ↓
Laravel API (统一入口)
        ↓
业务层（统一数据模型）
├── 品牌中心 (Brand)
├── 店铺中心 (Store)
├── 商品中心 (Product / SKU)
├── 订单中心 (Order)
├── 客户中心 (Customer)
├── 内容中心 (Content)
├── 营销中心 (Campaign)
└── Agent中心 ⭐
        ↓
Agent Engine
├── LarAgent (指令识别 + 本地工具)
├── DeepAgents (深度分析引擎)
└── MCP Tools (外部服务集成)
```

## 数据模型（核心）

```text
Brand
  ├── Store (多店)
  │    ├── Product
  │    │    ├── SKU
  │    │    ├── Sales History
  │    │    ├── Customer Reviews
  │    │    └── Competitor Data
  │    ├── Order
  │    ├── Customer
  │    ├── Campaign
  │    └── Supplier
  ├── Creator (达人/KOL)
  └── Metrics
```

## AI运营中心设计

类似 Shopify Admin 左侧菜单结构

### 第一阶段 MVP（必须做）

```text
AI运营中心
├── 📊 市场调研 Agent
│   ├── 市场规模分析
│   ├── 竞品对标
│   ├── 消费者洞察
│   └── 机会识别
│
├── 📝 Listing Agent
│   ├── 标题优化
│   ├── 描述生成
│   ├── 关键词提取
│   └── A/B测试建议
│
├── 📢 广告 Agent
│   ├── 广告文案生成
│   ├── 投放策略
│   ├── 预算分配
│   └── 效果预测
│
└── 👥 达人 Agent
    ├── 达人匹配
    ├── 合作建议
    ├── 内容创意
    └── ROI预估
```

### 第二阶段（数据量起来后）

```text
├── 🏭 供应链 Agent
│   ├── 库存预警
│   ├── 采购建议
│   ├── 物流优化
│   └── 成本分析
│
├── 🤖 客服 Agent
│   ├── 自动回复
│   ├── 问题分类
│   ├── 知识库学习
│   └── 人工转接
│
├── 🎯 选品 Agent
│   ├── 热销预测
│   ├── 机会发现
│   ├── 风险评估
│   └── 品类规划
│
└── 💰 财务 Agent
    ├── 收支分析
    ├── 盈利预测
    ├── 税务计划
    └── 投资建议
```

## 核心工作流（以"分析SKU在德国市场"为例）

### 当前（不理想）

```text
用户 → 复制粘贴产品信息
     → 复制粘贴竞品信息
     → 复制粘贴销售数据
     → ChatBot → DeepAgents
```

### MVP方案（用户友好）

```text
用户点击：[分析这个SKU在德国市场]
    ↓
Agent 自动从数据库读取：
  ├── Product.name, sku, price, images
  ├── Sales.월ly_sales[Germany], trending, growth_rate
  ├── Competitor.top_5[Germany], their_pricing, features
  ├── Customer.reviews[Germany], sentiment, pain_points
  └── Market.size[Germany], regulations, logistics_cost
    ↓
调用 DeepAgents 进行深度分析
    ↓
返回结构化报告：
  ├── 机会评分
  ├── 竞品差异化
  ├── 定价策略
  ├── Listing改进方案
  └── 推荐投放
```

## 数据库设计（新增）

### 品牌与店铺层级

```text
brands
  id, name, logo, description, owner_id

stores
  id, brand_id, platform (Shopify/Amazon/Tiktok/etc), name, url
  api_keys (encrypted), metrics, created_at

products
  id, store_id, title, description, images[], category_id
  price, sku, supplier_id, created_at, updated_at

skus
  id, product_id, sku_code, size, color, stock, sales_volume
  cost, margin, rating, reviews_count

orders
  id, store_id, product_id, quantity, customer_id, amount
  status, created_at, paid_at, shipped_at

customers
  id, store_id, name, email, country, purchase_history, lifetime_value

campaigns
  id, store_id, type (ad/creator/content), budget, status
  start_date, end_date, metrics (impressions, clicks, conversions)

creators (达人/KOL)
  id, platform (TikTok/YouTube/etc), name, followers, engagement_rate
  niche, contact_info, past_campaigns, price_per_post

suppliers
  id, name, location, products[], lead_time, price, reviews

ai_conversations
  id, store_id, user_id, agent_type (market_research/listing/etc)
  context (product_id, market, etc), messages[], created_at

ai_reports
  id, store_id, type, input_params, output, created_at
  used_by (store_id/user_id), impact_metrics
```

## Agent→工具映射

### 市场调研 Agent

```text
工具：
├── DeepBallTool (DeepAgents)
│   └── market_research, competitor_analysis
├── ProductTool
│   └── get_sales_data, get_reviews
├── SupplierTool
│   └── get_pricing, availability
└── MarketTool
    └── get_market_size, regulations
```

### Listing Agent

```text
工具：
├── ProductTool (读取)
├── KeywordTool
│   └── extract_keywords, trending_terms
├── CompetitorTool
│   └── analyze_top_listings
└── AmazonTool / ShopifyTool
    └── get_current_listing, upload_changes
```

### 广告 Agent

```text
工具：
├── CampaignTool
│   └── get_performance, budget_allocation
├── AudienceTool
│   └── get_audience_segments
├── CreativeTool
│   └── generate_ad_copy, images
└── AdPlatformTool
    └── launch_campaign, track_metrics
```

### 达人 Agent

```text
工具：
├── CreatorTool
│   └── search, filter, get_pricing
├── AnalyticsTool
│   └── predict_roi, engagement_forecast
└── ContractTool
    └── generate_brief, track_deliverables
```

## MVP实现路线图

### Phase 1: 数据基础（第1周）

- [x] 统一数据模型设计（完成）
- [ ] Database migration (brands, stores, products, skus, customers, campaigns, creators)
- [ ] Eloquent Models 创建
- [ ] 权限与租户隔离

### Phase 2: 核心业务逻辑（第2周）

- [ ] Store API (增删改查)
- [ ] Product / SKU 管理
- [ ] Sales Data 同步（接入 Shopify / Amazon API）
- [ ] Customer Data 聚合

### Phase 3: AI运营中心前端（第3周）

- [ ] Admin Dashboard 菜单
- [ ] 4个 Agent 的 UI（市场调研、Listing、广告、达人）
- [ ] 报告展示组件

### Phase 4: Agent能力交付（第4周）

- [ ] 市场调研 Agent 完整流程
- [ ] Listing Agent 实现
- [ ] 广告 Agent 实现
- [ ] 达人 Agent 实现

### Phase 5: 上线与优化（第5周）

- [ ] 内测与bug修复
- [ ] 性能优化
- [ ] 合规检查
- [ ] 正式上线

## 成功指标（商业化）

```text
月度活跃店铺 (MAU)
  ├── 使用 AI 运营中心的店铺占比
  ├── 平均使用频率（次/周）
  └── 功能粘性排序

Agent执行效果
  ├── 建议被采纳率
  ├── 平均ROI提升
  ├── 用户满意度评分
  └── 退出率

商业价值
  ├── 按功能收费 (市场调研¥99/次, Listing¥49/次, 等)
  ├── 按使用量收费 (DAU×0.5¥)
  ├── 订阅制 (¥299/月 all-in-one)
  └── 年度ARPU
```

## 为什么这样设计会成功

1. **用户看到的是功能，不是技术**
   - 不说"我们用了DeepAgents"
   - 直接说"用AI分析市场，10秒出报告"

2. **数据驱动，不靠编造**
   - Agent看的全是真实数据
   - 建议有据可查，用户更信任

3. **逐步迭代，快速变现**
   - MVP只需4个Agent，不过度设计
   - 每个Agent独立计费，可快速验证商业模式

4. **平台效应**
   - Store ← Supplier → Creator 形成生态
   - Agent跨越环节，用户粘性高

5. **易于扩展**
   - 新的Agent只需新工具
   - 数据模型已统一，集成成本低
