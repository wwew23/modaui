"use client"

import { useState } from "react"
import { Plus, CheckCircle, AlertCircle, ExternalLink, Settings, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialDomains = [
  { id: "primary", name: "yourstore.modaui.com", type: "primary", status: "active", provider: "ModaUI" },
  { id: "custom", name: "yourstore.com", type: "custom", status: "pending", provider: "GoDaddy" },
]

export function DomainsView() {
  const [domains, setDomains] = useState(initialDomains)
  const [newDomain, setNewDomain] = useState("")

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">已连接</Badge>
    }
    return <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">待配置</Badge>
  }

  const getTypeBadge = (type: string) => {
    if (type === "primary") {
      return <Badge variant="secondary">主域名</Badge>
    }
    return <Badge variant="outline">自定义域名</Badge>
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">域名设置</h1>
            <p className="text-sm text-muted-foreground mt-1">连接您的自定义域名</p>
          </div>
        </div>

        <Tabs defaultValue="list">
          <TabsList className="mb-6">
            <TabsTrigger value="list">域名列表</TabsTrigger>
            <TabsTrigger value="connect">连接新域名</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {domains.map(domain => (
              <Card key={domain.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{domain.name}</span>
                          {getTypeBadge(domain.type)}
                          {getStatusBadge(domain.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          DNS 提供商: {domain.provider}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        访问
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        配置
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="connect">
            <Card>
              <CardHeader>
                <CardTitle>连接自定义域名</CardTitle>
                <CardDescription>输入您已购买的域名并完成配置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">域名</label>
                  <Input 
                    placeholder="yourdomain.com" 
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">连接域名需要以下步骤</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>添加您的域名</li>
                        <li>在您的 DNS 提供商处添加 CNAME 记录</li>
                        <li>等待 DNS 生效（最多 48 小时）</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  连接域名
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
