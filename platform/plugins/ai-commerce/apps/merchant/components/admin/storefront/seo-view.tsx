"use client"

import { useState } from "react"
import { Sparkles, Eye, Search, Globe, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIInlineAutocomplete } from '@/components/ui/ai-inline-autocomplete'
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function SEOView() {
  const [metaTitle, setMetaTitle] = useState("极简科技体验旗舰店 - 纯粹声音，触手可及")
  const [metaDescription, setMetaDescription] = useState("采用自研旗舰级声学引擎，定制您的专属静谧音舱。探索高品质音频产品的极致体验。")
  const [socialTitle, setSocialTitle] = useState("极简科技体验旗舰店")
  const [socialDescription, setSocialDescription] = useState("探索高品质音频产品的极致体验")

  const seoScore = 82

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">SEO 设置</h1>
            <p className="text-sm text-muted-foreground mt-1">优化搜索引擎和社交媒体可见性</p>
          </div>
          <Button className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            保存
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SEO 健康度</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">{seoScore}</div>
                <div className="text-sm text-muted-foreground mb-4">总分 100</div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
                <div className="text-sm text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  优秀表现
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SEO 建议</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">标题长度合适</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Meta 描述完整</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">建议添加更多关键词</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">基础 SEO</TabsTrigger>
                <TabsTrigger value="social">社交分享</TabsTrigger>
                <TabsTrigger value="advanced">高级设置</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>搜索引擎元信息</CardTitle>
                    <CardDescription>这些信息会显示在搜索结果中</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="meta-title">页面标题</Label>
                        <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {metaTitle.length}/60
                        </span>
                      </div>
                      <AIInlineAutocomplete
                        id="meta-title"
                        label=""
                        value={metaTitle}
                        onChange={setMetaTitle}
                        placeholder="请输入页面标题"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="meta-description">Meta 描述</Label>
                        <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {metaDescription.length}/160
                        </span>
                      </div>
                      <AIInlineAutocomplete
                        id="meta-description"
                        as="textarea"
                        label=""
                        value={metaDescription}
                        onChange={setMetaDescription}
                        placeholder="请输入 Meta 描述"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>预览</CardTitle>
                    <CardDescription>在 Google 搜索结果中的显示效果</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg p-4 bg-white">
                      <div className="text-sm text-emerald-700 mb-1">yourstore.modaui.com</div>
                      <div className="text-lg font-medium text-blue-700 mb-1">{metaTitle}</div>
                      <div className="text-sm text-gray-600">{metaDescription}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>社交媒体分享</CardTitle>
                    <CardDescription>自定义社交平台分享时显示的信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="social-title">分享标题</Label>
                      <AIInlineAutocomplete
                        id="social-title"
                        label=""
                        value={socialTitle}
                        onChange={setSocialTitle}
                        placeholder="请输入分享标题"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social-description">分享描述</Label>
                      <AIInlineAutocomplete
                        id="social-description"
                        as="textarea"
                        label=""
                        value={socialDescription}
                        onChange={setSocialDescription}
                        placeholder="请输入分享描述"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>社交分享预览</CardTitle>
                    <CardDescription>Facebook 和 Twitter 卡片预览</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg overflow-hidden bg-white">
                      <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <Globe className="h-10 w-10 text-white/50" />
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">yourstore.modaui.com</div>
                        <div className="font-medium text-foreground mb-1">{socialTitle}</div>
                        <div className="text-sm text-muted-foreground">{socialDescription}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>高级 SEO 设置</CardTitle>
                    <CardDescription>自定义 robots 标签和其他高级选项</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        高级 SEO 选项将在未来版本中推出，包括：
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                        <li>自定义 robots.txt</li>
                        <li>HTML 元标签控制</li>
                        <li>结构化数据标记</li>
                        <li>URL 重定向规则</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
