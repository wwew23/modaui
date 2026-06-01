"use client"

import { useState } from "react"
import { Bell, Mail, MessageSquare, Smartphone, Plus, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Send, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { StoreNotification, NotificationType, NotificationStatus, NotificationConfig } from "@/lib/types"

const initialConfig: NotificationConfig = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: true
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "email": return Mail
    case "sms": return MessageSquare
    case "push": return Smartphone
  }
}

function getStatusColor(status: NotificationStatus) {
  switch (status) {
    case "sent": return "bg-green-100 text-green-700"
    case "pending": return "bg-blue-100 text-blue-700"
    case "failed": return "bg-red-100 text-red-700"
    case "scheduled": return "bg-amber-100 text-amber-700"
  }
}

function getStatusIcon(status: NotificationStatus) {
  switch (status) {
    case "sent": return CheckCircle2
    case "pending": return Clock
    case "failed": return XCircle
    case "scheduled": return Calendar
  }
}

function getStatusText(status: NotificationStatus) {
  switch (status) {
    case "sent": return "已发送"
    case "pending": return "待发送"
    case "failed": return "发送失败"
    case "scheduled": return "已定时"
  }
}

function getTypeText(type: NotificationType) {
  switch (type) {
    case "email": return "邮件"
    case "sms": return "短信"
    case "push": return "推送"
  }
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<StoreNotification[]>([])
  const [config, setConfig] = useState<NotificationConfig>(initialConfig)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<NotificationType | "all">("all")

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeTab === "all" || notif.type === activeTab
    return matchesSearch && matchesType
  })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">通知</h1>
          <p className="text-sm text-muted-foreground mt-1">
            邮件、短信、推送通知管理
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          发送通知
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>通知历史</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="搜索通知..." 
                      className="pl-9 w-64 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Tabs defaultValue="all" className="mt-2">
                <TabsList className="h-8">
                  <TabsTrigger value="all" onClick={() => setActiveTab("all")} className="h-7 text-xs">全部</TabsTrigger>
                  <TabsTrigger value="email" onClick={() => setActiveTab("email")} className="h-7 text-xs">邮件</TabsTrigger>
                  <TabsTrigger value="sms" onClick={() => setActiveTab("sms")} className="h-7 text-xs">短信</TabsTrigger>
                  <TabsTrigger value="push" onClick={() => setActiveTab("push")} className="h-7 text-xs">推送</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {filteredNotifications.map((notif) => {
                  const Icon = getTypeIcon(notif.type)
                  const StatusIcon = getStatusIcon(notif.status)
                  return (
                    <div key={notif.id} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">{notif.title}</h3>
                              <Badge variant="outline" className={getStatusColor(notif.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {getStatusText(notif.status)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getTypeText(notif.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              收件人：{notif.recipient}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {notif.sentAt || notif.scheduledAt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">没有找到通知</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>配置不同类型的通知</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <Label htmlFor="email-toggle" className="font-medium">邮件通知</Label>
                    <p className="text-xs text-muted-foreground">发送邮件通知</p>
                  </div>
                </div>
                <Switch
                  id="email-toggle"
                  checked={config.emailEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, emailEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <Label htmlFor="sms-toggle" className="font-medium">短信通知</Label>
                    <p className="text-xs text-muted-foreground">发送短信通知</p>
                  </div>
                </div>
                <Switch
                  id="sms-toggle"
                  checked={config.smsEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, smsEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-purple-700" />
                  </div>
                  <div>
                    <Label htmlFor="push-toggle" className="font-medium">推送通知</Label>
                    <p className="text-xs text-muted-foreground">发送应用推送</p>
                  </div>
                </div>
                <Switch
                  id="push-toggle"
                  checked={config.pushEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, pushEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>统计概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">今日发送</span>
                  <span className="font-semibold text-foreground">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">成功送达</span>
                  <span className="font-semibold text-green-600">148</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">发送失败</span>
                  <span className="font-semibold text-red-600">8</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">待发送</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">开发中</CardTitle>
              <CardDescription>此功能正在开发中</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 mb-2" />
                <p className="text-sm text-amber-800">
                  完整的通知功能正在开发中，敬请期待！
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
