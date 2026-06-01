# 快速开始指南 - AI 多行业聊天插件

## 5分钟快速设置

### 1. 安装插件

```bash
# 进入项目目录
cd /www/wwwroot/modaui.com

# 复制插件文件（如果还未复制）
cp -r platform/plugins/ai-multi-industry ./platform/plugins/

# 运行数据库迁移
php artisan migrate

# 清除缓存
php artisan cache:clear
php artisan config:clear
```

### 2. 登录后台管理

访问 `http://your-domain/admin`，导航到侧边栏的"多行业聊天"菜单。

### 3. 创建第一个行业

1. 点击"行业管理"
2. 点击"+ 新增行业"
3. 填写表单：
   - **名称**: 服装
   - **Slug**: fashion (自动生成)
   - **表情**: 👗
   - **颜色**: #E91E63
   - 勾选"启用"
4. 点击"创建行业"

### 4. 添加员工

1. 在侧边栏点击"员工管理"
2. 点击"+ 新增员工"
3. 填写表单：
   - **行业**: 选择"服装"
   - **名称**: 李设计师
   - **角色**: 服装设计师
   - **系统提示词**: 
     ```
     你是一名专业的服装设计师。
     你的职责包括：
     - 为客户设计时尚的服装款式
     - 提供面料和配色建议
     - 创意问题解决
     ```
   - **模型**: gpt-4
   - **温度**: 0.8
   - **最大Token**: 2048
4. 点击"创建员工"

### 5. 配置聊天参数

1. 在侧边栏点击"聊天配置"
2. 设置：
   - **默认模型**: gpt-4
   - **温度**: 0.7
   - **最大Token**: 2048
   - **欢迎消息**: 您好！我是多行业AI助手
3. 勾选"启用聊天历史"和"启用导出"
4. 点击"保存配置"

### 6. 测试聊天API

使用 cURL 发送测试请求：

```bash
curl -X POST http://your-domain/api/ai-multi-industry/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "设计一个时尚的连衣裙，风格现代，颜色鲜艳",
    "industry_id": 1,
    "employee_id": 1,
    "merchant_id": "test_merchant",
    "shop_id": 1
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "session_token": "550e8400-e29b-41d4-a716-446655440000",
    "message": "连衣裙设计建议...",
    "industry": "fashion",
    "employee": "服装设计师",
    "tokens_used": 145
  }
}
```

---

## 常见配置

### 模型选择

#### OpenAI（推荐）
```
- gpt-4: 最高质量，成本最高
- gpt-4-turbo: 性价比最优
- gpt-3.5-turbo: 最快最便宜
```

#### 其他选项
```
- Gemini: google/gemini-pro
- Claude: claude-3-opus
- Ollama: 本地模型，需要本地部署
```

### 温度参数指南

| 温度 | 特性 | 用途 |
|------|------|------|
| 0.0-0.3 | 确定性强，严谨 | 技术支持、FAQ回答 |
| 0.4-0.7 | 平衡创意和准确 | 一般咨询、建议 |
| 0.8-1.2 | 创意性强 | 创意写作、设计建议 |
| 1.3+ | 高度随机 | 头脑风暴、创意生成 |

### 系统提示词模板

#### 服装行业 - 设计师
```
你是一名资深的时尚设计师，拥有15年的服装设计经验。
你的职责包括：
- 为客户创意设计时尚服装
- 提供面料、颜色和风格建议
- 分析最新的时尚趋势
- 指导生产工艺

在给出建议时，请遵循以下原则：
- 结合当前的时尚趋势
- 考虑客户的体型和气质
- 提供3-5个不同的设计方案
- 说明每个方案的优缺点
```

#### 餐饮行业 - 厨师
```
你是一名米其林星级厨师。
你的职责包括：
- 菜品设计和创新
- 烹饪技术指导
- 食材搭配建议
- 菜单策划

在给出建议时：
- 考虑食材的季节性和成本
- 提供详细的烹饪步骤
- 建议适配的饮品搭配
```

---

## 查看聊天记录

### 后台查看

1. 点击侧边栏"聊天记录"
2. 使用筛选条件：
   - 按行业筛选
   - 按员工筛选
   - 按日期范围筛选
3. 点击"查看"进入详情页面

### 导出聊天记录

1. 在聊天记录列表点击"导出"按钮
2. 选择导出格式：
   - **CSV**: 用于Excel或数据分析
   - **JSON**: 用于二次开发
3. 选择时间范围
4. 点击"导出"下载文件

---

## 常见问题

### Q: 如何更改模型？
**A**: 在员工编辑页面修改"模型"字段，支持任何 AI 提供商的模型名称。

### Q: Token消耗过快怎么办？
**A**: 
1. 降低"最大Token"数
2. 缩短系统提示词
3. 使用更轻量的模型（如gpt-3.5-turbo）

### Q: 如何添加新的行业？
**A**: 
1. 在后台"行业管理"页面点击"+ 新增行业"
2. 填写名称、颜色等信息
3. 点击创建，然后添加该行业的员工

### Q: 会话如何失效？
**A**: 会话在以下情况自动失效：
1. 用户主动点击"关闭会话"
2. 超过配置的时间限制（默认24小时）
3. 网络连接断开超过5分钟

### Q: 如何集成到自己的应用？
**A**: 使用 API 端点：
```javascript
// JavaScript 示例
const response = await fetch('/api/ai-multi-industry/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    industry_id: selectedIndustry,
    employee_id: selectedEmployee,
    merchant_id: currentMerchant
  })
});

const data = await response.json();
console.log(data.data.message); // AI的回复
```

---

## 生产环境检查清单

- [ ] 配置了正确的 API Key（OpenAI/Gemini/Claude）
- [ ] 设置了数据库备份
- [ ] 配置了日志存储路径
- [ ] 启用了请求速率限制
- [ ] 配置了错误报告
- [ ] 测试了 API 端点
- [ ] 备份了数据库迁移文件
- [ ] 配置了 CORS 白名单
- [ ] 设置了会话过期时间
- [ ] 启用了聊天记录导出功能

---

## 性能优化建议

### 数据库优化
```bash
# 添加适当的索引
php artisan tinker
>>> DB::statement('ALTER TABLE ai_chat_messages ADD INDEX idx_bulk_fetch (merchant_id, created_at DESC)');
```

### 缓存配置
```php
// config/cache.php
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
    ],
],
```

### API 响应缓存
```php
// 在 ChatHistoryController 中
return response()->json($data)
    ->header('Cache-Control', 'max-age=300'); // 5分钟缓存
```

---

## 监控和日志

系统自动记录到 `storage/logs/laravel.log`：
- 所有 AI API 调用
- 数据库错误
- 会话管理操作
- 导出操作

查看日志：
```bash
tail -f storage/logs/laravel.log
```

---

## 升级和维护

### 备份前端数据
```bash
# 导出所有聊天记录
php artisan ai-multi-industry:export-chats --format=json > backup.json
```

### 清理过期会话
```bash
php artisan ai-multi-industry:cleanup-sessions --hours=720
```

### 更新插件
```bash
git pull origin main
php artisan migrate
php artisan cache:clear
```

---

**需要帮助？** 查看完整文档：`docs/AI_MULTI_INDUSTRY_PLUGIN.md`

**GitHub 仓库**: [https://github.com/wwew23/modaui](https://github.com/wwew23/modaui)
