"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { googleSignIn } from "@/lib/google-workspace"

interface MerchantRegistrationProps {
  onComplete: () => void
}

type BusinessModeKey = "brand" | "wholesale" | "factory" | "retail"

type RegistrationStage = "login" | "company" | "mode" | "team"

const MODE_OPTIONS: Array<{ key: BusinessModeKey; title: string; description: string; icon: string }> = [
  { key: "brand", title: "品牌", description: "打造自有品牌，提升品牌价值", icon: "👚" },
  { key: "wholesale", title: "批发", description: "批量采购与分销，扩大销售规模", icon: "📦" },
  { key: "factory", title: "工厂", description: "生产制造为主，优化供应链", icon: "🏭" },
  { key: "retail", title: "零售", description: "直接面向消费者，提升客户体验", icon: "🏪" },
]

const TEAM_MEMBERS = [
  { emoji: "👗", name: "李设计师" },
  { emoji: "📦", name: "陈采购经理" },
  { emoji: "📈", name: "王运营总监" },
  { emoji: "📣", name: "张营销总监" },
  { emoji: "💰", name: "刘会计" },
  { emoji: "💬", name: "赵客服主管" },
]

const stepLabels = [
  { label: "登录", description: "使用账号快速开始" },
  { label: "公司信息", description: "填写公司名称与定位" },
  { label: "选择经营模式", description: "个性化配置您的业务" },
  { label: "AI 团队到岗", description: "您的公司正在创建中" },
]

export function MerchantRegistration({ onComplete }: MerchantRegistrationProps) {
  const [stage, setStage] = useState<RegistrationStage>("login")
  const [selectedMode, setSelectedMode] = useState<BusinessModeKey | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [showEmailField, setShowEmailField] = useState(false)
  const [email, setEmail] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [memberIndex, setMemberIndex] = useState(-1)
  const [teamReady, setTeamReady] = useState(false)

  const currentStep = stage === "login" ? 0 : stage === "company" ? 1 : stage === "mode" ? 2 : 3
  const progressPercent = ((memberIndex + 1) / TEAM_MEMBERS.length) * 100

  useEffect(() => {
    if (stage !== "team") {
      return
    }

    setMemberIndex(-1)
    setTeamReady(false)

    const intervalId = window.setInterval(() => {
      setMemberIndex((prev) => {
        const nextIndex = prev + 1
        if (nextIndex >= TEAM_MEMBERS.length) {
          window.clearInterval(intervalId)
          setTeamReady(true)
          return prev
        }
        return nextIndex
      })
    }, 600)

    return () => window.clearInterval(intervalId)
  }, [stage])

  const startLogin = async (type: "google" | "email" | "wechat") => {
    if (type === "wechat") {
      setStatusMessage("微信登录即将支持，敬请期待")
      return
    }

    if (type === "google") {
      setStatusMessage("正在使用 Google 登录……")
      try {
        await googleSignIn()
        setStage("company")
      } catch (error) {
        console.error(error)
        setStatusMessage("Google 登录失败，请重试")
        return
      }
      setStatusMessage("")
      return
    }

    setShowEmailField(true)
  }

  const handleEmailContinue = async () => {
    if (!email.trim()) {
      setStatusMessage("请输入邮箱地址继续")
      return
    }

    setStatusMessage("正在使用邮箱登录……")
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    setStatusMessage("")
    setStage("company")
  }

  const handleContinueFromCompany = () => {
    if (!companyName.trim()) {
      setStatusMessage("请输入公司名称继续")
      return
    }
    setStatusMessage("")
    setStage("mode")
  }

  const handleContinueFromMode = () => {
    if (!selectedMode) {
      setStatusMessage("请选择一个经营模式继续")
      return
    }
    setStatusMessage("")
    setStage("team")
  }

  const handleEnterWorkspace = () => {
    window.localStorage.setItem("ai-team-ready", "true")
    onComplete()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-8 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AI 团队入驻</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">正在组建您的 AI 团队</h1>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">您的服装批发公司正在创建中</div>
            </div>

            <div className="grid gap-3 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
              {stepLabels.map((step, index) => (
                <div key={step.label} className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${index === currentStep ? "border border-slate-900 bg-white shadow-sm" : "border border-slate-200 bg-slate-50"}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-950">{`${index + 1}. ${step.label}`}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                  <div className={`h-8 w-8 rounded-full text-center text-sm ${index === currentStep ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"}`}>{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {stage === "login" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-lg font-semibold text-slate-950">继续使用账号登录</p>
                <p className="text-sm text-slate-500">快速创建 AI 团队，并一步步完成公司入驻。</p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => startLogin("google")} className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800">继续使用 Google</Button>
                <Button onClick={() => startLogin("email")} variant="outline" className="w-full rounded-3xl border border-slate-200 px-6 py-4 text-sm text-slate-700 hover:border-slate-400">继续使用邮箱</Button>
                <Button onClick={() => startLogin("wechat")} variant="outline" className="w-full rounded-3xl border border-slate-200 px-6 py-4 text-sm text-slate-700 hover:border-slate-400">继续使用微信</Button>
              </div>

              {showEmailField && (
                <div className="space-y-4 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="请输入邮箱，例如 hello@example.com"
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                  <Button onClick={handleEmailContinue} className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white">继续</Button>
                </div>
              )}

              <div className="space-y-3 rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">1</span>
                  AI 团队智能协作
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">24</span>
                  全天候运营支持
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">✓</span>
                  立即构建运营系统
                </div>
              </div>
            </div>
          )}

          {stage === "company" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-lg font-semibold text-slate-950">填写公司信息</p>
                <p className="text-sm text-slate-500">告诉我们您的公司名称，让 AI 团队更精准地为您服务。</p>
              </div>

              <div className="space-y-4 rounded-[26px] border border-slate-200 bg-slate-50 p-6">
                <Input
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="请输入公司名称，例如 服装批发有限公司"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
                <Button onClick={handleContinueFromCompany} className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white">继续</Button>
              </div>
            </div>
          )}

          {stage === "mode" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-lg font-semibold text-slate-950">您的经营模式是？</p>
                <p className="text-sm text-slate-500">我们将为您配置最合适的 AI 团队。</p>
              </div>

              <div className="grid gap-4">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedMode(option.key)}
                    className={`group flex items-center gap-4 rounded-[26px] border p-5 text-left transition ${selectedMode === option.key ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white hover:border-slate-400"}`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-200 text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-950">{option.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{option.description}</p>
                    </div>
                    <div className={`h-8 w-8 rounded-full border ${selectedMode === option.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-400"}`}>{selectedMode === option.key ? "✓" : ""}</div>
                  </button>
                ))}
              </div>

              {statusMessage && <p className="text-sm text-rose-500">{statusMessage}</p>}

              <Button onClick={handleContinueFromMode} className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white">继续</Button>
            </div>
          )}

          {stage === "team" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-lg font-semibold text-slate-950">正在组建您的 AI 团队...</p>
                <p className="text-sm text-slate-500">您的服装批发公司正在创建中</p>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">我的服装批发公司</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">AI 驱动的智能经营</p>
                  </div>

                  <div className="space-y-3">
                    {TEAM_MEMBERS.map((member, index) => (
                      <div key={member.name} className={`flex items-center justify-between rounded-3xl border px-4 py-3 ${memberIndex >= index ? "border-slate-900 bg-white" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-slate-200 text-xl grid place-items-center">{member.emoji}</div>
                          <div>
                            <p className="font-semibold text-slate-950">{member.name}</p>
                            <p className="text-sm text-slate-500">AI 团队成员</p>
                          </div>
                        </div>
                        <span className={`text-sm ${memberIndex >= index ? "text-emerald-500" : "text-slate-500"}`}>{memberIndex >= index ? "已到岗" : "等待到岗"}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>团队组建进度</span>
                      <span>{Math.min(memberIndex + 1, TEAM_MEMBERS.length)}/{TEAM_MEMBERS.length}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                    </div>
                  </div>

                  <Button onClick={handleEnterWorkspace} disabled={!teamReady} className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">进入工作台</Button>

                  {teamReady ? (
                    <p className="text-center text-sm text-emerald-500">🎉 AI 团队已全部到岗，您的公司已准备就绪</p>
                  ) : (
                    <p className="text-center text-sm text-slate-500">AI 团队正在组建，请稍候即可进入工作台</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
