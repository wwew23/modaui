# AI 多行业聊天插件 - 完整实现总结

## 📋 项目概述

这是一个为 Botble CMS 构建的多行业 AI 聊天系统插件，支持多个行业领域、不同角色的 AI 员工、聊天会话管理和完整的后台管理界面。

**项目地址**: [https://github.com/wwew23/modaui](https://github.com/wwew23/modaui)

---

## 🏗️ 架构设计

### 数据模型

#### 1. **Industry** (行业模型)
- 代表不同的业务领域（服装、餐饮、零售、美业、酒店、汽车）
- **关键字段**:
  - `name`: 行业名称（如"服装行业"）
  - `slug`: URL 友好标识（如"fashion"）
  - `emoji`: 表情符号用于UI展示
  - `color`: 品牌颜色（#RGB格式）
  - `description`: 行业描述
  - `sort_order`: 排序字段
  - `enabled`: 是否启用状态
  - `metadata`: JSON字段用于扩展数据
  
- **关键关系**:
  - `hasMany('employees')`: 一个行业可以有多个员工
  - `hasMany('chatMessages')`: 一个行业可以有多条聊天消息
  
- **查询方法**:
  - `active()`: 仅获取启用的行业
  - `bySlug($slug)`: 根据slug获取行业
  - `enabledEmployees()`: 获取启用状态的员工

#### 2. **IndustryEmployee** (员工模型)
- 代表行业内的 AI 员工/角色
- **关键字段**:
  - `industry_id`: 所属行业外键
  - `name`: 员工名称
  - `role`: 角色（设计师、厨师、运营商等）
  - `avatar_url`: 头像URL
  - `system_prompt`: 系统提示词（最长2000字符）
  - `model`: 使用的AI模型（如gpt-4）
  - `temperature`: 温度参数（0-2，控制创意度）
  - `max_tokens`: 最大token数（256-8000）
  - `sort_order`: 排序
  - `enabled`: 启用状态
  - `metadata`: JSON扩展字段

- **关键关系**:
  - `belongsTo('industry')`: 属于某个行业
  - `hasMany('chatMessages')`: 处理的聊天消息
  - `hasMany('chatSessions')`: 活跃的聊天会话

- **查询方法**:
  - `byRole($role)`: 按角色筛选
  - `enabled()`: 仅启用的员工

#### 3. **AiChatSession** (聊天会话模型)
- 管理用户与AI的对话会话
- **关键字段**:
  - `session_token`: 唯一会话标识（UUID）
  - `industry_id`: 行业外键
  - `employee_id`: 员工外键
  - `merchant_id`: 商户ID
  - `shop_id`: 店铺ID
  - `started_at`: 会话开始时间
  - `ended_at`: 会话结束时间（NULL表示进行中）
  - `total_messages`: 消息总数
  - `total_tokens`: 使用token总数
  - `metadata`: JSON扩展数据

- **关键方法**:
  - `isActive()`: 判断会话是否活跃（ended_at为NULL且未超时）
  - `close()`: 关闭会话

- **查询方法**:
  - `active()`: 活跃会话
  - `byMerchant($merchantId)`: 按商户筛选

#### 4. **AiChatMessage** (聊天消息模型)
- 存储聊天中的每条消息
- **关键字段**:
  - `session_id`: 所属会话外键
  - `industry_id`: 行业外键
  - `employee_id`: 员工外键
  - `merchant_id`: 商户ID
  - `role`: 消息角色（user/assistant/system）
  - `user_message`: 用户发送的消息
  - `ai_response`: AI的回复
  - `confidence`: 置信度（0-100）
  - `tokens_used`: 该消息使用的tokens
  - `metadata`: JSON扩展数据

- **查询方法**:
  - `byMerchant($merchantId)`: 按商户筛选
  - `byIndustry($industryId)`: 按行业筛选
  - `byEmployee($employeeId)`: 按员工筛选
  - `recent()`: 获取最近的消息

### 核心服务层

#### AiCoordinator 服务
**作用**: 协调用户消息的路由、会话管理和 AI 调用

**关键方法**:

```php
routeMessage(
    $message,           // 用户消息
    $industry,          // Industry模型
    $employee,          // IndustryEmployee模型
    $shopId,            // 店铺ID
    $merchantId         // 商户ID
): array               // 返回响应数据
```

**工作流程**:
1. 验证行业和员工是否启用
2. 获取或创建会话 (`getOrCreateSession`)
3. 构建系统提示词 (`buildEmployeePrompt`)
4. 调用AI服务获取响应
5. 保存消息到数据库 (`saveChatMessage`)
6. 返回包含session_token的响应

**关键特性**:
- 会话持久化：同一用户同一行业同一员工只有一个活跃会话
- UUID会话令牌：确保分布式系统中的唯一性
- 系统提示词融合：融合行业背景 + 员工角色 + 业务指引
- 令牌跟踪：记录每次请求使用的token数

---

## 🎛️ 控制器实现

### IndustryController (行业管理)
**路由前缀**: `admin/ai-multi-industry/industries`

**方法清单**:
- `index()`: 显示行业列表，支持分页、员工数计数、聊天数计数
- `create()`: 显示创建表单
- `store()`: 存储新行业，自动生成slug
- `edit()`: 显示编辑表单
- `update()`: 更新行业信息
- `destroy()`: 删除行业（检查依赖项）
- `getList()`: API端点获取启用的行业列表

**验证规则**:
```
name: 必填|字符串|最长100|unique
slug: 可选|字符串|最长100|unique
color: 正则 /^#[0-9A-F]{6}$/i
enabled: boolean
```

### EmployeeController (员工管理)
**路由前缀**: `admin/ai-multi-industry/employees`

**方法清单**:
- `index()`: 分页显示员工，包含行业、角色、模型等信息
- `create()`: 显示创建表单
- `store()`: 创建员工，设置默认参数
- `edit()`: 显示编辑表单
- `update()`: 更新员工
- `destroy()`: 删除员工（检查是否有聊天记录）
- `getList()`: API端点获取启用的员工

**验证规则**:
```
industry_id: 必填|exists:ai_industries,id
name: 必填|字符串|最长100
role: 必填|字符串|最长100
temperature: 数字|最小0|最大2
max_tokens: 整数|最小100|最大8000
system_prompt: 最长2000
```

### ChatConfigController (聊天配置)
**路由前缀**: `admin/ai-multi-industry/chat-config`

**方法清单**:
- `index()`: 显示配置表单
- `update()`: 保存配置到缓存
- `getConfig()`: API端点返回配置JSON

**可配置项**:
- `default_model`: 默认AI模型
- `temperature`: 默认温度参数
- `max_tokens`: 默认最大tokens
- `welcome_message`: 欢迎消息
- `enable_chat_history`: 是否启用历史记录
- `enable_export`: 是否启用导出
- `max_session_hours`: 会话超时时间

### ChatHistoryController (聊天历史与报告)
**路由前缀**: `admin/ai-multi-industry/chat-history`

**方法清单**:
- `index()`: 显示聊天记录列表，支持多维度筛选
- `show($sessionId)`: 显示单个会话详情
- `statistics()`: API端点返回统计数据
- `export()`: 导出聊天记录（CSV/JSON）

**筛选维度**:
- 行业
- 员工
- 商户
- 时间范围

**导出格式**:
- CSV: 包含会话ID、行业、员工、角色、用户消息、AI回复、时间
- JSON: 完整的消息对象数组

### AiChatController (聊天API)
**路由前缀**: `api/ai-multi-industry`

**方法清单**:
- `handle()`: POST端点处理用户消息
- `getSession()`: GET端点获取活跃会话
- `closeSession()`: POST端点关闭会话

**API端点**:
```
POST   /api/ai-multi-industry/chat
GET    /api/ai-multi-industry/chat/session/{sessionToken}
POST   /api/ai-multi-industry/chat/close-session
```

---

## 📊 数据库架构

### 表结构

#### ai_industries
```sql
CREATE TABLE ai_industries (
    id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    emoji VARCHAR(10),
    color VARCHAR(7),
    description TEXT,
    sort_order INT DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_enabled_slug (enabled, slug),
    INDEX idx_sort_order (sort_order)
);
```

#### ai_industry_employees
```sql
CREATE TABLE ai_industry_employees (
    id BIGINT UNSIGNED PRIMARY KEY,
    industry_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    system_prompt LONGTEXT,
    model VARCHAR(100),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INT DEFAULT 2048,
    sort_order INT DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (industry_id) REFERENCES ai_industries(id) ON DELETE CASCADE,
    INDEX idx_industry_enabled (industry_id, enabled),
    INDEX idx_role (role)
);
```

#### ai_chat_sessions
```sql
CREATE TABLE ai_chat_sessions (
    id BIGINT UNSIGNED PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    industry_id BIGINT UNSIGNED NOT NULL,
    employee_id BIGINT UNSIGNED NOT NULL,
    merchant_id VARCHAR(100),
    shop_id INT,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NULL,
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (industry_id) REFERENCES ai_industries(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES ai_industry_employees(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_active_sessions (ended_at),
    INDEX idx_merchant (merchant_id, created_at)
);
```

#### ai_chat_messages
```sql
CREATE TABLE ai_chat_messages (
    id BIGINT UNSIGNED PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    industry_id BIGINT UNSIGNED NOT NULL,
    employee_id BIGINT UNSIGNED NOT NULL,
    merchant_id VARCHAR(100),
    role VARCHAR(50),
    user_message LONGTEXT,
    ai_response LONGTEXT,
    confidence INT,
    tokens_used INT,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (industry_id) REFERENCES ai_industries(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES ai_industry_employees(id) ON DELETE CASCADE,
    INDEX idx_session_created (session_id, created_at),
    INDEX idx_industry_employee (industry_id, employee_id),
    INDEX idx_merchant (merchant_id)
);
```

---

## 🎨 前端界面

### 行业管理视图
**文件**: `resources/views/admin/industries/`

- **index.blade.php**: 列表视图，显示行业表格，支持编辑/删除
- **create.blade.php**: 创建表单，包括颜色选择器
- **edit.blade.php**: 编辑表单，预填充数据

### 员工管理视图
**文件**: `resources/views/admin/employees/`

- **index.blade.php**: 员工列表，显示所属行业、角色、模型参数
- **create.blade.php**: 创建表单，包括系统提示词编辑
- **edit.blade.php**: 编辑表单

### 聊天配置视图
**文件**: `resources/views/admin/chat-config/index.blade.php`
- 配置默认模型
- 调整温度和token参数
- 设置欢迎消息
- 启用/禁用功能

### 聊天历史视图
**文件**: `resources/views/admin/chat-history/`

- **index.blade.php**: 聊天记录列表，支持多维度筛选和导出
- **show.blade.php**: 聊天详情，消息气泡展示，统计信息

---

## 🔌 API 集成

### 支持的 AI 提供商

通过 `app/Services/AiService` 支持：
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Google Gemini**: Gemini Pro
- **Ollama**: 本地运行的开源模型
- **Claude**: Anthropic Claude

### API 请求示例

**发送聊天消息**:
```bash
POST /api/ai-multi-industry/chat
Content-Type: application/json

{
    "message": "设计一个时尚的手提包",
    "industry_id": 1,
    "employee_id": 5,
    "shop_id": 123,
    "merchant_id": "merchant_001"
}
```

**获取会话**:
```bash
GET /api/ai-multi-industry/chat/session/550e8400-e29b-41d4-a716-446655440000
```

**关闭会话**:
```bash
POST /api/ai-multi-industry/chat/close-session
Content-Type: application/json

{
    "session_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 📦 预配置数据

### 6个预设行业
系统包含配置文件 `config/ai-industries.php`，预定义了6个行业及其部门：

1. **👗 服装行业**
   - 部门: 设计师, 运营商, 市场营销, 采购员
   
2. **🍜 餐饮行业**
   - 部门: 厨师, 运营商, 市场营销, 分析师
   
3. **🏪 零售行业**
   - 部门: 运营商, 市场营销, 分析师
   
4. **💄 美业行业**
   - 部门: 咨询师, 运营商, 市场营销
   
5. **🏨 酒店行业**
   - 部门: 经理, 运营商, 市场营销
   
6. **🚗 汽车行业**
   - 部门: 销售员, 技术员, 经理, 市场营销

---

## 🚀 部署和使用

### 插件安装

1. **复制插件到插件目录**:
   ```bash
   cp -r platform/plugins/ai-multi-industry /path/to/botble/platform/plugins/
   ```

2. **运行数据库迁移**:
   ```bash
   php artisan migrate
   ```

3. **发布配置文件**:
   ```bash
   php artisan vendor:publish --provider="Botble\AiMultiIndustry\Providers\AiMultiIndustryServiceProvider"
   ```

### 初始化数据

```bash
# 运行 seeder 初始化行业和员工数据
php artisan db:seed --class=AiMultiIndustrySeeder
```

### 功能测试

1. 访问后台管理页面
2. 导航到"多行业聊天" → "行业管理"
3. 创建新行业并添加员工
4. 配置聊天参数
5. 通过API测试聊天功能

---

## 🔐 权限控制

系统支持以下权限：
- `ai-industries.index`: 查看行业列表
- `ai-industries.create`: 创建行业
- `ai-industries.edit`: 编辑行业
- `ai-industries.delete`: 删除行业
- 相同权限对应员工和聊天记录

---

## 📝 最佳实践

### 系统提示词编写

```
你是一名专业的{行业}{部门}，拥有丰富的行业经验。
你的职责包括：
- {职责1}
- {职责2}

在进行{任务描述}时，请遵循以下原则：
- {原则1}
- {原则2}

用户可能会询问{常见问题}，请提供专业建议。
```

### 模型选择建议

- **高成本关键业务**: gpt-4 (temperature: 0.3-0.7)
- **创意内容生成**: gpt-4 (temperature: 0.8-1.2)
- **快速回复**: gpt-3.5-turbo (temperature: 0.5)
- **本地部署**: ollama + mistral/llama2

### 监控指标

系统自动追踪：
- 会话数和活跃用户
- 平均回复时间
- Token消耗成本
- 用户满意度（通过置信度）

---

## 🐛 故障排除

### 会话创建失败
- 检查行业和员工是否启用
- 验证 AI 服务连接
- 查看应用日志

### Token消耗过高
- 调整 `max_tokens` 参数
- 优化系统提示词长度
- 使用更轻量级的模型

### 导出失败
- 检查磁盘空间
- 验证数据库连接
- 检查文件权限

---

## 📚 技术栈

- **框架**: Laravel 12, Botble CMS
- **数据库**: MySQL/PostgreSQL
- **缓存**: Redis (可选)
- **API**: RESTful JSON
- **前端**: Blade 模板引擎, Bootstrap 5

---

## 📄 许可证

本项目遵循 Botble CMS 和相关依赖的许可证。

---

## 🤝 贡献

欢迎提交问题、建议和拉取请求！

---

**最后更新**: 2024年12月

**版本**: 1.0.0
