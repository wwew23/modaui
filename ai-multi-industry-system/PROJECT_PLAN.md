# AI 多行业员工管理系统 项目规划

## 项目目标

构建一个独立的 Laravel + Vue 3 应用，支持：

- 6个行业：服装、餐饮、零售、美业、酒店、汽车
- 专业 AI 员工团队
- 商户端聊天对话与业务建议
- 管理员后台行业与员工管理
- AI 聊天记录保存与分析
- 最终可打包为 Botble 插件集成现有系统

## 核心架构

```text
Web 浏览器
  ↓
Vue 3 管理面板 / ChatWidget
  ↓
Laravel API
  ↓
AiCoordinator 服务
  ↓
行业 AI 员工 + 聊天路由
  ↓
OpenAI / Ollama
```

## 技术栈

- 后端：Laravel 12.x
- 前端：Vue 3 + Vite
- 状态管理：Pinia
- 数据库：SQLite / MySQL
- AI 连接：OpenAI / Ollama
- 部署：Docker / docker-compose

## 目录结构

```text
aio-multi-industry-system/
├── app/
│   ├── Http/Controllers/
│   │   ├── Api/
│   │   └── Admin/
│   ├── Models/
│   ├── Services/
│   └── Traits/
├── config/
│   ├── ai-industries.php
│   └── ai-prompts.php
├── database/
│   └── migrations/
├── public/
├── resources/js/
│   ├── components/
│   │   ├── admin/
│   │   └── shared/
│   ├── pages/
│   ├── stores/
│   ├── composables/
│   ├── services/
│   └── App.vue
├── routes/
│   ├── api.php
│   └── web.php
├── Dockerfile
├── docker-compose.yml
├── package.json
├── composer.json
├── vite.config.js
└── README.md
```

## 功能分解

### 商户端

- ChatWidget 聊天小球
- AI 聊天会话
- 聊天结果展示
- 接收行业 AI 建议

### 管理后台

- 行业管理（Industry）
- 员工管理（Employee）
- 聊天配置管理
- 聊天记录查询
- 系统参数配置

### AI 协调器

- AiCoordinator 负责路由请求
- 根据用户场景选择对应行业员工
- 支持多员工协作与角色分发
- 保存对话上下文与历史记录

## 初始实现计划

### 文档与环境

1. 编写项目说明文档（已完成）
2. 生成基础目录结构
3. 规划依赖与启动方式

### 后端

1. 创建 API 路由与控制器
2. 定义模型与迁移
3. 实现 AiCoordinator、AiPromptService、AiEmployeeService
4. 提供 AI 聊天接口与历史记录接口

### 前端

1. 创建 ChatWidget 聊天组件
2. 创建管理员页面：Dashboard、Industries、Employees、ChatConfig、ChatHistory
3. 实现 Pinia 状态管理
4. 实现 API 服务层

### 部署

1. 完成 `Dockerfile`
2. 完成 `docker-compose.yml`
3. 支持 `.env.example`

## 启动步骤

### Docker

```bash
docker-compose up
```

### 本地

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan serve
npm run dev
```

## 下一步

- 开始编写后端核心模块
- 先实现 `app/Services/AiCoordinator.php` 与 API 控制器
- 再补齐前端 ChatWidget 与管理员页面组件
