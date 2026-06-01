# Theme Runtime 集成指南

## 架构概览

```
一句话提示
    ↓
AI 生成 Store DSL
    ↓
Theme Runtime (解析DSL)
    ↓
Data Binding Resolver (获取API数据)
    ↓
Section Renderer (渲染各section)
    ↓
Store Renderer (组织页面显示)
```

## 核心模块

### 1. Theme Runtime (`/lib/theme-runtime`)
**用途**：解析和管理 Store DSL，提供页面/section 访问接口

**关键类**：`ThemeRuntime`
```typescript
// 使用示例
import ThemeRuntime from '@/lib/theme-runtime'

const runtime = new ThemeRuntime(dsl)
const homePage = runtime.getHomePage()
const sections = runtime.getPageSections('home')
const isValid = runtime.isValid()
```

**API**：
- `getDSL()` - 获取原始 DSL
- `getHomePage()` - 获取首页
- `getPageSections(pageId)` - 获取页面的所有 sections
- `getSection(sectionId)` - 获取单个 section
- `getAllSections()` - 获取所有 sections
- `getTemplate()` - 获取模板 ID
- `getTheme()` - 获取主题
- `isValid()` - 验证 DSL 有效性

### 2. Data Binding Resolver (`/lib/data-bindings`)
**用途**：根据 section 的 binding 配置自动从 API 获取数据

**关键类**：`BindingResolver`
```typescript
// 在 ServerComponent 中的使用
import BindingResolver from '@/lib/data-bindings/bindingResolver'

const resolver = new BindingResolver(storeId, '/api', token)
const products = await resolver.resolveBinding({
  source: 'collection',
  collection_id: 'featured'
})
```

**Hook 使用**：
```typescript
// 在 ClientComponent 中的使用
import useDataBinding from '@/lib/data-bindings/useDataBinding'

const { data, loading, error } = useDataBinding(
  section.binding,  // DataBinding | undefined
  storeId,
  token
)
```

**支持的 Binding 类型**：
- `{source: 'collection', collection_id: 'featured'}` - 获取集合中的产品
- `{source: 'all'}` - 获取所有集合
- `{source: 'manual', ids: ['p1', 'p2']}` - 手动指定产品 ID

### 3. Section Renderer (`/lib/section-renderer`)
**用途**：根据 section 类型和 binding 动态渲染单个 section

**关键组件**：`SectionRenderer`
```typescript
<SectionRenderer
  section={section}           // Section 对象
  registry={registry}         // ComponentRegistry
  storeId={storeId}
  token={token}
/>
```

**支持的 Section 类型**：
- `ProductGrid` - 产品网格，自动绑定集合数据
- `CollectionList` - 集合列表
- `Hero` - Hero Banner
- `Header` - 页头
- `Footer` - 页尾
- `BrandStory` - 品牌故事
- `Announcement` - 公告栏

### 4. Store Renderer (`/lib/store-renderer`)
**用途**：渲染整个 Store（所有 pages 和 sections）

**关键组件**：`StoreRenderer`
```typescript
<StoreRenderer
  dsl={dsl}                   // Store DSL
  registry={registry}         // ComponentRegistry
  storeId={storeId}
  token={token}
  pageId="home"              // 可选，默认首页
/>
```

## 数据流

### 场景 1：一句话生成 → 实时渲染

```
用户输入：
"I want a luxury fashion store with featured collections"
    ↓
POST /api/ai/generate/quick
    ↓
API 返回 Store DSL
    ↓
<StoreRenderer dsl={dsl} ... />
    ↓
For each section:
  - 检查 section.binding
  - 如果有 binding → BindingResolver 获取数据
  - 调用 SectionRenderer 渲染
```

### 场景 2：ProductGrid 数据自动绑定

```
Store DSL 中的 Section:
{
  id: "featured_products",
  type: "ProductGrid",
  props: { columns: 4, layout: "grid" },
  binding: {
    source: "collection",
    collection_id: "featured"
  }
}
    ↓
SectionRenderer 检测到 binding
    ↓
useDataBinding 调用 BindingResolver.resolveBinding()
    ↓
BindingResolver 调用 GET /api/collections/featured/products?store_id=1
    ↓
API 返回 [{id, title, price}, ...]
    ↓
ProductGridRenderer 显示产品列表
```

## API 端点

### 生成 DSL
```
POST /api/ai/generate/quick
Body: { prompt: string, store_id: string }
Returns: StoreDSL
```

### 获取集合产品
```
GET /api/collections/:collection_id/products?store_id=:store_id
Returns: Product[]
```

### 获取所有集合
```
GET /api/collections?store_id=:store_id
Returns: Collection[]
```

### 获取组件注册表
```
GET /api/components
Returns: ComponentRegistry
```

## 使用示例

### 完整流程（App）

```typescript
'use client'

import { useState, useEffect } from 'react'
import StoreRenderer from '@/lib/store-renderer/StoreRenderer'
import { StoreDSL, ComponentRegistry } from '@/lib/theme-runtime/types'

export default function ThemePage() {
  const [prompt, setPrompt] = useState('')
  const [dsl, setDsl] = useState<StoreDSL | null>(null)
  const [registry, setRegistry] = useState<ComponentRegistry | null>(null)

  // 1. 加载组件注册表
  useEffect(() => {
    fetch('/api/components').then(r => r.json()).then(setRegistry)
  }, [])

  // 2. 生成 DSL
  const handleGenerate = async () => {
    const res = await fetch('/api/ai/generate/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, store_id: '1' })
    })
    const data = await res.json()
    setDsl(data)
  }

  // 3. 渲染
  return (
    <>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={handleGenerate}>Generate</button>
      
      {dsl && registry && (
        <StoreRenderer dsl={dsl} registry={registry} storeId="1" />
      )}
    </>
  )
}
```

## 关键设计原则

1. **关注分离**
   - Theme Runtime：只负责解析 DSL 结构
   - Data Binding：只负责 API 调用和数据获取
   - Renderers：只负责 UI 呈现

2. **无静态数据**
   - ProductGrid 不包含硬编码产品列表
   - 所有数据通过 binding 配置从 API 获取
   - 支持动态更新和实时数据同步

3. **组件注册表驱动**
   - 所有组件类型由 registry.json 定义
   - SectionRenderer 根据 component.type 动态渲染
   - 新增组件只需更新 registry，无需修改渲染逻辑

4. **Puck 集成准备**
   - Section Renderer 输出 Puck 兼容的 props
   - 每个 section 有 `data-section-id` 和 `data-section-type` 标记
   - 可以直接集成到 Puck 编辑画布

## 下一步工作

- [ ] 集成 Puck 编辑器
- [ ] 添加 Section 编辑能力（props + binding）
- [ ] 实现发布流程（保存 DSL 到后端）
- [ ] 添加模板预设库
- [ ] 支持多语言
- [ ] 添加分析和预览功能
