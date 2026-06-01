# 🤖 AI 多行业员工管理系统

> 一个完整的 Laravel + Vue 3 智能AI员工团队管理系统。支持6个行业、多个AI员工、实时聊天、总后台管理。

![Laravel](https://img.shields.io/badge/Laravel-12.x-red?logo=laravel)
![Vue](https://img.shields.io/badge/Vue-3.x-green?logo=vue.js)
![PHP](https://img.shields.io/badge/PHP-8.2+-blue?logo=php)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

---

## 📋 目录

- [什么是这个系统？](#什么是这个系统)
- [快速开始](#快速开始)
- [系统功能](#系统功能)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [API文档](#api文档)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)

---

## 什么是这个系统？

### 问题背景

你有多个业务领域（服装、餐饮、零售等），每个领域有不同的运营需求。如何快速、高效地为每个领域配置专业的 AI 顾问？

### 我们的解决方案

一个**智能AI员工团队**系统，可以：

- 🎯 **自动识别需求** - 用户说什么，AI 自动判断需要哪个部门的哪个员工
- 👥 **多个AI员工** - 设计师、采购、运营、营销、财务等专业角色
- 🏭 **6个行业支持** - 服装、餐饮、零售、美业、酒店、汽车
- 💬 **实时聊天** - WebSocket 实时对话，消息即时同步
- 📊 **完整管理** - 总后台可管理所有行业、员工、聊天记录
- 🔌 **即插即用** - 可作为插件集成到你现有的 Botble 系统

### 工作流程

```
┌─────────────┐
│ 用户消息 │ "帮我设计服装"
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ CEO (AiCoordinator)      │ ← 智能路由
│ 分析: 需要设计师           │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────┐
│ 🏭 服装行业             │
│ 👤 设计师               │ ← 选定员工
│ 📝 系统提示词           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ OpenAI / Ollama        │ ← 调用 AI
│ 生成回复               │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 💬 聊天窗口             │ ← 显示结果
│ "我可以帮你设计..."    │
└──────────────────────┘
```

## 快速开始

### 前置要求

- PHP 8.2+
- Node.js 18+
- Composer
- Git
- OpenAI API Key（或 Ollama）

### 3步启动系统

#### 步骤1：克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/ai-multi-industry-system.git
cd ai-multi-industry-system
```

#### 步骤2：安装依赖

```bash
# 安装 PHP 依赖
composer install

# 安装 Node.js 依赖
npm install
```

#### 步骤3：配置环境

```bash
# 复制环境文件
cp .env.example .env

# 生成应用密钥
php artisan key:generate

# 运行数据库迁移
php artisan migrate

# 生成存储链接
php artisan storage:link
```

#### 步骤4：启动系统

**方案A：使用 Docker Compose（推荐）**

```bash
docker-compose up -d
```

然后访问：

- 📱 **前端**: [http://localhost:8000](http://localhost:8000/)
- 📊 **总后台**: [http://localhost:8000/admin](http://localhost:8000/admin)
- 🔌 **API**: [http://localhost:8000/api](http://localhost:8000/api)

**方案B：本地启动**

```bash
# 终端1：启动 Laravel
php artisan serve

# 终端2：启动 Vite 开发服务器
npm run dev
```

然后访问：

- 📱 **前端**: [http://localhost:8000](http://localhost:8000/)
- 📊 **总后台**: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 系统功能

### 👤 用户端（商户）

#### 1. 聊天小球

```
💬 浮动在网站右下角
├─ 点击展开聊天窗口
├─ 与AI员工实时对话
├─ 自动保存聊天记录
└─ 支持离线消息队列
```

#### 2. 智能对话

```
用户: "帮我分析今年的营销策略"
  ↓
AI识别: 需要营销经理
  ↓
系统回复: "我可以帮你分析..."
```

#### 3. 多行业支持

- 👗 服装设计
- 🍜 菜品开发
- 🏪 零售运营
- 💄 美业咨询
- 🏨 酒店管理
- 🚗 汽车销售

### ⚙️ 管理员端（总后台）

#### 1. 行业管理

```
✏️ 创建、编辑、删除行业
📝 配置行业信息
👥 管理行业员工
⚙️ 行业启用/禁用
```

#### 2. 员工管理

```
👤 创建专业AI员工
📝 自定义系统提示词
🎯 设置员工角色
⚙️ 选择AI模型
💬 配置员工风格
```

#### 3. 聊天配置

```
💬 聊天小球外观设置
🎨 颜色主题配置
📍 位置选择
🔔 通知设置
```

#### 4. 记录分析

```
📊 查看所有聊天记录
🔍 按行业、员工、商户筛选
📈 生成统计报表
💾 导出聊天记录
```

---

## 技术栈

**后端框架** Laravel 12.x 企业级 PHP 框架

**前端框架** Vue.js 3.x 渐进式前端框架

**构建工具** Vite 5.x 下一代前端构建工具

**UI 框架** Tailwind CSS 3.x 工具优先的 CSS 框架

**数据库** MySQL / SQLite 关系型数据库

**实时通信** WebSocket 实时双向通信

**AI 提供商** OpenAI / Ollama 大语言模型

**容器化** Docker latest 容器编排

**Web 服务器** Nginx latest 高性能 Web 服务器

---

## 项目结构

```
ai-multi-industry-system/
│
├── 📂 app/                                 # Laravel 应用核心
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AiChatController.php       ⭐ 聊天接口
│   │   │   │   ├── IndustryController.php     ⭐ 行业接口
│   │   │   │   └── EmployeeController.php     ⭐ 员工接口
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php    ⭐ 总后台仪表板
│   │   │       ├── IndustryController.php     ⭐ 行业管理
│   │   │       ├── EmployeeController.php     ⭐ 员工管理
│   │   │       ├── ChatConfigController.php   ⭐ 聊天配置
│   │   │       └── ChatHistoryController.php  ⭐ 聊天记录
│   │   └── Requests/
│   │       ├── AiChatRequest.php
│   │       ├── StoreIndustryRequest.php
│   │       └── StoreEmployeeRequest.php
│   │
│   ├── Models/
│   │   ├── Industry.php                   ⭐ 行业模型
│   │   ├── IndustryEmployee.php           ⭐ 员工模型
│   │   ├── AiChatMessage.php              ⭐ 聊天消息
│   │   ├── AiChatSession.php              ⭐ 聊天会话
│   │   └── AiSetting.php                  ⭐ 系统设置
│   │
│   ├── Services/
│   │   ├── AiCoordinator.php              ⭐ CEO 路由逻辑
│   │   ├── AiEmployeeService.php          ⭐ 员工服务
│   │   ├── AiPromptService.php            ⭐ 提示词服务
│   │   └── OpenAiService.php              ⭐ OpenAI 集成
│   │
│   ├── Traits/
│   │   └── HasAiInteraction.php            ⭐ AI 交互 Trait
│   │
│   └── Exceptions/
│       └── AiException.php
│
├── 📂 resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ChatWidget.vue              ⭐ 聊天小球
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.vue           ⭐ 仪表板
│   │   │   │   ├── IndustryForm.vue        ⭐ 行业表单
│   │   │   │   ├── EmployeeForm.vue        ⭐ 员工表单
│   │   │   │   ├── ChatConfig.vue          ⭐ 聊天配置
│   │   │   │   └── ChatHistory.vue         ⭐ 聊天记录
│   │   │   └── shared/
│   │   │       ├── Modal.vue
│   │   │       ├── Table.vue
│   │   │       └── ConfirmDialog.vue
│   │   ├── pages/
│   │   │   ├── Dashboard.vue
│   │   │   ├── Industries.vue
│   │   │   ├── Employees.vue
│   │   │   ├── ChatConfig.vue
│   │   │   ├── ChatHistory.vue
│   │   │   └── Settings.vue
│   │   ├── stores/
│   │   │   ├── aiStore.js                 ⭐ AI 状态管理
│   │   │   ├── industryStore.js           ⭐ 行业状态
│   │   │   └── uiStore.js                 ⭐ UI 状态
│   │   ├── composables/
│   │   │   ├── useAiChat.js               ⭐ 聊天逻辑
│   │   │   ├── useIndustries.js           ⭐ 行业逻辑
│   │   │   └── useForm.js                 ⭐ 表单逻辑
│   │   ├── services/
│   │   │   ├── api.js                     ⭐ API 调用
│   │   │   └── websocket.js               ⭐ WebSocket
│   │   ├── App.vue                        ⭐ 根组件
│   │   └── main.js                        ⭐ 入口文件
│   │
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── app.blade.php
│   │   │   └── admin.blade.php
│   │   ├── pages/
│   │   │   ├── index.blade.php
│   │   │   ├── chat.blade.php
│   │   │   └── admin/
│   │   │       ├── dashboard.blade.php
│   │   │       ├── industries.blade.php
│   │   │       └── settings.blade.php
│   │   └── components/
│   │
│   └── css/
│       ├── app.css
│       └── variables.css
│
├── 📂 database/
│   ├── migrations/
│   │   ├── 2025_01_01_create_industries_table.php            ⭐
│   │   ├── 2025_01_01_create_industry_employees_table.php    ⭐
│   │   ├── 2025_01_01_create_ai_chat_messages_table.php      ⭐
│   │   ├── 2025_01_01_create_ai_chat_sessions_table.php      ⭐
│   │   └── 2025_01_01_create_ai_settings_table.php           ⭐
│   ├── seeders/
│   │   ├── IndustrySeeder.php              ⭐ 初始化行业
│   │   └── EmployeeSeeder.php              ⭐ 初始化员工
│   └── factories/
│       └── IndustryFactory.php
│
├── 📂 config/
│   ├── ai-industries.php                   ⭐ 行业配置
│   ├── ai-prompts.php                      ⭐ 提示词配置
│   ├── ai-models.php                       ⭐ 模型配置
│   └── services.php
│
├── 📂 routes/
│   ├── api.php                             ⭐ API 路由
│   ├── web.php                             ⭐ Web 路由
│   └── admin.php                           ⭐ 总后台路由
│
├── 📂 tests/
│   ├── Feature/
│   │   ├── AiChatTest.php
│   │   ├── IndustryTest.php
│   │   └── EmployeeTest.php
│   └── Unit/
│       └── AiCoordinatorTest.php
│
├── 📂 docker/                              ⭐ Docker 配置
│   ├── Dockerfile
│   ├── nginx/
│   │   └── default.conf
│   └── php/
│       └── php.ini
│
├── 📂 scripts/                             ⭐ 辅助脚本
│   ├── install.sh
│   ├── migrate.sh
│   └── seed.sh
│
├── .env.example                            ⭐ 环境变量示例
├── .gitignore
├── docker-compose.yml                      ⭐ Docker 编排
├── compose.json                            ⭐ PHP 依赖
├── package.json                            ⭐ Node 依赖
├── vite.config.js                          ⭐ Vite 配置
├── tailwind.config.js                      ⭐ Tailwind 配置
├── README.md                               ⭐ 项目说明
├── CONTRIBUTING.md                         # 贡献指南
└── LICENSE                                 # MIT 许可证
```

---

## API 文档

### 1. 聊天 API

#### 发送消息
HTTP

```
POST /api/ai/chat
Content-Type: application/json

{
  "message": "帮我分析这个市场",
  "merchant_id": "merchant_123",
  "session_id": "session_456"
}
```

**响应：**

JSON

```
{
  "success": true,
  "data": {
    "id": 1,
    "industry": "fashion",
    "employee": "designer",
    "user_message": "帮我分析这个市场",
    "ai_response": "我可以帮你分析...",
    "confidence": 95,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 获取聊天历史

HTTP

```
GET /api/ai/chat-history?merchant_id=123&limit=20
```

**响应：**

JSON

```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "industry": "fashion",
      "employee": "designer",
      "user_message": "...",
      "ai_response": "...",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "per_page": 20,
    "current_page": 1
  }
}
```

### 2. 行业 API

#### 获取所有行业
HTTP

```
GET /api/industries
```

**响应：**

JSON

```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "👗 服装",
      "emoji": "👗",
      "color": "#E91E63",
      "enabled": true,
      "employees_count": 4
    }
  ]
}
```

#### 获取行业员工
HTTP

```
GET /api/industries/1/employees
```

### 3. 总后台 API

#### 获取仪表板数据
HTTP

```
GET /admin/api/dashboard
Authorization: Bearer {token}
```

**响应：**

JSON

```
{
  "success": true,
  "data": {
    "total_chats": 1250,
    "total_merchants": 45,
    "total_industries": 6,
    "total_employees": 25,
    "recent_chats": [],
    "statistics": {}
  }
}
```

#### 创建行业
HTTP

```
POST /admin/api/industries
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "🏪 零售",
  "emoji": "🏪",
  "color": "#2196F3",
  "description": "零售店铺运营管理"
}
```

#### 更新员工提示词
HTTP

```
PUT /admin/api/employees/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "system_prompt": "你是一个专业的服装设计师..."
}
```

---

## 常见问题

### Q1: 需要API Key吗？
**A:** 是的。你需要提供 OpenAI API Key 或部署 Ollama 服务器。

env

```
# .env 文件
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4
```

或使用本地 Ollama：

env

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Q2: 可以自定义 AI 员工吗？
**A:** 可以。在总后台可以：

1. 创建新的 AI 员工
2. 自定义系统提示词
3. 选择 AI 模型
4. 设置员工参数（温度、max_tokens等）

### Q3: 聊天记录会保存吗？
**A:** 会。所有聊天记录自动保存到数据库，可以：

- 按商户、行业、员工筛选
- 导出为 CSV、JSON
- 生成统计报表

### Q4: 支持多语言吗？
**A:** 支持。AI 会自动识别用户语言并回复相同语言。

### Q5: 可以集成到现有系统吗？
**A:** 可以。本系统可以：

1. 作为独立的 Laravel 应用运行
2. 作为 Botble 插件集成
3. 通过 API 与其他系统对接

### Q6: 如何部署到生产环境？
**A:** 参考 [部署指南](https://github.com/#%E9%83%A8%E7%BD%B2%E6%8C%87%E5%8D%97)

---

## 部署指南

### Docker Compose 部署（推荐）

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 API Key 等

# 2. 构建镜像
docker-compose build

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec app php artisan migrate --seed

# 5. 生成存储链接
docker-compose exec app php artisan storage:link
```

### 服务器部署

#### 前置要求

- Ubuntu 20.04 LTS
- PHP 8.2+
- MySQL 8.0+
- Nginx
- Node.js 18+

#### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/YOUR_USERNAME/ai-multi-industry-system.git
cd ai-multi-industry-system

# 2. 安装依赖
composer install --optimize-autoloader
npm install

# 3. 配置环境
cp .env.example .env
php artisan key:generate

# 4. 数据库配置
# 编辑 .env，配置 DB_HOST, DB_DATABASE 等
php artisan migrate --force
php artisan db:seed

# 5. 构建前端
npm run build

# 6. 配置 Nginx
sudo cp docker/nginx/default.conf /etc/nginx/sites-available/ai-system
sudo ln -s /etc/nginx/sites-available/ai-system /etc/nginx/sites-enabled/

# 7. 重启 Nginx
sudo systemctl restart nginx
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- PHP 遵循 PSR-12
- Vue 遵循 Vue Style Guide
- 提交信息遵循 Conventional Commits

---

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](https://github.com/LICENSE) 文件。

---

## 联系方式

- 📧 Email: [support@example.com](mailto:support@example.com)
- 🌐 Website: [https://example.com](https://example.com/)
- 💬 Discord: [https://discord.gg/xxxxx](https://discord.gg/xxxxx)

---

## 致谢

感谢以下开源项目：

- [Laravel](https://laravel.com/)
- [Vue.js](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)

---

**⭐ 如果觉得有帮助，请给个 Star！**

**📝 最后更新：2025年1月**

