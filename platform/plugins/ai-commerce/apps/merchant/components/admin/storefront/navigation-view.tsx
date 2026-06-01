"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, GripVertical, Menu, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AIInlineAutocomplete } from "@/components/ui/ai-inline-autocomplete"
import { Label } from "@/components/ui/label"

const initialNavItems = [
  { id: "home", name: "首页", link: "/", position: 0 },
  { id: "products", name: "全部商品", link: "/products", position: 1 },
  { id: "about", name: "关于我们", link: "/about", position: 2 },
  { id: "contact", name: "联系我们", link: "/contact", position: 3 },
]

export function NavigationView() {
  const [navItems, setNavItems] = useState(initialNavItems)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">导航设置</h1>
            <p className="text-sm text-muted-foreground mt-1">管理商店的导航菜单</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            添加菜单项
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>主导航菜单</CardTitle>
            <CardDescription>拖拽排序来调整菜单项的显示顺序</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {navItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
                {editingId === item.id ? (
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">名称</Label>
                      <AIInlineAutocomplete
                        id={`nav-item-${item.id}-name`}
                        value={item.name}
                        onChange={(value) => setNavItems(navItems.map((n) => n.id === item.id ? { ...n, name: value } : n))}
                        placeholder="菜单名称"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">链接</Label>
                      <Input defaultValue={item.link} className="h-8 text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.link}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>底部菜单</CardTitle>
            <CardDescription>配置页脚的链接和信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div>
                <div className="font-medium text-sm text-foreground">帮助中心</div>
                <div className="text-xs text-muted-foreground">/help</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div>
                <div className="font-medium text-sm text-foreground">隐私政策</div>
                <div className="text-xs text-muted-foreground">/privacy</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <div>
                <div className="font-medium text-sm text-foreground">服务条款</div>
                <div className="text-xs text-muted-foreground">/terms</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
