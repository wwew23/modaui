"use client"

import { useState } from "react"
import {
  Home,
  ShoppingBag,
  Megaphone,
  Globe,
  Sparkles,
  Settings,
  ChevronDown,
  ShoppingCart,
  Package,
  Users,
  Tag,
  TrendingUp,
  FileText,
  BarChart3,
  Store,
  Layout,
  Bot,
  Palette,
  Image,
  Type,
  Layers,
  HelpCircle,
  LogOut,
  Search,
  Command,
  Bell,
  Mail,
  MessageSquare,
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveTab } from "@/lib/types"

interface SidebarProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

// 主页
const homeItems = [
  { id: "dashboard" as const, label: "实时动态", icon: Home },
]

// 商业
const businessItems = [
  { id: "orders" as const, label: "订单", icon: ShoppingCart, count: 8 },
  { id: "products" as const, label: "产品", icon: Package },
  { id: "customers" as const, label: "客户", icon: Users },
  { id: "discounts" as const, label: "折扣", icon: Tag },
]

// 营销
const marketingItems = [
  { id: "marketing" as const, label: "市场营销", icon: Megaphone },
  { id: "content" as const, label: "内容", icon: FileText },
  { id: "analytics" as const, label: "分析", icon: BarChart3 },
  { id: "notifications" as const, label: "通知", icon: Bell },
]

// 渠道
const channelItems = [
  { id: "stores" as const, label: "销售渠道", icon: TrendingUp },
  { id: "storefront" as const, label: "在线商店", icon: Store },
]

// 智能化
const aiItems = [
  { id: "ai-studio" as const, label: "AI 工作室", icon: Sparkles, isNew: true },
  { id: "agents" as const, label: "智能体", icon: Bot },
  { id: "os-console" as const, label: "OS 控制台", icon: Command },
]

// 设置
const settingsItems = [
  { id: "settings" as const, label: "店铺设置", icon: Settings },
]

type NavSection = {
  title: string
  items: { id: ActiveTab | string; label: string; icon: React.ComponentType<{ className?: string }>; count?: number; isNew?: boolean }[]
  key: string
}

const navSections: NavSection[] = [
  { title: "主页", items: homeItems, key: "home" },
  { title: "商业", items: businessItems, key: "business" },
  { title: "营销", items: marketingItems, key: "marketing" },
  { title: "渠道", items: channelItems, key: "channel" },
  { title: "智能化", items: aiItems, key: "ai" },
  { title: "设置", items: settingsItems, key: "settings" },
]

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    home: true,
    business: true,
    marketing: true,
    channel: true,
    ai: true,
    settings: true,
  })

  return (
    <aside className="flex flex-col h-full w-[240px] bg-card border-r border-border">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">AI Commerce</h1>
            <p className="text-[10px] text-muted-foreground">Operating System</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <button className="w-full h-8 flex items-center gap-2 px-2.5 rounded-md border border-border bg-background text-muted-foreground text-xs hover:border-foreground/20 transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">搜索...</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.key} className="mb-1">
            <button
              onClick={() => {
                setExpanded(prev => ({ ...prev, [section.key]: !prev[section.key] }))
                if (section.key === "settings") {
                  setActiveTab("settings")
                }
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 text-label hover:text-foreground/60 transition-colors"
            >
              <span>{section.title}</span>
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-150",
                !expanded[section.key] && "-rotate-90"
              )} />
            </button>
            
            {expanded[section.key] && (
              <div className="space-y-0.5 mt-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sidebar transition-all duration-150",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-foreground/70 hover:bg-hover hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.count && (
                        <span className={cn(
                          "px-1.5 py-0.5 text-[10px] font-medium rounded",
                          isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                        )}>
                          {item.count}
                        </span>
                      )}
                      {item.isNew && (
                        <span className="px-1 py-0.5 text-[9px] font-semibold uppercase rounded bg-foreground text-background">
                          New
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* AI Status */}
      <div className="px-3 py-3 border-t border-border">
        <div className="p-2.5 rounded-lg border border-border bg-background">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px] font-medium text-foreground">AI 系统运行中</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">活跃智能体</p>
              <p className="text-xs font-semibold font-mono-numbers text-foreground">3</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">今日任务</p>
              <p className="text-xs font-semibold font-mono-numbers text-foreground">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center gap-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-hover transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            帮助
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-hover transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            退出
          </button>
        </div>
      </div>
    </aside>
  )
}
