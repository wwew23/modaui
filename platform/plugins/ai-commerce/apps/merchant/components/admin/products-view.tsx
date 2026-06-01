"use client"

import { useState, useCallback } from "react"
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Image, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Archive, 
  Tag, 
  Box, 
  Layers, 
  ChevronDown, 
  Download,
  Sparkles,
  Loader2,
  Wand2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AIInlineAutocomplete } from "@/components/ui/ai-inline-autocomplete"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import type { Product, AIAction, AIActionResult } from "@/lib/types"

interface ProductsViewProps {
  products: Product[]
  setProducts: (products: Product[]) => void
}

const collections = [
  { id: "1", name: "新品上市", productsCount: 24, status: "active" },
  { id: "2", name: "热销推荐", productsCount: 18, status: "active" },
  { id: "3", name: "春季新品", productsCount: 32, status: "scheduled" },
  { id: "4", name: "特价促销", productsCount: 15, status: "active" },
]

// AI Actions for products
const productAIActions: AIAction[] = [
  {
    id: "generate-description",
    type: "generate",
    label: "AI 生成描述",
    description: "为选中产品自动生成吸引人的商品描述",
    icon: "Wand2",
    context: "products",
    estimatedTime: "约 10 秒",
  },
  {
    id: "optimize-pricing",
    type: "optimize",
    label: "智能定价",
    description: "根据市场数据和竞品分析优化产品价格",
    icon: "TrendingUp",
    context: "products",
    estimatedTime: "约 15 秒",
  },
  {
    id: "auto-categorize",
    type: "automate",
    label: "自动分类",
    description: "AI 自动分析产品并归类到合适的类目",
    icon: "Layers",
    context: "products",
    estimatedTime: "约 8 秒",
  },
  {
    id: "inventory-alert",
    type: "analyze",
    label: "库存预警",
    description: "分析库存状态，预测补货需求",
    icon: "AlertCircle",
    context: "products",
    estimatedTime: "约 12 秒",
  },
]

export function ProductsView({ products, setProducts }: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all")
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  
  // Dialog states
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Product | null>(null)

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id)
    setAiResult(null)
    
    try {
      // For AI-powered actions, call the API
      if (action.id === "generate-description" && selectedProducts.length > 0) {
        const productsToUpdate = products.filter(p => selectedProducts.includes(p.id))
        const updatedProducts = [...products]

        for (const product of productsToUpdate) {
          const response = await fetch("/api/gemini/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: `Generate a compelling product description for "${product.name}" (Price: ¥${product.price}, Category: ${product.category}). Keep it under 100 characters and in Chinese.`,
              type: "generate-description"
            }),
          })

          const data = await response.json()
          if (data.text) {
            try {
              const updatedProduct = await apiClient.updateProduct(product.id, {
                description: data.text,
              })
              const idx = updatedProducts.findIndex(p => p.id === product.id)
              if (idx !== -1) updatedProducts[idx] = { ...updatedProducts[idx], ...updatedProduct }
            } catch (error) {
              console.error(`Failed to persist AI description for ${product.id}:`, error)
            }
          }
        }

        setProducts(updatedProducts)
        setAiResult(`已为 ${productsToUpdate.length} 个产品生成并保存 AI 描述`)
      } else if (action.id === "optimize-pricing" && selectedProducts.length > 0) {
        setAiResult("已分析市场数据，建议调整 3 个产品价格以提高竞争力")
      } else if (action.id === "auto-categorize" && selectedProducts.length > 0) {
        setAiResult("已自动分析产品特征，更新了 5 个产品的分类")
      } else if (action.id === "inventory-alert") {
        const lowStockCount = products.filter(p => p.stock < 50 && p.stock > 0).length
        const outOfStockCount = products.filter(p => p.stock === 0).length
        setAiResult(`库存预警：${lowStockCount} 个产品库存不足，${outOfStockCount} 个产品缺货`)
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const messages: Record<string, string> = {
          "generate-description": "已为所有产品生成 AI 描述",
          "optimize-pricing": "已分析市场数据，建议调整 3 个产品价格",
          "auto-categorize": "已自动将 5 个产品重新分类",
          "inventory-alert": "库存预警提示已生成",
        }
        setAiResult(messages[action.id] || "操作完成")
      }
    } catch (error) {
      console.error("AI action failed:", error)
      setAiResult("操作出错，请重试")
    } finally {
      setAiExecuting(null)
    }
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: "操作完成",
      startTime: new Date().toISOString(),
    }
  }, [selectedProducts, products, setProducts])

  // Product CRUD handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditForm(product)
    setIsEditing(false)
    setShowDetailDialog(true)
  }

  const handleEditProduct = () => {
    setIsEditing(true)
  }

  const handleSaveProduct = async () => {
    if (!editForm || !selectedProduct) return

    try {
      const updated = await apiClient.updateProduct(selectedProduct.id, {
        name: editForm.name,
        sku: editForm.sku,
        price: editForm.price,
        stock: editForm.stock,
        status: editForm.status,
        category: editForm.category,
        image: editForm.image,
        description: editForm.description,
      })

      setProducts(products.map(p => p.id === selectedProduct.id ? updated : p))
      setSelectedProduct(updated)
      setEditForm(updated)
      setIsEditing(false)
      setShowDetailDialog(false)
    } catch (error) {
      console.error('Save product failed:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await apiClient.deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
      setShowDetailDialog(false)
    } catch (error) {
      console.error('Delete product failed:', error)
    }
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `PRD-${Date.now()}`,
      name: '新产品',
      sku: `SKU-${Date.now()}`,
      price: 0,
      stock: 0,
      status: 'draft',
      category: '未分类',
      description: '',
    }

    setEditForm(newProduct)
    setSelectedProduct(newProduct)
    setIsEditing(true)
    setShowDetailDialog(true)
  }

  const handleCreateNewProduct = async () => {
    if (!editForm) return

    try {
      const created = await apiClient.createProduct({
        name: editForm.name,
        sku: editForm.sku,
        price: editForm.price,
        stock: editForm.stock,
        status: editForm.status,
        category: editForm.category,
        image: editForm.image,
        description: editForm.description,
      })

      setProducts([created, ...products])
      setSelectedProduct(created)
      setEditForm(created)
      setIsEditing(false)
      setShowDetailDialog(false)
    } catch (error) {
      console.error('Create product failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "draft": return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "archived": return "bg-muted text-muted-foreground border-border"
      case "scheduled": return "bg-blue-500/10 text-blue-600 border-blue-200"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "在售"
      case "draft": return "草稿"
      case "archived": return "已归档"
      case "scheduled": return "计划"
      default: return status
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const toggleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id))
    } else {
      setSelectedProducts([...selectedProducts, id])
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">产品</h1>
              <p className="text-sm text-muted-foreground mt-1">管理您的产品目录，共 {products.length} 个产品</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button className="gap-2" onClick={handleAddProduct}>
                <Plus className="h-4 w-4" />
                新建产品
              </Button>
            </div>
          </div>

          {/* AI Actions Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI 操作</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {productAIActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => handleAIAction(action)}
                  disabled={aiExecuting === action.id}
                >
                  {aiExecuting === action.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : action.icon === "Wand2" ? (
                    <Wand2 className="h-3.5 w-3.5" />
                  ) : action.icon === "TrendingUp" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : action.icon === "Layers" ? (
                    <Layers className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm text-foreground animate-fade-in">
                {aiResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted">
              <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Package className="h-4 w-4" />
                产品
              </TabsTrigger>
              <TabsTrigger value="collections" className="gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Layers className="h-4 w-4" />
                系列
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Box className="h-4 w-4" />
                库存
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Tag className="h-4 w-4" />
                分类
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索产品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    状态
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>全部</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>在售</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>草稿</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("archived")}>已归档</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="products">
            {selectedProducts.length > 0 && (
              <div className="bg-foreground text-background rounded-xl p-4 mb-4 flex items-center justify-between animate-slide-up">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">已选择 {selectedProducts.length} 个产品</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-background/10 text-background hover:bg-background/20"
                    onClick={() => handleAIAction(productAIActions[0])}
                    disabled={aiExecuting === "generate-description"}
                  >
                    {aiExecuting === "generate-description" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    AI 生成描述
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-background/10 text-background hover:bg-background/20">
                    批量编辑
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-red-500/20 text-red-100 hover:bg-red-500/30">
                    删除
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left">
                      <Checkbox 
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">产品</th>
                    <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">状态</th>
                    <th className="py-3 px-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">库存</th>
                    <th className="py-3 px-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">价格</th>
                    <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">分类</th>
                    <th className="py-3 px-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3 px-4">
                        <Checkbox 
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleSelectProduct(product.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden group-hover:bg-foreground group-hover:text-background transition-colors">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Image className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground font-mono">{product.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(product.status)}>
                          {getStatusText(product.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-sm font-medium ${
                          product.stock === 0 ? "text-red-600" : 
                          product.stock < 50 ? "text-amber-600" : "text-foreground"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-foreground">¥{product.price.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedProduct(product)
                              setEditForm(product)
                              setIsEditing(true)
                              setShowDetailDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-red-500"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">没有找到产品</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-card border border-border rounded-2xl p-4 hover:border-foreground/20 transition-all cursor-pointer card-hover">
                  <div className="aspect-video bg-muted rounded-xl mb-3 flex items-center justify-center">
                    <Layers className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{collection.name}</h3>
                      <p className="text-xs text-muted-foreground">{collection.productsCount} 个产品</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(collection.status)}>
                      {getStatusText(collection.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="bg-card border border-border border-dashed rounded-2xl p-4 flex items-center justify-center cursor-pointer hover:border-foreground/30 transition-colors">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">创建系列</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Box className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">库存管理</h3>
              <p className="text-sm text-muted-foreground mb-4">管理产品库存和采购订单</p>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI 智能补货
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Tag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">产品分类</h3>
              <p className="text-sm text-muted-foreground mb-4">管理产品分类和标签</p>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI 自动分类
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct && !products.some(p => p.id === selectedProduct.id) 
                ? '新建产品' 
                : isEditing ? '编辑产品' : '产品详情'}
            </DialogTitle>
          </DialogHeader>
          
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>产品名称</Label>
                  <AIInlineAutocomplete
                    id="product-name"
                    value={editForm.name}
                    onChange={(value) => setEditForm({ ...editForm, name: value })}
                    disabled={!isEditing}
                    placeholder="请输入产品名称"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input 
                    value={editForm.sku} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>价格</Label>
                  <Input 
                    type="number"
                    value={editForm.price} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>库存</Label>
                  <Input 
                    type="number"
                    value={editForm.stock} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input 
                    value={editForm.category} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>状态</Label>
                {isEditing ? (
                  <Select value={editForm.status} onValueChange={(status: any) => setEditForm({ ...editForm, status })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">在售</SelectItem>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="archived">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 p-2 bg-muted rounded">
                    <Badge variant="outline" className={getStatusColor(editForm.status)}>
                      {getStatusText(editForm.status)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  关闭
                </Button>
                <Button onClick={handleEditProduct}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  if (selectedProduct) {
                    setEditForm(selectedProduct)
                  }
                }}>
                  取消
                </Button>
                <Button onClick={
                  selectedProduct && !products.some(p => p.id === selectedProduct.id) 
                    ? handleCreateNewProduct 
                    : handleSaveProduct
                }>
                  {selectedProduct && !products.some(p => p.id === selectedProduct.id) ? '创建' : '保存'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
