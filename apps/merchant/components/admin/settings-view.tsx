"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Store,
  Globe,
  CreditCard,
  Users,
  Shield,
  Bell,
  Palette,
  ChevronRight,
  Check,
  ExternalLink,
  Cloud,
  Mail,
  FileJson,
  Upload,
  StickyNote,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Lock,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AIInlineAutocomplete } from "@/components/ui/ai-inline-autocomplete"

import {
  googleSignIn,
  googleSignOut,
  getCachedToken,
  uploadToDrive,
  listDriveFiles,
  sendGmail,
  saveKeepNotesToDrive,
  loadKeepNotesFromDrive,
  type KeepNote,
  auth
} from "@/lib/google-workspace"
import { onAuthStateChanged, type User } from "firebase/auth"

const SETTINGS_STORAGE_KEY = "aerotech_settings"

const settingsSections = [
  { 
    id: "store", 
    name: "店铺设置", 
    description: "基本信息、营业时间、联系方式",
    icon: Store 
  },
  { 
    id: "domain", 
    name: "域名", 
    description: "自定义域名、SSL 证书",
    icon: Globe 
  },
  { 
    id: "payment", 
    name: "支付", 
    description: "支付方式、结算账户",
    icon: CreditCard 
  },
  { 
    id: "team", 
    name: "团队", 
    description: "成员管理、权限设置",
    icon: Users 
  },
  {
    id: "workspace",
    name: "Google 协同",
    description: "绑定 Google Drive、Gmail 及 Keep 协作服务",
    icon: Cloud
  },
  {
    id: "ai",
    name: "AI 配置",
    description: "模型来源、API 密钥与智能体设定",
    icon: FileJson
  },
  { 
    id: "security", 
    name: "安全", 
    description: "两步验证、登录记录",
    icon: Shield 
  },
  { 
    id: "notifications", 
    name: "通知", 
    description: "邮件、短信、推送通知",
    icon: Bell 
  },
  { 
    id: "theme", 
    name: "主题", 
    description: "店铺外观、颜色、字体",
    icon: Palette 
  },
]

interface SettingsViewProps {
  products?: any[]
  orders?: any[]
}

export function SettingsView({ products = [], orders = [] }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState("store")
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [driveFiles, setDriveFiles] = useState<any[]>([])
  const [storeName, setStoreName] = useState("我的店铺")
  const [storeDescription, setStoreDescription] = useState("这是一家专注于高品质商品的在线商店。")
  const [contactEmail, setContactEmail] = useState("contact@mystore.com")
  const [domainName, setDomainName] = useState("mystore.aicommerce.com")
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: string; name: string; status: string }>>([
    { id: "1", name: "微信支付", status: "已连接商户号" },
    { id: "2", name: "支付宝", status: "已连接企业账户" },
    { id: "3", name: "银行卡", status: "银联在线支付" }
  ])
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([
    { id: "member-1", name: "张伟", email: "zhang@example.com", role: "管理员" },
    { id: "member-2", name: "李娜", email: "li@example.com", role: "运营" },
    { id: "member-3", name: "王芳", email: "wang@example.com", role: "客服" }
  ])
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [autoLockMinutes, setAutoLockMinutes] = useState(15)
  const [sessionList, setSessionList] = useState<Array<{ id: string; device: string; location: string; active: boolean; time: string }>>([
    { id: "session-1", device: "Chrome 浏览器", location: "上海 · 中国", active: true, time: "刚刚在线" },
    { id: "session-2", device: "iPhone 15 Pro", location: "深圳 · 中国", active: false, time: "1 小时前" },
    { id: "session-3", device: "MacBook Air", location: "杭州 · 中国", active: false, time: "6 小时前" }
  ])
  const [notificationsConfig, setNotificationsConfig] = useState({
    emailOrders: true,
    smsShipping: false,
    pushOffers: true,
    weeklySummary: true
  })
  const [themeLayout, setThemeLayout] = useState("经典")
  const [accentColor, setAccentColor] = useState("indigo")
  const [themeFont, setThemeFont] = useState("系统字体")

  // AI Configuration State
  const [aiEnabled, setAiEnabled] = useState(true)
  const [customerAgentEnabled, setCustomerAgentEnabled] = useState(true)
  const [merchantAgentEnabled, setMerchantAgentEnabled] = useState(true)
  const [modelSource, setModelSource] = useState("openai")
  const [openaiApiKey, setOpenaiApiKey] = useState("")
  const [openaiModel, setOpenaiModel] = useState("gpt-4o")
  const [claudeApiKey, setClaudeApiKey] = useState("")
  const [claudeModel, setClaudeModel] = useState("claude-3-opus")
  const [localModelName, setLocalModelName] = useState("")
  const [martfuryApiBaseUrl, setMartfuryApiBaseUrl] = useState("")
  const [martfuryApiKey, setMartfuryApiKey] = useState("")
  const [brandTone, setBrandTone] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [priorityGoals, setPriorityGoals] = useState("")
  const [forbiddenTopics, setForbiddenTopics] = useState("")
  const [merchantSystemPrompt, setMerchantSystemPrompt] = useState("")
  
  // Google Keep Integration State initialized with nice presets
  const [keepNotes, setKeepNotes] = useState<KeepNote[]>([
    { id: "note-1", title: "📝 今日设计灵感", content: "考虑采用更纯粹的瑞士风格极简排版，在主页上多用些深空拉丝黑作为视觉亮点点缀。", color: "bg-amber-100/80 dark:bg-amber-950/20", lastUpdated: "2026-05-27" },
    { id: "note-2", title: "🚚 供应链备忘", content: "陈芳琳的 AeroCore 专属定制传感器需要尽快通过 Gmail 提醒合作方并导出 Drive 对账单。", color: "bg-emerald-100/80 dark:bg-emerald-950/20", lastUpdated: "2026-05-27" }
  ])
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteColor, setNewNoteColor] = useState("bg-card")
  
  // Gmail Composer State
  const [gmailTo, setGmailTo] = useState("")
  const [gmailSubject, setGmailSubject] = useState("AeroTech 店铺业务运营日报")
  const [gmailBody, setGmailBody] = useState("您好，这是由 AeroTech AI 店铺助手自动整合导出的业务数据，具体备份文件和商品目录已同步存入 Google Drive。")
  
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const loadSavedSettings = () => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (parsed.storeName) setStoreName(parsed.storeName)
      if (parsed.storeDescription) setStoreDescription(parsed.storeDescription)
      if (parsed.contactEmail) setContactEmail(parsed.contactEmail)
      if (parsed.domainName) setDomainName(parsed.domainName)
      if (parsed.paymentMethods) setPaymentMethods(parsed.paymentMethods)
      if (parsed.teamMembers) setTeamMembers(parsed.teamMembers)
      if (parsed.twoFactorEnabled !== undefined) setTwoFactorEnabled(parsed.twoFactorEnabled)
      if (parsed.autoLockMinutes !== undefined) setAutoLockMinutes(parsed.autoLockMinutes)
      if (parsed.sessionList) setSessionList(parsed.sessionList)
      if (parsed.notificationsConfig) setNotificationsConfig(parsed.notificationsConfig)
      if (parsed.themeLayout) setThemeLayout(parsed.themeLayout)
      if (parsed.accentColor) setAccentColor(parsed.accentColor)
      if (parsed.themeFont) setThemeFont(parsed.themeFont)
      if (parsed.aiEnabled !== undefined) setAiEnabled(parsed.aiEnabled)
      if (parsed.customerAgentEnabled !== undefined) setCustomerAgentEnabled(parsed.customerAgentEnabled)
      if (parsed.merchantAgentEnabled !== undefined) setMerchantAgentEnabled(parsed.merchantAgentEnabled)
      if (parsed.modelSource) setModelSource(parsed.modelSource)
      if (parsed.openaiApiKey) setOpenaiApiKey(parsed.openaiApiKey)
      if (parsed.openaiModel) setOpenaiModel(parsed.openaiModel)
      if (parsed.claudeApiKey) setClaudeApiKey(parsed.claudeApiKey)
      if (parsed.claudeModel) setClaudeModel(parsed.claudeModel)
      if (parsed.localModelName) setLocalModelName(parsed.localModelName)
      if (parsed.martfuryApiBaseUrl) setMartfuryApiBaseUrl(parsed.martfuryApiBaseUrl)
      if (parsed.martfuryApiKey) setMartfuryApiKey(parsed.martfuryApiKey)
      if (parsed.brandTone) setBrandTone(parsed.brandTone)
      if (parsed.targetAudience) setTargetAudience(parsed.targetAudience)
      if (parsed.priorityGoals) setPriorityGoals(parsed.priorityGoals)
      if (parsed.forbiddenTopics) setForbiddenTopics(parsed.forbiddenTopics)
      if (parsed.merchantSystemPrompt) setMerchantSystemPrompt(parsed.merchantSystemPrompt)
    } catch (err) {
      console.error("Failed to load saved settings:", err)
    }
  }

  const saveSettings = () => {
    if (typeof window === "undefined") return
    const settingsPayload = {
      storeName,
      storeDescription,
      contactEmail,
      domainName,
      paymentMethods,
      teamMembers,
      twoFactorEnabled,
      autoLockMinutes,
      sessionList,
      notificationsConfig,
      themeLayout,
      accentColor,
      themeFont,
      aiEnabled,
      customerAgentEnabled,
      merchantAgentEnabled,
      modelSource,
      openaiApiKey,
      openaiModel,
      claudeApiKey,
      claudeModel,
      localModelName,
      martfuryApiBaseUrl,
      martfuryApiKey,
      brandTone,
      targetAudience,
      priorityGoals,
      forbiddenTopics,
      merchantSystemPrompt
    }
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsPayload))
    setStatusMessage({ type: "success", msg: "设置已立即保存，本地刷新后仍会保留。" })
  }

  const handleUpdateDomain = () => {
    const nextDomain = window.prompt("请输入要设置的自定义域名", domainName)
    if (!nextDomain) return
    setDomainName(nextDomain.trim())
    saveSettings()
  }

  const handleAddPaymentMethod = () => {
    const methodName = window.prompt("输入新的支付方式名称，例如 PayPal 或 Apple Pay")
    if (!methodName || !methodName.trim()) return
    const nextMethod = {
      id: `pm-${Date.now()}`,
      name: methodName.trim(),
      status: "待连接"
    }
    setPaymentMethods((prev) => [...prev, nextMethod])
    saveSettings()
    setStatusMessage({ type: "success", msg: `已添加支付方式：${nextMethod.name}` })
  }

  const handleInviteTeamMember = () => {
    const email = window.prompt("输入成员邮箱")
    if (!email || !email.trim()) return
    const name = window.prompt("输入成员姓名", email.split("@")[0]) || email.split("@")[0]
    const role = window.prompt("输入成员角色，例如 管理员/运营/客服", "成员") || "成员"
    const newMember = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || "成员"
    }
    setTeamMembers((prev) => [...prev, newMember])
    saveSettings()
    setStatusMessage({ type: "success", msg: `已邀请 ${newMember.name} 加入团队。` })
  }

  // Firebase auth state hook
  useEffect(() => {
    loadSavedSettings()
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const cached = getCachedToken()
        if (cached) {
          setToken(cached)
          fetchDriveAndKeep(cached)
        }
      } else {
        setToken(null)
        setDriveFiles([])
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchDriveAndKeep = async (accessToken: string) => {
    try {
      setIsLoading(true)
      const filesRes = await listDriveFiles(accessToken)
      if (filesRes && filesRes.files) {
        setDriveFiles(filesRes.files)
      }
      
      const notes = await loadKeepNotesFromDrive(accessToken)
      if (notes && notes.length > 0) {
        setKeepNotes(notes)
      }
    } catch (err: any) {
      console.error("Failed to fetch Workspace components:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setStatusMessage(null)
      const res = await googleSignIn()
      setToken(res.accessToken)
      setUser(res.user)
      setStatusMessage({ type: "success", msg: "Google Workspace 绑定成功！已同步授权。" })
      await fetchDriveAndKeep(res.accessToken)
    } catch (err: any) {
      setStatusMessage({ type: "error", msg: `绑定失败: ${err.message || err}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      setStatusMessage(null)
      await googleSignOut()
      setUser(null)
      setToken(null)
      setDriveFiles([])
      setStatusMessage({ type: "success", msg: "已安全断开与 Google 账户的协作授权。" })
    } catch (err: any) {
      setStatusMessage({ type: "error", msg: `断开失败: ${err.message || err}` })
    } finally {
      setIsLoading(false)
    }
  }

  // Drive actions
  const handleExportProducts = async () => {
    if (!token) return
    const confirmed = window.confirm("确定将当前商品目录导出并备份到 Google Drive 吗？")
    if (!confirmed) return

    try {
      setIsLoading(true)
      setStatusMessage(null)
      const payload = JSON.stringify(products, null, 2)
      await uploadToDrive(token, `aerotech_products_backup_${Date.now()}.json`, payload, "application/json")
      setStatusMessage({ type: "success", msg: "商品目录（JSON备份）已成功上传存入您的 Google Drive 云端硬盘！" })
      await fetchDriveAndKeep(token)
    } catch (err: any) {
      setStatusMessage({ type: "error", msg: `商品存储失败: ${err.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportOrders = async () => {
    if (!token) return
    const confirmed = window.confirm("确定将当前的订单流水账单写入 Google Drive 吗？")
    if (!confirmed) return

    try {
      setIsLoading(true)
      setStatusMessage(null)
      const payload = JSON.stringify(orders, null, 2)
      await uploadToDrive(token, `aerotech_orders_audit_${Date.now()}.json`, payload, "application/json")
      setStatusMessage({ type: "success", msg: "全量订单审计报表已成功上传存入您的 Google Drive 云端硬盘！" })
      await fetchDriveAndKeep(token)
    } catch (err: any) {
      setStatusMessage({ type: "error", msg: `报表存储失败: ${err.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  // Gmail action
  const handleSendEmail = async () => {
    if (!token) return
    if (!gmailTo) {
      setStatusMessage({ type: "error", msg: "请输入收件人邮箱地址" })
      return
    }
    const confirmed = window.confirm(`确认使用您的 Google 邮箱账户向 ${gmailTo} 发送这封店铺日志邮件吗？`)
    if (!confirmed) return

    try {
      setIsLoading(true)
      setStatusMessage(null)
      await sendGmail(token, gmailTo, gmailSubject, gmailBody)
      setStatusMessage({ type: "success", msg: `邮件已成功自 Gmail 发送至 ${gmailTo}！` })
    } catch (err: any) {
      setStatusMessage({ type: "error", msg: `邮件发送失败: 无足够权限或未在云端开启，错误: ${err.message || err}` })
    } finally {
      setIsLoading(false)
    }
  }

  // Keep actions
  const handleAddKeepNote = () => {
    if (!newNoteTitle && !newNoteContent) return
    const newNote: KeepNote = {
      id: `keep-${Date.now()}`,
      title: newNoteTitle || "新便签",
      content: newNoteContent,
      color: newNoteColor,
      lastUpdated: new Date().toISOString().split("T")[0]
    }
    setKeepNotes([newNote, ...keepNotes])
    setNewNoteTitle("")
    setNewNoteContent("")
    setNewNoteColor("bg-card")
    setStatusMessage({ type: "success", msg: "便签已在本地创建，点击下面的【云同步】将其保存至云端。" })
  }

  const handleDeleteKeepNote = (id: string) => {
    setKeepNotes(keepNotes.filter(n => n.id !== id))
  }

  const handleSyncKeep = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      setStatusMessage(null)
      await saveKeepNotesToDrive(token, keepNotes)
      setStatusMessage({ type: "success", msg: "Keep 协同便签已成功云端同步到您的 Google 云空间文件 (google_keep_sync.json)！" })
      await fetchDriveAndKeep(token)
    } catch (err: any) {
      setStatusMessage({ type: "error", msg: `云端同步失败: ${err.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshDrive = async () => {
    if (!token) return
    await fetchDriveAndKeep(token)
    setStatusMessage({ type: "success", msg: "已成功更新同步 Google Workspace 最新云端状态！" })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Settings className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">设置 · AI 团队工作台</h1>
                <p className="text-sm text-muted-foreground mt-0.5">管理店铺配置和账户设置，保持运营与协作一致</p>
              </div>
            </div>
            {/* Live global feedback bar */}
            {statusMessage && (
              <div className={`p-2 px-4 rounded-lg border text-xs font-mono max-w-sm shrink-0 transition-opacity flex items-center gap-2 ${
                statusMessage.type === "success" 
                  ? "bg-success/10 border-success/30 text-success" 
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}>
                <span>{statusMessage.msg}</span>
                <button onClick={() => setStatusMessage(null)} className="hover:opacity-70 ml-1">×</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[240px] border-r border-border bg-card overflow-auto">
          <div className="p-3 space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                    ${activeSection === section.id 
                      ? "bg-foreground text-background" 
                      : "text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{section.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl">
            {activeSection === "store" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">店铺设置</h2>
                  <p className="text-sm text-muted-foreground">管理店铺基本信息</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <AIInlineAutocomplete
                      id="store-name"
                      value={storeName}
                      onChange={setStoreName}
                      placeholder="请输入店铺名称"
                      label="店铺名称"
                      helperText="输入时会自动显示 AI 建议，按 Tab 补全。"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <AIInlineAutocomplete
                      id="store-description"
                      as="textarea"
                      value={storeDescription}
                      onChange={setStoreDescription}
                      placeholder="请输入店铺描述"
                      label="店铺描述"
                      helperText="输入时会自动显示 AI 建议，按 Tab 补全。"
                      rows={3}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <label className="block text-sm font-medium text-foreground mb-2">联系邮箱</label>
                    <input
                      type="email"
                      placeholder="contact@mystore.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">店铺状态</p>
                        <p className="text-xs text-muted-foreground mt-0.5">控制店铺是否对外开放</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">营业中</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={loadSavedSettings}>取消</Button>
                  <Button onClick={saveSettings}>立即保存当前设置</Button>
                </div>
              </div>
            )}

            {activeSection === "domain" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">域名设置</h2>
                  <p className="text-sm text-muted-foreground">管理自定义域名和 SSL</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">当前域名</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{domainName}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <Check className="h-3 w-3 mr-1" />
                      已激活
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleUpdateDomain} className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    添加自定义域名
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">SSL 证书</p>
                      <p className="text-xs text-muted-foreground mt-0.5">自动管理的 SSL/TLS 证书</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <Shield className="h-3 w-3 mr-1" />
                      已启用
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "payment" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">支付设置</h2>
                  <p className="text-sm text-muted-foreground">管理支付方式和结算账户</p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{method.name}</p>
                          <p className="text-xs text-muted-foreground">{method.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">已启用</Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="gap-1.5" onClick={handleAddPaymentMethod}>
                  <CreditCard className="h-4 w-4" />
                  添加支付方式
                </Button>
              </div>
            )}

            {activeSection === "team" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">团队管理</h2>
                    <p className="text-sm text-muted-foreground">管理团队成员和权限</p>
                  </div>
                  <Button size="sm" className="gap-1.5" onClick={handleInviteTeamMember}>
                    <Users className="h-3.5 w-3.5" />
                    邀请成员
                  </Button>
                </div>

                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.email} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{member.role}</Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Workspace Active Section Tab */}
            {activeSection === "workspace" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Google Workspace 决策中心</h2>
                    <p className="text-sm text-muted-foreground">绑定 Google 授权并利用云端同步备份、便签协同及邮件推送</p>
                  </div>
                  {user && (
                    <Button variant="outline" size="sm" onClick={handleRefreshDrive} disabled={isLoading} className="gap-2">
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                      云端同步状态
                    </Button>
                  )}
                </div>

                {/* Google Authorization Status */}
                <div className="p-5 rounded-2xl border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner shrink-0">
                      <Cloud className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      {user ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{user.displayName || "Google 协作用户"}</span>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30 font-mono text-[10px]">AUTH OK</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-sm text-foreground">未关联 Google 账号</p>
                          <p className="text-xs text-muted-foreground mt-0.5">关联后即可激活云存储、协作邮箱与便签同步</p>
                        </>
                      )}
                    </div>
                  </div>

                  {user ? (
                    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isLoading} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                      断开 Google 账号
                    </Button>
                  ) : (
                    <Button onClick={handleSignIn} disabled={isLoading} className="gap-2 shrink-0">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.01-1.38-1.21-2.07l2.02 1.44z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      绑定 Google 账号
                    </Button>
                  )}
                </div>

                {user ? (
                  <div className="space-y-8 animate-fadeIn">
                    
                    {/* 1. Google Drive Module */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-indigo-500 shrink-0" />
                        <h3 className="font-semibold text-foreground text-base">Google Drive 存储与归档</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        直接将您的 Active 店铺目录商品结构及财务订单对账单实时导出写入您绑定的 Google 云端硬盘：
                      </p>
                      
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm" onClick={handleExportProducts} disabled={isLoading} className="gap-1.5 text-xs text-foreground bg-background hover:bg-muted font-medium">
                          <FileJson className="h-3.5 w-3.5 text-amber-500" />
                          导出商品备份 JSON ({products.length}项)
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportOrders} disabled={isLoading} className="gap-1.5 text-xs text-foreground bg-background hover:bg-muted font-medium">
                          <FileJson className="h-3.5 w-3.5 text-emerald-500" />
                          导出财务对账报表 JSON ({orders.length}项)
                        </Button>
                      </div>

                      {/* Folder Files Listing */}
                      <div className="mt-4 pt-3 border-t border-border/80">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                          <span>已在此应用创建的 Google Drive 文件列表：</span>
                          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        </p>
                        {driveFiles.length === 0 ? (
                          <p className="p-4 text-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                            云端暂无此应用上传的文件，点击上方导出并在 Drive 中管理
                          </p>
                        ) : (
                          <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-2 font-mono text-xs">
                            {driveFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                                <span className="truncate max-w-[280px] shrink-0 text-foreground">{file.name}</span>
                                <div className="flex items-center gap-2 font-sans">
                                  <Badge variant="outline" className="text-[10px] hidden sm:inline-block border-neutral-300 dark:border-neutral-700">{file.mimeType.split(".").pop() || "JSON"}</Badge>
                                  {file.webViewLink && (
                                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-0.5 shrink-0 text-[11px]">
                                      查看云文件
                                      <ArrowRight className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Gmail Communication Module */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-red-500 shrink-0" />
                        <h3 className="font-semibold text-foreground text-base">Gmail 客服 & 店主推送</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        在安全沙箱中，使用已绑定的 Google 协同邮箱发送定制的产品清单备份，或分发自动化订单通知。
                      </p>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">收件人邮箱 (To)</label>
                          <input
                            type="email"
                            placeholder="请输入正确的收件邮箱地址，例如 test@example.com"
                            value={gmailTo}
                            onChange={(e) => setGmailTo(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">邮件主题</label>
                          <AIInlineAutocomplete
                            id="gmail-subject"
                            value={gmailSubject}
                            onChange={setGmailSubject}
                            placeholder="邮件主题..."
                            className="w-full h-9 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">正文 HTML (Body)</label>
                          <AIInlineAutocomplete
                            id="gmail-body"
                            as="textarea"
                            value={gmailBody}
                            onChange={setGmailBody}
                            placeholder="支持 HTML 正文，请键入邮件正文..."
                            rows={3}
                            className="w-full text-xs"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <Button size="sm" onClick={handleSendEmail} disabled={isLoading} className="gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-4 h-9 shadow-sm">
                            <Mail className="h-3.5 w-3.5 text-white" />
                            使用你的 Gmail 发送邮件
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 3. Google Keep Synchronized Pad */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StickyNote className="h-5 w-5 text-yellow-500 shrink-0" />
                          <h3 className="font-semibold text-foreground text-base">Google Keep 脑暴协同便签</h3>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSyncKeep} disabled={isLoading} className="gap-2 border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/10 font-medium">
                          同步到云 Keep
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        在精美的 Keep 图块网格中，随手记下运营灵感或备忘，并通过安全的 `google_keep_sync.json` 安全通道双向存取自您的 Google 云硬盘：
                      </p>

                      {/* Add Note Builder */}
                      <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5">
                        <div className="flex items-center gap-1.5 justify-between">
                          <AIInlineAutocomplete
                            id="note-title"
                            value={newNoteTitle}
                            onChange={setNewNoteTitle}
                            placeholder="便签标题..."
                            className="w-[180px] bg-transparent border-0 border-b border-border text-xs focus:outline-none focus:border-foreground/50 h-7"
                          />
                          <div className="flex items-center gap-1">
                            <button onClick={() => setNewNoteColor("bg-card")} className={`h-4.5 w-4.5 rounded-full bg-white dark:bg-black border border-border ${newNoteColor === "bg-card" ? "ring-2 ring-foreground" : ""}`} title="默认" />
                            <button onClick={() => setNewNoteColor("bg-amber-100/80 dark:bg-amber-950/20")} className={`h-4.5 w-4.5 rounded-full bg-amber-200 border border-border ${newNoteColor.includes("amber") ? "ring-2 ring-foreground" : ""}`} title="鹅黄" />
                            <button onClick={() => setNewNoteColor("bg-emerald-100/80 dark:bg-emerald-950/20")} className={`h-4.5 w-4.5 rounded-full bg-emerald-200 border border-border ${newNoteColor.includes("emerald") ? "ring-2 ring-foreground" : ""}`} title="浅绿" />
                            <button onClick={() => setNewNoteColor("bg-rose-100/80 dark:bg-rose-950/20")} className={`h-4.5 w-4.5 rounded-full bg-rose-200 border border-border ${newNoteColor.includes("rose") ? "ring-2 ring-foreground" : ""}`} title="粉红" />
                          </div>
                        </div>
                        <AIInlineAutocomplete
                          id="note-content"
                          value={newNoteContent}
                          onChange={setNewNoteContent}
                          placeholder="随手记下新的运营备忘、计划或构想..."
                          className="w-full bg-transparent border-0 text-xs focus:outline-none h-7"
                        />
                        <div className="flex justify-end pt-1">
                          <Button size="sm" onClick={handleAddKeepNote} className="gap-1 h-7 text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-inner px-3">
                            <Plus className="h-3.5 w-3.5 text-black" />
                            加入本地
                          </Button>
                        </div>
                      </div>

                      {/* Display Post-it Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {keepNotes.map((note) => (
                          <div key={note.id} className={`p-4 rounded-xl border border-border/80 relative group flex flex-col justify-between min-h-[110px] transition-shadow hover:shadow ${note.color}`}>
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="font-semibold text-xs text-foreground truncate">{note.title}</h4>
                                <button title="删除便签" onClick={() => handleDeleteKeepNote(note.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-foreground/90 leading-relaxed font-sans">{note.content}</p>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono mt-2 self-end">{note.lastUpdated}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/10">
                    <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">请先绑定您的 Google 授权</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      关联您的个人或企业 Google 协作账户。我们支持一键获取 Google Drive 及 Gmail、Keep 同步通道，全站安全，仅本地浏览器运行。
                    </p>
                    <div className="mt-5">
                      <Button onClick={handleSignIn} disabled={isLoading} className="gap-2 mx-auto">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        立即关联授权并激活协同
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "ai" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">AI 配置</h2>
                  <p className="text-sm text-muted-foreground">设置全局 AI 开关、模型来源、外部 API 配置与 Sidekick 智能体偏好。</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">全局启用</p>
                        <p className="text-xs text-muted-foreground">控制整个 AI 系统是否激活</p>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-3 bg-background">
                        <span className="text-sm text-foreground">AI 总开关</span>
                        <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-3 bg-background">
                        <span className="text-sm text-foreground">顾客导购</span>
                        <Switch checked={customerAgentEnabled} onCheckedChange={setCustomerAgentEnabled} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-3 bg-background">
                        <span className="text-sm text-foreground">运营助手</span>
                        <Switch checked={merchantAgentEnabled} onCheckedChange={setMerchantAgentEnabled} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">模型来源</p>
                        <p className="text-xs text-muted-foreground">选择本地模型或外部 API 提供商</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: "openai", label: "OpenAI" },
                        { value: "anthropic", label: "Claude (Anthropic)" },
                        { value: "local", label: "本地模型" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setModelSource(option.value)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${modelSource === option.value ? "border-foreground bg-foreground/10 text-foreground" : "border-border bg-background text-foreground"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">OpenAI API</p>
                        <p className="text-xs text-muted-foreground">支持 gpt-4o / gpt-4-turbo / gpt-3.5-turbo</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">OpenAI API Key</label>
                          <input
                            type="password"
                            value={openaiApiKey}
                            onChange={(e) => setOpenaiApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">模型名称</label>
                          <select
                            value={openaiModel}
                            onChange={(e) => setOpenaiModel(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                          >
                            <option value="gpt-4o">gpt-4o</option>
                            <option value="gpt-4-turbo">gpt-4-turbo</option>
                            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Claude / Anthropic API</p>
                        <p className="text-xs text-muted-foreground">可配置 Claude 模型与 API 密钥</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Claude API Key</label>
                          <input
                            type="password"
                            value={claudeApiKey}
                            onChange={(e) => setClaudeApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">模型名称</label>
                          <select
                            value={claudeModel}
                            onChange={(e) => setClaudeModel(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                          >
                            <option value="claude-3-opus">claude-3-opus</option>
                            <option value="claude-3-sonnet">claude-3-sonnet</option>
                            <option value="claude-3-haiku">claude-3-haiku</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Martfury API 接口配置 (Sidekick 专用)</p>
                      <p className="text-xs text-muted-foreground">用于 Sidekick 智能体与商家侧 AI 服务的专用 API 通道。</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">API Base URL</label>
                        <input
                          type="url"
                          value={martfuryApiBaseUrl}
                          onChange={(e) => setMartfuryApiBaseUrl(e.target.value)}
                          placeholder="https://your-martfury-host/api"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">API Key / Token</label>
                        <input
                          type="password"
                          value={martfuryApiKey}
                          onChange={(e) => setMartfuryApiKey(e.target.value)}
                          placeholder="Token / Key"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">本地模型</p>
                      <p className="text-xs text-muted-foreground">如果使用本地模型，请在此填写模型名称。</p>
                    </div>
                    <input
                      type="text"
                      value={localModelName}
                      onChange={(e) => setLocalModelName(e.target.value)}
                      placeholder="例如：ollama-v1 / llama3 / vicuna-13b"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">智能体记忆与偏好</p>
                      <p className="text-xs text-muted-foreground">为 Sidekick 智能体预设品牌语气、目标客群和运营目标。</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">品牌语气</label>
                        <input
                          type="text"
                          value={brandTone}
                          onChange={(e) => setBrandTone(e.target.value)}
                          placeholder="如：亲切、专业、年轻时尚"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">目标客群</label>
                        <input
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="如：18-35岁城市白领、潮流买手"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">核心运营目标</label>
                        <textarea
                          value={priorityGoals}
                          onChange={(e) => setPriorityGoals(e.target.value)}
                          rows={3}
                          placeholder="例如：提升转化率、提高客单价、减少售后投诉"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">禁用词 / 禁忌话题</label>
                        <textarea
                          value={forbiddenTopics}
                          onChange={(e) => setForbiddenTopics(e.target.value)}
                          rows={3}
                          placeholder="例如：政治、宗教、违法内容、敏感话题"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">商家侧系统提示词</label>
                        <textarea
                          value={merchantSystemPrompt}
                          onChange={(e) => setMerchantSystemPrompt(e.target.value)}
                          rows={4}
                          placeholder="例如：你是一位专注于高端生活美学的智能运营助手，回答须简洁、专业且贴近品牌。"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={loadSavedSettings}>恢复</Button>
                    <Button onClick={saveSettings}>保存 AI 配置</Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">安全设置</h2>
                  <p className="text-sm text-muted-foreground">管理两步验证、会话控制和自动锁定策略</p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">两步验证</p>
                        <p className="text-xs text-muted-foreground mt-0.5">保护店铺后台登录，建议保持开启。</p>
                      </div>
                      <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">自动锁定</p>
                        <p className="text-xs text-muted-foreground mt-0.5">无操作后一段时间自动锁定后台。</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{autoLockMinutes} 分钟</span>
                    </div>
                    <input
                      type="range"
                      aria-label="自动锁定分钟数"
                      min={5}
                      max={60}
                      step={5}
                      value={autoLockMinutes}
                      onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">最近登录会话</p>
                        <p className="text-xs text-muted-foreground mt-0.5">检查当前有哪些设备已登录，并随时强制退出。</p>
                      </div>
                      <Badge variant="outline" className="bg-muted/10 text-foreground">{sessionList.length} 个会话</Badge>
                    </div>
                    <div className="space-y-3">
                      {sessionList.map((session) => (
                        <div key={session.id} className={`p-3 rounded-xl border ${session.active ? "border-foreground/20 bg-foreground/5" : "border-border bg-background"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{session.device}</p>
                              <p className="text-xs text-muted-foreground">{session.location}</p>
                            </div>
                            <Badge variant="outline" className={session.active ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted-foreground border-border"}>
                              {session.active ? "当前设备" : session.time}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button variant="outline" onClick={() => {
                        setSessionList([])
                        setStatusMessage({ type: "success", msg: "已退出所有历史会话，当前会话保持登录。" })
                      }}>
                        注销所有其他会话
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">通知设置</h2>
                  <p className="text-sm text-muted-foreground">配置邮件、短信和推送通知策略。</p>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">订单邮件通知</p>
                      <p className="text-xs text-muted-foreground mt-0.5">订单状态变化时发送邮件通知给店主。</p>
                    </div>
                    <Switch checked={notificationsConfig.emailOrders} onCheckedChange={(checked) => setNotificationsConfig({ ...notificationsConfig, emailOrders: checked })} />
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">发货短信通知</p>
                      <p className="text-xs text-muted-foreground mt-0.5">订单发货时向客户发送短信提醒。</p>
                    </div>
                    <Switch checked={notificationsConfig.smsShipping} onCheckedChange={(checked) => setNotificationsConfig({ ...notificationsConfig, smsShipping: checked })} />
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">营销推送</p>
                      <p className="text-xs text-muted-foreground mt-0.5">自动推送新品、优惠和活动信息。</p>
                    </div>
                    <Switch checked={notificationsConfig.pushOffers} onCheckedChange={(checked) => setNotificationsConfig({ ...notificationsConfig, pushOffers: checked })} />
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">周报摘要</p>
                      <p className="text-xs text-muted-foreground mt-0.5">每周自动发送运营概览到收件箱。</p>
                    </div>
                    <Switch checked={notificationsConfig.weeklySummary} onCheckedChange={(checked) => setNotificationsConfig({ ...notificationsConfig, weeklySummary: checked })} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "theme" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">主题设置</h2>
                  <p className="text-sm text-muted-foreground">配置店铺后台主题外观与配色方案。</p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-sm font-medium text-foreground mb-3">皮肤风格</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "经典", value: "经典" },
                        { label: "极简", value: "极简" },
                        { label: "深色", value: "深色" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setThemeLayout(option.value)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${themeLayout === option.value ? "border-foreground bg-foreground/10 text-foreground" : "border-border bg-background text-foreground"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">主色调</p>
                      <span className="text-xs text-muted-foreground">{accentColor}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { color: "indigo", className: "bg-indigo-500" },
                        { color: "emerald", className: "bg-emerald-500" },
                        { color: "amber", className: "bg-amber-500" },
                        { color: "rose", className: "bg-rose-500" }
                      ].map((option) => (
                        <button
                          key={option.color}
                          title={`主题颜色 ${option.color}`}
                          onClick={() => setAccentColor(option.color)}
                          className={`h-9 w-9 rounded-full border-2 ${accentColor === option.color ? "border-foreground" : "border-transparent"} ${option.className}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">字体方案</p>
                        <p className="text-xs text-muted-foreground mt-0.5">选择后台管理界面默认字体。</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{themeFont}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        "系统字体",
                        "现代雅黑",
                        "简约雅黑"
                      ].map((font) => (
                        <button
                          key={font}
                          onClick={() => setThemeFont(font)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${themeFont === font ? "border-foreground bg-foreground/10 text-foreground" : "border-border bg-background text-foreground"}`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
