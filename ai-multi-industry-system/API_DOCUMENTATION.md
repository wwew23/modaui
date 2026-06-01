# AI 多行业员工管理系统 API 文档

## 业务场景示例

### 例子1：作为服装设计师咨询

```text
用户: "我要设计一个新的春季服装系列"

系统:
1. CEO分析: "需要设计师"
2. 路由到: 服装行业 → 设计师
3. 设计师回复: "我可以帮你制定春季系列的设计方案..."
```

### 例子2：作为餐饮顾问

```text
用户: "如何提高餐厅的客户体验？"

系统:
1. CEO分析: "需要运营经理"
2. 路由到: 餐饮行业 → 运营经理
3. 运营经理回复: "有以下几个建议..."
```

## 系统流程

1. 用户发送消息到 `POST /api/ai/chat`
2. 后端 `AiCoordinator` 分析用户意图
3. 选择对应行业与员工角色
4. 调用 AI 引擎（OpenAI / Ollama）生成回复
5. 保存聊天记录并返回给前端

## API 端点

### 发送消息

- Method: `POST`
- URL: `/api/ai/chat`
- Content-Type: `application/json`

请求体示例:

```json
{
  "message": "用户的消息",
  "merchant_id": "商户ID"
}
```

响应示例:

```json
{
  "industry": "fashion",
  "employee": "designer",
  "response": "AI的回复",
  "timestamp": "2025-01-15T10:30:00"
}
```

字段说明:

- `industry`：被路由到的行业，例如 `fashion`、`dining`、`retail`、`beauty`、`hotel`、`auto`
- `employee`：AI 员工角色，例如 `designer`、`operations_manager`
- `response`：AI 生成的文本回复
- `timestamp`：消息处理完成时间

### 获取聊天记录

- Method: `GET`
- URL: `/api/ai/chat-history`
- 参数: `merchant_id`

请求示例:

```
GET /api/ai/chat-history?merchant_id=123
```

响应示例:

```json
{
  "data": [
    {
      "id": 1,
      "message": "用户消息",
      "response": "AI回复",
      "created_at": "2025-01-15T10:30:00"
    }
  ]
}
```

字段说明:

- `id`：聊天记录唯一 ID
- `message`：用户输入内容
- `response`：AI 回复内容
- `created_at`：记录创建时间

## 未来扩展点

- 支持多轮上下文追踪
- 支持行业自动推荐
- 支持多语言与用户自定义 prompt
- 支持 WebSocket 实时聊天
