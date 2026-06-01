# Developer & AI Agent Guidelines (Lock Manifest)

## 🔒 STRICT RULES - PHASE: FUNCTIONAL COMPLETION ONLY

**当前 UI、颜色、布局、Sidebar、Spacing、Typography 已全部锁定。**

### ❌ ABSOLUTELY PROHIBITED (严格禁止)
- ❌ 改 UI (Do NOT modify UI)
- ❌ 改颜色 (Do NOT change colors)
- ❌ 改布局 (Do NOT alter layouts)
- ❌ 改组件风格 (Do NOT modify component styles)
- ❌ 新增设计语言 (Do NOT introduce new design language)
- ❌ 重做页面 (Do NOT redesign pages)
- ❌ 自由发挥 (Do NOT improvise visually)
- ❌ 新建任何视觉方案 (Do NOT create new visual schemes)

### ✅ ONLY PERMITTED WORK (只允许的工作)
1. ✅ 补全真实功能 (Complete actual functionality)
2. ✅ 接真实状态 (Connect real state management)
3. ✅ 补 CRUD (Implement CRUD operations)
4. ✅ 修复崩溃 (Fix crashes/errors)
5. ✅ 补防空保护 (Add null/undefined guards)
6. ✅ 补 loading/error 状态 (Implement loading & error states)
7. ✅ 接 API (Connect API endpoints)
8. ✅ 接数据库 (Connect database)
9. ✅ 补 AI 功能逻辑 (Implement AI logic)

### 🎯 CURRENT PHASE OBJECTIVES (当前需要完成)
1. **状态容器统一** - Move all state to `/app/page.tsx`
   - products/orders/customers/discounts/campaigns 全部 useState 提升
   
2. **防空保护** - Add undefined guards to all View components
   - All View components must handle undefined/null props safely
   
3. **页面功能补全** - Complete missing functionality
   - `discounts-view.tsx` - Full CRUD & AI features
   - `content-view.tsx` - AI generation with existing black/white/gray UI only
   - `channels-view.tsx` - Channel management features
   - `online-store-view.tsx` (storefront-view) - Theme & preview features

### ⚠️ IMPORTANT CONSTRAINT FOR CONTENT VIEW
- **content-view.tsx 限制**：
  - 只能复用当前黑白灰 UI 风格 (Use only current B/W/gray palette)
  - 只能使用现有组件系统 (Use only existing components)
  - 禁止新增颜色与新布局 (NO new colors, NO new layouts)
  - 专注功能而非视觉 (Function over form)

### 📋 EXISTING STATE MANAGEMENT
All data must be lifted to `/app/page.tsx`:
```typescript
const [products, setProducts] = useState(INITIAL_PRODUCTS)
const [orders, setOrders] = useState(INITIAL_ORDERS)
const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
const [discounts, setDiscounts] = useState(INITIAL_DISCOUNTS)
const [campaigns, setCampaigns] = useState([]) // if needed
```

### 🛡️ NULL/UNDEFINED GUARDS (防空模板)
All View components must follow this pattern:
```typescript
export function SomeView({ items = [], setItems }: Props) {
  // 确保安全访问
  const safeItems = items ?? []
  const handleUpdate = (newItems: any[]) => {
    setItems?.(newItems) // 安全调用
  }
  // ...
}
```

---

## RULES ENFORCEMENT

**Violation Policy**: Any changes to UI/colors/layouts/styles will be **REJECTED**.
Focus ONLY on functional completion and data management.

**For AI Agents**: This manifest overrides all design considerations.
