"use client"

import { useState } from "react"
import { 
  Store, 
  Sparkles, 
  Wand2, 
  Palette, 
  Layout, 
  Eye, 
  RefreshCw, 
  Laptop, 
  Phone, 
  CheckCircle, 
  Loader2, 
  Image as ImageIcon,
  Save,
  Edit3,
  Layers,
  FileText,
  Menu,
  Globe,
  Search,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PuckEditor } from "./puck-editor"
import { AIStoreEditor } from "./ai-store-editor"
import { TemplatesView } from "./storefront/templates-view"
import { ImporterView } from "./storefront/importer-view"
import { PagesView } from "./storefront/pages-view"
import { NavigationView } from "./storefront/navigation-view"
import { DomainsView } from "./storefront/domains-view"
import { SEOView } from "./storefront/seo-view"
import type { StorefrontSubTab } from "@/lib/types"

interface StorefrontTheme {
  id: string
  name: string
  version: string
  status: "published" | "draft" | "archived"
  previewImage: string
  colors: string[]
  styles: {
    fontFamily: string
    buttonStyle: string
    shadowLevel: string
  }
}


interface StorefrontViewProps {
  currentTheme?: string
  setCurrentTheme?: (themeId: string) => void
}

const subNavItems = [
  { id: "ai-canvas" as StorefrontSubTab, label: "AI 画布", icon: Wand2 },
  { id: "templates" as StorefrontSubTab, label: "模板库", icon: Palette },
  { id: "importer" as StorefrontSubTab, label: "模板导入器", icon: Upload },
  { id: "pages" as StorefrontSubTab, label: "页面", icon: FileText },
  { id: "navigation" as StorefrontSubTab, label: "导航", icon: Menu },
  { id: "domains" as StorefrontSubTab, label: "域名", icon: Globe },
  { id: "seo" as StorefrontSubTab, label: "SEO", icon: Search },
]

export function StorefrontView({ currentTheme = "theme-minimal", setCurrentTheme }: StorefrontViewProps) {
  const [themes, setThemes] = useState<StorefrontTheme[]>([])
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentTheme)
  const [activeSubTab, setActiveSubTab] = useState<StorefrontSubTab>("ai-canvas")
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop")

  const [showImportedEditor, setShowImportedEditor] = useState(false)
  const [importedTemplate, setImportedTemplate] = useState<any | null>(null)

  const getSelectedTheme = () => {
    return themes.find(t => t.id === selectedThemeId) || null
  }

  const activeTheme = getSelectedTheme()

  const renderSubContent = () => {
    switch (activeSubTab) {
      case "ai-canvas":
        return <AIStoreEditor />
      case "templates":
        return <TemplatesView />
      case "importer":
        return <ImporterView onImported={(template) => { setImportedTemplate(template); setShowImportedEditor(true); setActiveSubTab('ai-canvas') }} />
      case "pages":
        return <PagesView />
      case "navigation":
        return <NavigationView />
      case "domains":
        return <DomainsView />
      case "seo":
        return <SEOView />
      default:
        return <AIStoreEditor />
    }
  }

  if (activeSubTab !== "ai-canvas") {
    return (
      <div className="h-full">
        <div className="flex h-full">
          <div className="w-56 border-r border-border bg-background/50 p-4 space-y-1">
            <div className="mb-4">
              <div className="text-sm font-semibold text-muted-foreground mb-2">在线商店</div>
            </div>
            {subNavItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    activeSubTab === item.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
          <div className="flex-1 overflow-hidden">
            {renderSubContent()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-1">
          {subNavItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                  activeSubTab === item.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-4 border-r border-border bg-card p-6 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4" />
              可用网店品牌主题
            </h3>
            <div className="space-y-3">
              {themes.length > 0 ? (
                themes.map((theme) => {
                  const isSelected = selectedThemeId === theme.id
                  return (
                    <div
                      key={theme.id}
                      onClick={() => {
                        setSelectedThemeId(theme.id)
                        if (setCurrentTheme) {
                          setCurrentTheme(theme.id)
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? "bg-foreground/5 border-foreground" 
                          : "bg-background border-border hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-foreground">{theme.name}</h4>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">v{theme.version}</p>
                        </div>
                        <Badge variant="outline" className={
                          theme.status === "published" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                            : "bg-muted text-muted-foreground"
                        }>
                          {theme.status === "published" ? "当前发布主题" : theme.status === "draft" ? "草稿备份" : "历史存档"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex gap-1.5">
                          {theme.colors.map((c, i) => (
                            <span key={i} className="h-4.5 w-4.5 rounded-full border border-border" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono ml-auto">
                          {theme.styles.fontFamily.split(",")[0]}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 rounded-xl border border-border bg-background text-sm text-muted-foreground">
                  当前暂无可用店铺主题，已切换到真实主题管理模式。
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-muted/5 overflow-hidden flex flex-col">
          <div className="h-full">
            {showImportedEditor && importedTemplate ? (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => { setShowImportedEditor(false); setImportedTemplate(null) }}>
                        ← 返回
                      </Button>
                      <div>
                        <h1 className="text-lg font-semibold text-foreground">已导入模板</h1>
                        <p className="text-sm text-muted-foreground">模板来自导入器 - 仅在当前会话中可编辑</p>
                      </div>
                    </div>
                    <div>
                      <Badge>Imported</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PuckEditor initialData={importedTemplate} initialSelectedBlock={importedTemplate?.selectSection ?? undefined} />
                </div>
              </div>
            ) : (
              <AIStoreEditor />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
