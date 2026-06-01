# Agent Control Center - 快速参考

## 🎯 核心概念

| 概念 | 说明 | 存储位置 |
|------|------|---------|
| **Agent** | 执行特定任务的智能体（例：市场调研、Listing 生成） | agent_configs |
| **Tool** | Agent 可以使用的工具（例：Google Trends、Amazon API） | tool_configs |
| **Workflow** | 多个 Agent 组成的工作流（例：一键生成完整方案） | workflow_configs |
| **Prompt** | Agent 的系统指令，支持变量和版本管理 | prompt_configs |
| **Model** | LLM 模型配置（例：GPT-4、Claude3、Gemini） | model_configs |
| **MCP** | 知识库和外部服务连接 | mcp_configs |

---

## 🔧 常见操作

### 1️⃣ 创建新 Agent（后台操作）

**场景：** 需要一个"供应链分析 Agent"

**步骤：**
```sql
-- 1. 创建或选择 System Prompt
INSERT INTO prompt_configs (namespace, name, content, version, status)
VALUES (
  'domain_prompts.supply_chain_expert_v1',
  '供应链专家',
  '你是世界级供应链分析师，专注于电商物流优化...',
  '1.0',
  'production'
);

-- 2. 创建 Agent
INSERT INTO agent_configs (
  namespace, name, model_id, system_prompt_id, 
  max_tokens, temperature, enabled
)
VALUES (
  'ai_center.supply_chain',
  '供应链 Agent',
  1,  -- GPT-4
  6,  -- 刚创建的 prompt
  4000,
  0.7,
  1
);

-- 3. 绑定工具
INSERT INTO agent_tool_bindings (agent_id, tool_id, priority)
VALUES 
  (5, 3, 0),  -- 1688 采购 API
  (5, 4, 1),  -- 物流查询 API
  (5, 5, 2);  -- 成本分析
```

### 2️⃣ 创建工作流

**场景：** "一键启动新市场" 工作流

```sql
INSERT INTO workflow_configs (namespace, name, graph, enabled)
VALUES (
  'workflows.new_market_launch',
  '新市场启动流程',
  JSON_OBJECT(
    'nodes', JSON_ARRAY(
      JSON_OBJECT('id', 'step1', 'agent_id', 1, 'timeout', 60),
      JSON_OBJECT('id', 'step2', 'agent_id', 2, 'timeout', 45),
      JSON_OBJECT('id', 'step3', 'agent_id', 3, 'timeout', 120)
    ),
    'edges', JSON_ARRAY(
      JSON_OBJECT('from', 'step1', 'to', 'step2'),
      JSON_OBJECT('from', 'step1', 'to', 'step3'),
      JSON_OBJECT('from', 'step2', 'to', 'step3')
    )
  ),
  1
);
```

### 3️⃣ A/B 测试两个 Prompt

**场景：** 测试不同的 system prompt 对市场调研质量的影响

```sql
-- 控制版本（当前生产）
INSERT INTO prompt_configs (namespace, version, status, content, variant_type)
VALUES ('domain_prompts.market_expert', 'v2.0', 'production', '...', 'control');

-- 变体 A（更激进的风格）
INSERT INTO prompt_configs (namespace, version, status, content, variant_type, parent_id)
VALUES ('domain_prompts.market_expert', 'v2.1a', 'testing', '...更激进版本...', 'variant_a', 7);

-- 变体 B（更保守的风格）
INSERT INTO prompt_configs (namespace, version, status, content, variant_type, parent_id)
VALUES ('domain_prompts.market_expert', 'v2.1b', 'testing', '...更保守版本...', 'variant_b', 7);

-- 等 AB 测试完成，选择最好的升级为 production
UPDATE prompt_configs SET status = 'production' WHERE id = 8;
UPDATE prompt_configs SET status = 'archived' WHERE id = 7;
```

### 4️⃣ 模型故障转移

**场景：** OpenAI API 不稳定，需要配置 Claude 作为备用

```sql
-- 主模型：GPT-4-Turbo
INSERT INTO model_configs (namespace, provider, model_name, priority, enabled)
VALUES ('openai.gpt4', 'openai', 'gpt-4-turbo', 0, 1);

-- 备用模型：Claude-3-Opus
INSERT INTO model_configs (
  namespace, provider, model_name, priority, 
  fallback_model_id, enabled
)
VALUES (
  'anthropic.claude3',
  'anthropic',
  'claude-3-opus-20240229',
  1,
  NULL,  -- Claude 是最终选项
  1
);

-- 更新 GPT-4 配置，指向 Claude 作为故障转移
UPDATE model_configs 
SET fallback_model_id = 2 
WHERE id = 1;

-- 未来如果 OpenAI 不可用，AgentRuntimeFactory 会自动用 Claude
```

### 5️⃣ 监控 Agent 执行成本

```sql
-- 查看过去 7 天的成本
SELECT 
  a.name as agent_name,
  COUNT(*) as execution_count,
  SUM(ael.cost) as total_cost,
  AVG(ael.execution_duration_ms) as avg_duration_ms,
  SUM(CASE WHEN ael.status = 'success' THEN 1 ELSE 0 END) / COUNT(*) as success_rate
FROM agent_execution_logs ael
JOIN agent_configs a ON ael.agent_id = a.id
WHERE ael.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY a.id
ORDER BY total_cost DESC;

-- 查看某个工作流的成本
SELECT 
  ael.metadata->'$.node_id' as node_id,
  COUNT(*) as runs,
  SUM(ael.cost) as total_cost
FROM agent_execution_logs ael
WHERE ael.metadata->'$.workflow_id' = 5
GROUP BY ael.metadata->'$.node_id';
```

---

## 📊 性能基准

### Agent 执行时间
| Agent | 平均耗时 | Token 消耗 | 成本 |
|-------|---------|-----------|------|
| 市场调研 | 45s | 2500 | ¥0.08 |
| Listing 生成 | 25s | 1500 | ¥0.05 |
| 广告方案 | 35s | 2000 | ¥0.07 |
| 达人匹配 | 30s | 1800 | ¥0.06 |

### Workflow 执行时间
| Workflow | 节点数 | 平均耗时 | 总成本 |
|----------|-------|---------|--------|
| 新市场启动 | 4 | 180s | ¥0.28 |
| 运营优化周期 | 6 | 320s | ¥0.45 |

---

## 🔐 权限与可见性

### Agent 配置权限
| 角色 | 创建 | 编辑 | 删除 | 发布 |
|------|------|------|------|------|
| 超级管理员 | ✅ | ✅ | ✅ | ✅ |
| 运营管理员 | ❌ | ✅ | ❌ | ✅ |
| 店铺老板 | ❌ | ❌ | ❌ | ❌ |

```php
// 权限检查示例
if (!auth()->user()->is_admin) {
    throw new AuthorizationException('仅管理员可创建 Agent');
}
```

---

## 💡 最佳实践

### ✅ 应该做

1. **定期备份 Prompt 版本**
   ```sql
   -- 每次重要调整前创建新版本
   INSERT INTO prompt_configs 
   SELECT * FROM prompt_configs 
   WHERE id = 7
   AND version = '2.0_backup_' + DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');
   ```

2. **使用条件分支减少成本**
   ```json
   {
     "nodes": [{
       "id": "check_market_size",
       "condition": "market_size > 500000",
       "next_if_true": "deep_analysis",
       "next_if_false": "skip"
     }]
   }
   ```

3. **监控模型 API 配额**
   ```php
   // 每小时检查 Model 配额
   $model->monthly_quota_budget = 1000;  // ¥1000
   $used = AgentExecutionLog::where('model_id', $model->id)
     ->whereMonth('created_at', now()->month)
     ->sum('cost');
   
   if ($used > $model->monthly_quota_budget * 0.8) {
       // 发送告警
   }
   ```

### ❌ 不应该做

1. ❌ 直接在代码中硬编码 Prompt（应该放在数据库）
2. ❌ 每次改 Agent 都改代码（应该用后台编辑）
3. ❌ 忽视执行日志（应该定期审查）
4. ❌ 没有故障转移模型（应该配置备用 Model）

---

## 🚀 运行时示例

### 基本流程

```php
use App\Services\AgentControl\AgentRuntimeFactory;
use App\Services\AgentControl\WorkflowExecutor;
use App\Models\WorkflowConfig;

// 场景 1: 直接执行单个 Agent
$agent = AgentRuntimeFactory::createFromConfig(
    namespace: 'ai_center.market_research',
    context: [
        'product_name' => '银河底板',
        'market' => 'Germany',
        'language' => 'de'
    ]
);

$result = $agent->execute([
    'sku' => 'MILKY_WAY_PRO',
    'current_price' => 199,
    'user_language' => 'de'
]);

// 结果
// [
//   'market_size' => '€450M annually',
//   'growth_rate' => '5.2% CAGR',
//   'competitors' => ['Butterfly', 'Stiga'],
//   'opportunity_score' => 8.7
// ]

// 场景 2: 执行完整工作流
$workflow = WorkflowConfig::where('namespace', 'workflows.germany_entry')->first();
$executor = new WorkflowExecutor($workflow);

$result = $executor->execute(
    initialInput: ['product_id' => 123, 'market' => 'Germany'],
    context: ['store_id' => 1, 'user_id' => 456]
);

// 结果
// [
//   'status' => 'success',
//   'results' => [
//     'step1_market' => [...],
//     'step2_competitor' => [...],
//     'step3_listing' => [...],
//     'step4_ads' => [...]
//   ],
//   'final_output' => [...],
//   'total_cost' => 0.28,
//   'total_duration_ms' => 245000
// ]
```

---

## 📈 数据分析示例

### 找出最受欢迎的工作流
```sql
SELECT 
  w.namespace,
  w.name,
  COUNT(DISTINCT ael.id) as execution_count,
  AVG(
    CAST(ael.metadata->>'$.total_duration_ms' AS UNSIGNED)
  ) / 1000 as avg_duration_sec,
  SUM(CAST(ael.cost AS DECIMAL(10,2))) as total_revenue
FROM agent_execution_logs ael
JOIN workflow_configs w ON ael.metadata->>'$.workflow_id' = w.id
WHERE ael.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY w.id
ORDER BY execution_count DESC;
```

### 识别低成功率的 Agent
```sql
SELECT 
  a.namespace,
  a.name,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  ROUND(
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*) * 100,
    2
  ) as success_rate,
  GROUP_CONCAT(DISTINCT error_message) as error_types
FROM agent_execution_logs ael
JOIN agent_configs a ON ael.agent_id = a.id
WHERE ael.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY a.id
HAVING success_rate < 90
ORDER BY success_rate ASC;
```

---

## 🔗 相关文档

- [AGENT_CONTROL_CENTER.md](AGENT_CONTROL_CENTER.md) - 完整架构设计
- [PLATFORM_ARCHITECTURE_MVP.md](PLATFORM_ARCHITECTURE_MVP.md) - MVP 业务设计
- [DEEPAGENTS_ARCHITECTURE.md](DEEPAGENTS_ARCHITECTURE.md) - DeepAgents 集成

**下一步：** 在管理后台实现这些概念！
