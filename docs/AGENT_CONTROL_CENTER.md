# Agent Control Center - 可配置平台架构

## 核心设计理念

Agent、Tool、Workflow、Prompt、Model 全部可配置，后台完全解耦代码。

```
超级管理员 Control Center
    ├── Agent Factory
    ├── Tool Factory  
    ├── Workflow Factory
    ├── Prompt Factory
    ├── Model Factory
    └── MCP Factory
            ↓
    (存储到数据库)
            ↓
    LarAgent Runtime (动态加载)
            ↓
    执行引擎
```

## 数据库架构

### 1. Agent 配置表

```sql
CREATE TABLE agent_configs (
  id BIGINT PRIMARY KEY,
  namespace VARCHAR(255),  -- 如 'ai_center.market_research'
  name VARCHAR(255),  -- 市场调研Agent
  description TEXT,
  icon VARCHAR(255),  -- 前端图标
  enabled BOOLEAN DEFAULT TRUE,
  
  -- 核心配置
  model_id BIGINT FOREIGN KEY (models.id),
  system_prompt_id BIGINT FOREIGN KEY (prompts.id),
  
  -- 运行时限制
  max_tokens INT DEFAULT 4000,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  top_p DECIMAL(3,2),
  timeout_seconds INT DEFAULT 120,
  
  -- 权限与可见性
  min_role VARCHAR(50),  -- admin, merchant, customer
  is_public BOOLEAN DEFAULT FALSE,
  tags JSON,  -- ['market_research', 'analysis']
  
  metadata JSON,
  version INT DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### 2. Tool 配置表

```sql
CREATE TABLE tool_configs (
  id BIGINT PRIMARY KEY,
  namespace VARCHAR(255),  -- 如 'google_trends', 'amazon_search'
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(50),  -- http, db_query, mcp_service, custom_function
  
  -- 实现细节
  handler_class VARCHAR(255),  -- 实际执行类
  icon VARCHAR(255),
  documentation TEXT,
  
  -- 配置参数
  config JSON,  -- {"api_key": "...", "endpoint": "..."}
  required_params JSON,  -- [{"name": "query", "type": "string"}]
  
  enabled BOOLEAN DEFAULT TRUE,
  tags JSON,  -- ['market_research', 'competitor_analysis']
  
  -- 限流
  rate_limit INT,  -- 每天调用上限
  cost_per_call DECIMAL(10,4),  -- 成本统计
  
  metadata JSON,
  version INT DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. Agent ↔ Tool 关联表

```sql
CREATE TABLE agent_tool_bindings (
  id BIGINT PRIMARY KEY,
  agent_id BIGINT FOREIGN KEY (agent_configs.id),
  tool_id BIGINT FOREIGN KEY (tool_configs.id),
  
  -- 工具参数映射
  tool_params JSON,  -- {"market": "Germany", "lang": "de"}
  
  -- 使用优先级
  priority INT,
  
  -- 条件执行
  condition JSON,  -- {"when": "market_size > 1000000"}
  
  -- 链式调用
  next_tool_id BIGINT NULLABLE,  -- 前一个工具输出 → 后一个工具输入
  
  created_at TIMESTAMP
);
```

### 4. Workflow 配置表

```sql
CREATE TABLE workflow_configs (
  id BIGINT PRIMARY KEY,
  namespace VARCHAR(255),  -- 如 'market_entry'
  name VARCHAR(255),  -- 德国市场启动流程
  description TEXT,
  icon VARCHAR(255),
  
  -- 工作流定义
  graph JSON,  -- DAG (有向无环图)
  -- 例：{
  --   "nodes": [
  --     {"id": "market_research", "agent_id": 1, "timeout": 60},
  --     {"id": "competitor", "agent_id": 2, "timeout": 45},
  --     {"id": "listing_gen", "agent_id": 3, "timeout": 120}
  --   ],
  --   "edges": [
  --     {"from": "market_research", "to": "competitor"},
  --     {"from": "market_research", "to": "listing_gen"},
  --     {"from": "competitor", "to": "listing_gen"}
  --   ]
  -- }
  
  enabled BOOLEAN DEFAULT TRUE,
  
  -- 运行策略
  execution_mode VARCHAR(50),  -- sequential, parallel, conditional
  retry_strategy JSON,
  timeout_seconds INT,
  
  -- 成本与性能
  avg_cost DECIMAL(10,4),
  avg_duration_seconds INT,
  success_rate DECIMAL(5,4),
  
  metadata JSON,
  version INT DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. Prompt 配置表

```sql
CREATE TABLE prompt_configs (
  id BIGINT PRIMARY KEY,
  namespace VARCHAR(255),  -- 'system_prompts.market_research_v1'
  name VARCHAR(255),
  description TEXT,
  
  -- Prompt 内容
  content TEXT,  -- 支持 {{变量}}
  variables JSON,  -- [{"name": "product_name", "type": "string", "default": ""}]
  
  -- 版本管理
  version VARCHAR(50),  -- v1, v1.1, v2
  status VARCHAR(50),  -- draft, testing, production, archived
  
  -- 性能指标
  avg_quality_score DECIMAL(3,2),
  test_results JSON,
  
  -- 变体/AB测试
  variant_type VARCHAR(50),  -- control, variant_a, variant_b
  parent_id BIGINT NULLABLE,
  
  enabled BOOLEAN DEFAULT TRUE,
  tags JSON,
  
  metadata JSON,
  created_by INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 6. Model 配置表

```sql
CREATE TABLE model_configs (
  id BIGINT PRIMARY KEY,
  namespace VARCHAR(255),  -- 'openai.gpt4', 'anthropic.claude3', 'google.gemini2'
  name VARCHAR(255),
  provider VARCHAR(100),  -- openai, anthropic, google, local, etc
  model_name VARCHAR(255),  -- gpt-4-turbo, claude-3-opus, gemini-2.0-flash
  
  -- API 配置
  api_endpoint VARCHAR(255),
  api_key_encrypted VARCHAR(255),
  api_key_backup VARCHAR(255),
  
  -- 模型能力
  max_tokens INT,
  context_window INT,
  supports_function_calling BOOLEAN,
  supports_vision BOOLEAN,
  supports_json_mode BOOLEAN,
  
  -- 成本
  input_cost_per_1k DECIMAL(10,6),
  output_cost_per_1k DECIMAL(10,6),
  
  -- 性能指标
  avg_latency_ms INT,
  availability_percentage DECIMAL(5,2),
  
  -- 使用限制
  enabled BOOLEAN DEFAULT TRUE,
  rate_limit_per_minute INT,
  monthly_quota_budget DECIMAL(10,2),
  
  priority INT DEFAULT 0,  -- 优先级，0最高
  fallback_model_id BIGINT NULLABLE,  -- 失败时回源模型
  
  tags JSON,
  metadata JSON,
  version INT DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 7. Model ↔ Agent 映射表

```sql
CREATE TABLE model_agent_mappings (
  id BIGINT PRIMARY KEY,
  agent_id BIGINT FOREIGN KEY (agent_configs.id),
  model_id BIGINT FOREIGN KEY (model_configs.id),
  
  -- 优先级与条件
  priority INT,
  condition JSON,  -- {"token_count > 3000": "use_fallback"}
  
  -- 参数覆盖
  temperature_override DECIMAL(3,2) NULLABLE,
  max_tokens_override INT NULLABLE,
  
  created_at TIMESTAMP
);
```

### 8. MCP (Model Context Protocol) 配置表

```sql
CREATE TABLE mcp_configs (
  id BIGINT PRIMARY KEY,
  namespace VARCHAR(255),  -- 'knowledge_index.products'
  name VARCHAR(255),
  description TEXT,
  
  -- MCP 服务
  server_url VARCHAR(255),
  server_type VARCHAR(50),  -- qdrant, langchain_hub, custom
  auth_token_encrypted VARCHAR(255),
  
  -- 知识库连接
  knowledge_base_id VARCHAR(255),
  embedding_model VARCHAR(255),
  chunk_size INT DEFAULT 1024,
  overlap INT DEFAULT 100,
  
  -- 搜索策略
  search_method VARCHAR(50),  -- similarity, hybrid, bm25
  top_k INT DEFAULT 5,
  similarity_threshold DECIMAL(3,2),
  
  enabled BOOLEAN DEFAULT TRUE,
  tags JSON,
  metadata JSON,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 9. Agent 使用日志表（用于分析和优化）

```sql
CREATE TABLE agent_execution_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT,
  user_id BIGINT,
  
  agent_id BIGINT FOREIGN KEY (agent_configs.id),
  model_id BIGINT,
  
  -- 输入输出
  input_text TEXT,
  input_tokens INT,
  output_tokens INT,
  
  result TEXT,
  status VARCHAR(50),  -- success, partial, failed, timeout
  error_message TEXT NULLABLE,
  
  -- 性能
  execution_duration_ms INT,
  cost DECIMAL(10,6),
  
  -- 用户反馈
  user_rating INT,  -- 1-5
  user_feedback TEXT,
  
  metadata JSON,
  created_at TIMESTAMP,
  INDEX (store_id, created_at),
  INDEX (agent_id, created_at)
);
```

## API 端点设计

### Admin APIs

```
GET  /admin/api/agents              -- 列出所有 Agent 配置
POST /admin/api/agents              -- 创建新 Agent
GET  /admin/api/agents/{id}         -- 获取 Agent 详情
PUT  /admin/api/agents/{id}         -- 更新 Agent
DELETE /admin/api/agents/{id}       -- 删除 Agent
PATCH /admin/api/agents/{id}/toggle -- 启用/禁用

GET  /admin/api/tools               -- 列出所有 Tool 配置
POST /admin/api/tools               -- 创建新 Tool
PUT  /admin/api/tools/{id}
DELETE /admin/api/tools/{id}
POST /admin/api/tools/{id}/test     -- 测试 Tool 连接

GET  /admin/api/workflows           -- 列出工作流
POST /admin/api/workflows           -- 创建工作流
GET  /admin/api/workflows/{id}
PUT  /admin/api/workflows/{id}
DELETE /admin/api/workflows/{id}
POST /admin/api/workflows/{id}/execute  -- 手动执行工作流

GET  /admin/api/prompts             -- 列出 Prompt 版本
POST /admin/api/prompts             -- 创建新 Prompt
PUT  /admin/api/prompts/{id}
POST /admin/api/prompts/{id}/versions  -- 版本管理

GET  /admin/api/models              -- 列出 Model 配置
POST /admin/api/models              -- 新增 Model
PUT  /admin/api/models/{id}
POST /admin/api/models/{id}/test    -- 测试 Model 连接

GET  /admin/api/mcps                -- 列出 MCP 配置
POST /admin/api/mcps                -- 配置新 MCP
PUT  /admin/api/mcps/{id}

-- 绑定关系
POST /admin/api/agents/{id}/tools   -- 绑定 Tool 到 Agent
DELETE /admin/api/agents/{id}/tools/{tool_id}

-- 监控与分析
GET  /admin/api/analytics/agent-usage     -- Agent 使用统计
GET  /admin/api/analytics/cost-breakdown  -- 成本分析
GET  /admin/api/analytics/performance     -- 性能指标

POST /admin/api/workflows/publish   -- 发布工作流到生产环境
GET  /admin/api/workflows/versions  -- 查看工作流版本历史
```

### Merchant APIs（商家调用）

```
GET  /api/agents                    -- 获取该店铺可用的 Agent
POST /api/agents/{id}/execute       -- 执行 Agent
POST /api/workflows/{id}/run        -- 执行工作流
GET  /api/my-executions             -- 查看执行历史
GET  /api/my-executions/{id}        -- 查看执行详情
```

## Runtime 集成

### LarAgent 动态加载

```php
namespace Botble\AiCommerce\Services;

class AgentRuntimeFactory
{
    /**
     * 根据配置动态创建 Agent
     */
    public static function createFromConfig(string $agentNamespace, array $context = []): AgentInterface
    {
        // 1. 从数据库读取 Agent 配置
        $config = AgentConfig::where('namespace', $agentNamespace)->firstOrFail();
        
        if (!$config->enabled) {
            throw new Exception("Agent {$agentNamespace} is disabled");
        }
        
        // 2. 读取关联的 Tools
        $tools = $config->tools()->with('tool')->get();
        
        // 3. 读取 System Prompt（支持变量替换）
        $systemPrompt = $config->systemPrompt->renderTemplate($context);
        
        // 4. 读取 Model 配置
        $model = ModelConfig::findOrFail($config->model_id);
        
        // 5. 构建 LarAgent 实例
        $agent = new MartfuryShopkeeperAgent(session_id: uniqid());
        
        // 6. 注册 Tools（动态加载）
        foreach ($tools as $toolBinding) {
            $toolClass = $toolBinding->tool->handler_class;
            $toolInstance = new $toolClass($toolBinding->tool_params);
            $agent->registerTool($toolInstance);
        }
        
        // 7. 设置 System Prompt
        $agent->setSystemPrompt($systemPrompt);
        
        // 8. 设置 Model（支持故障转移）
        $agent->setModelConfig([
            'provider' => $model->provider,
            'model' => $model->model_name,
            'api_key' => decrypt($model->api_key_encrypted),
            'max_tokens' => $config->max_tokens,
            'temperature' => $config->temperature,
        ]);
        
        return $agent;
    }
    
    /**
     * 执行工作流
     */
    public static function executeWorkflow(string $workflowNamespace, array $input): array
    {
        $workflow = WorkflowConfig::where('namespace', $workflowNamespace)->firstOrFail();
        
        $graph = $workflow->graph;
        
        // DAG 拓扑排序执行
        $executor = new WorkflowExecutor($graph);
        
        return $executor->execute($input);
    }
}
```

### Workflow 执行引擎

```php
namespace Botble\AiCommerce\Services;

class WorkflowExecutor
{
    protected array $graph;
    protected array $results = [];
    
    public function __construct(array $graph)
    {
        $this->graph = $graph;
    }
    
    public function execute(array $initialInput): array
    {
        $nodes = $this->graph['nodes'];
        $edges = $this->graph['edges'];
        
        // 拓扑排序
        $sortedNodes = $this->topologicalSort($nodes, $edges);
        
        $currentInput = $initialInput;
        
        foreach ($sortedNodes as $nodeId) {
            $node = collect($nodes)->firstWhere('id', $nodeId);
            
            try {
                // 获取该节点的 Agent
                $agent = AgentRuntimeFactory::createFromConfig(
                    $node['agent_id'],
                    $currentInput
                );
                
                // 执行 Agent
                $result = $agent->execute($currentInput);
                
                // 存储结果
                $this->results[$nodeId] = $result;
                
                // 将输出作为下一个节点的输入
                $currentInput = $this->mergeResults($currentInput, $result);
                
            } catch (Exception $e) {
                // 错误处理与重试
                Log::error("Workflow node {$nodeId} failed", [
                    'error' => $e->getMessage(),
                ]);
                
                throw $e;
            }
        }
        
        return [
            'status' => 'success',
            'workflow_results' => $this->results,
            'final_output' => $currentInput,
        ];
    }
    
    private function topologicalSort(array $nodes, array $edges): array
    {
        // 实现 Kahn 算法或 DFS 进行拓扑排序
        // ...返回排序后的节点 ID
    }
    
    private function mergeResults(array $previous, array $current): array
    {
        return array_merge($previous, $current);
    }
}
```

## Admin 前端布局（Blade / Vue 模板）

```html
<!-- 总后台 Control Center -->
<div class="control-center">
  <div class="sidebar">
    <nav>
      <a href="#agents" class="nav-item">
        <i class="icon-robot"></i> Agent 工厂
      </a>
      <a href="#tools" class="nav-item">
        <i class="icon-tool"></i> Tool 工厂
      </a>
      <a href="#workflows" class="nav-item">
        <i class="icon-workflow"></i> Workflow 工厂
      </a>
      <a href="#prompts" class="nav-item">
        <i class="icon-edit"></i> Prompt 工厂
      </a>
      <a href="#models" class="nav-item">
        <i class="icon-cpu"></i> Model 工厂
      </a>
      <a href="#mcps" class="nav-item">
        <i class="icon-database"></i> MCP 工厂
      </a>
      <a href="#analytics" class="nav-item">
        <i class="icon-chart"></i> 分析
      </a>
    </nav>
  </div>

  <!-- Agent 工厂 -->
  <div id="agents" class="factory-panel">
    <h2>Agent 工厂</h2>
    
    <button class="btn btn-primary">+ 新建 Agent</button>
    
    <table class="factory-table">
      <thead>
        <tr>
          <th>名称</th>
          <th>模型</th>
          <th>工具数</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        @foreach($agents as $agent)
          <tr>
            <td>{{ $agent->name }}</td>
            <td>{{ $agent->model->name }}</td>
            <td>{{ $agent->tools()->count() }}</td>
            <td>
              <span class="badge {{ $agent->enabled ? 'bg-success' : 'bg-danger' }}">
                {{ $agent->enabled ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <a href="#edit-{{ $agent->id }}" class="btn btn-sm btn-edit">编辑</a>
              <a href="#" class="btn btn-sm btn-test">测试</a>
              <a href="#" class="btn btn-sm btn-delete">删除</a>
            </td>
          </tr>
        @endforeach
      </tbody>
    </table>
  </div>

  <!-- Workflow 工厂 -->
  <div id="workflows" class="factory-panel">
    <h2>Workflow 工厂</h2>
    
    <button class="btn btn-primary">+ 新建 Workflow</button>
    
    <!-- 拖拽可视化编辑器 -->
    <div id="workflow-builder" class="workflow-canvas">
      <!-- 左侧：Agent 节点库 -->
      <div class="node-library">
        <h4>可用 Agent</h4>
        <div class="node-item" draggable="true">市场调研</div>
        <div class="node-item" draggable="true">竞品分析</div>
        <div class="node-item" draggable="true">Listing 生成</div>
      </div>
      
      <!-- 中间：Canvas（拖拽放置 + 连接线） -->
      <canvas id="workflow-canvas" class="workflow-editor"></canvas>
      
      <!-- 右侧：节点属性编辑 -->
      <div class="node-properties">
        <h4>节点属性</h4>
        <form>
          <label>Timeout (秒)</label>
          <input type="number" name="timeout" value="60" />
          
          <label>Retry</label>
          <input type="number" name="retry" value="3" />
          
          <label>条件</label>
          <input type="text" name="condition" placeholder="市场规模 > 1000000" />
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  .control-center {
    display: flex;
  }
  
  .sidebar {
    width: 250px;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
  }
  
  .factory-panel {
    flex: 1;
    padding: 20px;
  }
  
  .workflow-builder {
    display: flex;
    gap: 20px;
    height: 600px;
  }
  
  .node-library {
    width: 200px;
    border: 1px solid #ddd;
    padding: 10px;
  }
  
  #workflow-canvas {
    flex: 1;
    border: 1px solid #ddd;
    background: white;
  }
  
  .node-properties {
    width: 250px;
    border: 1px solid #ddd;
    padding: 10px;
  }
</style>
```

## 配置示例

### Agent 创建示例

```json
POST /admin/api/agents

{
  "namespace": "ai_center.market_research",
  "name": "市场调研 Agent",
  "description": "分析目标市场规模、竞争格局、消费者需求",
  "icon": "chart-line",
  "model_id": 1,  // GPT-4-Turbo
  "system_prompt_id": 5,  // 市场研究专家 Prompt v2
  "max_tokens": 4000,
  "temperature": 0.7,
  "min_role": "merchant",
  "tags": ["market_research", "analysis"],
  "metadata": {
    "estimated_cost_per_call": 0.15,
    "typical_duration_seconds": 45
  }
}
```

### Workflow 创建示例

```json
POST /admin/api/workflows

{
  "namespace": "workflows.germany_market_entry",
  "name": "德国市场启动流程",
  "description": "一键分析德国市场并生成 Listing + 广告方案",
  "graph": {
    "nodes": [
      {
        "id": "step1_market",
        "agent_id": 1,
        "timeout": 60,
        "label": "市场调研"
      },
      {
        "id": "step2_competitor",
        "agent_id": 2,
        "timeout": 45,
        "label": "竞品分析"
      },
      {
        "id": "step3_listing",
        "agent_id": 3,
        "timeout": 120,
        "label": "Listing 生成",
        "condition": "market_size > 500000"
      },
      {
        "id": "step4_ads",
        "agent_id": 4,
        "timeout": 90,
        "label": "广告方案"
      }
    ],
    "edges": [
      {"from": "step1_market", "to": "step2_competitor"},
      {"from": "step1_market", "to": "step3_listing"},
      {"from": "step2_competitor", "to": "step4_ads"}
    ]
  },
  "execution_mode": "parallel_with_deps",
  "timeout_seconds": 300
}
```

## 商家侧体验

```
AI 运营中心
├── 🔍 [分析SKU在德国市场]  
│   ↓ 调用 workflows.germany_market_entry
│   - 步骤1：市场调研
│   - 步骤2：竞品分析
│   - 步骤3：Listing 生成
│   - 步骤4：广告方案
│   ↓ (5分钟后)
│   报告已生成 → [查看报告] [接受建议] [拒绝]
│
├── 📝 [生成新 Listing]
│   ↓ 调用 ai_center.listing_agent
│   输入 SKU 信息 → 5 秒后返回
│
├── 📢 [创建广告文案]
│   ↓ 调用 ai_center.ads_agent
│   
└── 👥 [匹配达人]
    ↓ 调用 ai_center.creator_agent
```

## 扩展到其他赛道

```
当需要支持羽毛球、网球等赛道时：

1. 创建新 Prompt：
   POST /admin/api/prompts
   {
     "namespace": "domain_prompts.badminton_expert",
     "content": "你是世界级羽毛球装备专家..."
   }

2. 新 Agent：
   POST /admin/api/agents
   {
     "namespace": "ai_center_badminton.market_research",
     "system_prompt_id": <new_badminton_prompt_id>
   }

3. 新 Workflow：
   POST /admin/api/workflows
   {
     "namespace": "workflows.badminton_germany_entry",
     "graph": { ... }
   }

完全不需要改代码，数小时内上线新赛道。
```

## 总结

| 维度 | 硬编码方式 | Control Center 方式 |
|------|---------|---------|
| 新增 Agent | 改代码 + 部署 | 后台创建 + 即时生效 |
| 调整 Prompt | 改代码 + 部署 | 后台编辑 + AB测试 |
| 更换 Model | 改代码 + 部署 | 后台配置 + 自动转移 |
| 工作流编排 | 写代码 | 拖拽 UI + 即时保存 |
| 扩展赛道 | 重写系统 | 配置 + 无代码 |
| 成本控制 | 盲目 | 实时监控 + 限流 |
| 性能优化 | 困难 | A/B测试 + 数据驱动 |

这才是真正的 Agent SaaS 平台。
