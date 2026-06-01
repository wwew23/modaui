"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const initialPages = [
  { id: "home", name: "首页", path: "/", status: "published", lastUpdated: "2024-01-15", template: "minimal" },
  { id: "products", name: "全部商品", path: "/products", status: "published", lastUpdated: "2024-01-14", template: "minimal" },
  { id: "about", name: "关于我们", path: "/about", status: "published", lastUpdated: "2024-01-12", template: "minimal" },
  { id: "contact", name: "联系我们", path: "/contact", status: "draft", lastUpdated: "2024-01-10", template: "minimal" },
  { id: "faq", name: "常见问题", path: "/faq", status: "scheduled", lastUpdated: "2024-01-08", template: "tech" },
]

export function PagesView() {
  const [pages, setPages] = useState(initialPages)

  const getStatusColor = (status: string) => {
    switch(status) {
      case "published": return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
      case "draft": return "bg-muted text-muted-foreground"
      case "scheduled": return "bg-blue-500/10 text-blue-700 border-blue-200"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case "published": return "已发布"
      case "draft": return "草稿"
      case "scheduled": return "已定时"
      default: return status
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">页面管理</h1>
          <p className="text-sm text-muted-foreground mt-1">创建和管理商店的所有页面</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新建页面
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border px-6 py-4 grid grid-cols-12 text-xs font-semibold text-muted-foreground">
            <div className="col-span-4">页面名称</div>
            <div className="col-span-2">路径</div>
            <div className="col-span-2">状态</div>
            <div className="col-span-2">最后更新</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          
          {pages.map(page => (
            <div key={page.id} className="border-b border-border px-6 py-4 grid grid-cols-12 items-center hover:bg-muted/30 transition-colors">
              <div className="col-span-4 font-medium text-foreground">{page.name}</div>
              <div className="col-span-2 text-sm text-muted-foreground font-mono">{page.path}</div>
              <div className="col-span-2">
                <Badge variant="outline" className={getStatusColor(page.status)}>
                  {getStatusText(page.status)}
                </Badge>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">{page.lastUpdated}</div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Copy className="h-4 w-4" />
                      复制
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
