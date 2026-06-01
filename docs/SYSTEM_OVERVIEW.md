# 系统总览

## 项目类型

- Laravel 10 / PHP 后端
- Botble CMS 扩展架构
- 前端混合 Blade + JavaScript
- AI 相关功能以 `Agent Control Center` 和 `DeepAgents` 为核心

## 重要目录

- `app/Http/Controllers`：后端控制器
- `routes/web.php`：应用主路由定义，包含 admin 页面路由和前端公共路由
- `resources/views/admin`：后台管理页面视图
- `resources/views/layouts/admin.blade.php`：后台页面布局，包含 CSRF token 等基础环境
- `database/migrations`：数据库迁移文件
- `docs/`：架构文档、AI 设计说明、Agent 控制中心说明

## 核心系统模块

### 1. Admin UI / Agent Control Center

- 新增页面：`admin/agent-control`
- 控制器：`App\Http\Controllers\Admin\AgentControlUiController`
- 视图：`resources/views/admin/agent-control/dashboard.blade.php`
- 后端菜单项：`App\Providers\AppServiceProvider` 通过 `DashboardMenu` 注册
- 权限：`ai.agent.manage`

### 2. 后端 API 入口

- 基础 API 前缀：`api/admin/agent-control`
- 支持资源：`agents`, `workflows`, `models`, `tools`, `prompts`, `mcps`, `analytics`
- 这些路由由已有 admin-agent-control 相关 API 文件定义

### 3. 迁移与数据库升级

- 当前已有迁移包括 AI 相关表和 Agent 控制中心表
- 关键迁移文件：
  - `2026_05_31_000000_create_agent_control_center_tables.php`
  - `2026_05_31_000002_create_ai_conversations_table.php`
  - `2026_05_31_000003_create_ai_messages_table.php`

## 现状与建议

- 若要让 AI 更懂系统，关键是提供简明的系统梳理文档和代码入口说明
- 建议：
  1. 将 `docs/SYSTEM_OVERVIEW.md` 作为系统目录和功能入口说明
  2. 在 `routes/web.php` 和 `AppServiceProvider` 中保留明确注释
  3. 为关键模块（Agent、Workflows、MCP、Prompts、Models）建立统一接口说明

## 如何使用这份文档

- 作为 AI 访问项目时的第一份系统指南
- 用于快速定位后台路由、权限、模块层次和数据表边界
- 帮助团队成员理解当前 `Agent Control Center` 在系统中的位置

## 重点关注点

- `Admin` 用户需登录并具备 `ai.agent.manage` 权限
- `dashboard.blade.php` 包含多个模块面板与可视化工作流编辑区域
- 前端请求使用 `window.csrfToken` 发起 JSON POST/PATCH/DELETE 请求
- 任何新增功能最好先补一个对应的文档/说明
