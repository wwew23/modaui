"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { DashboardView } from "@/components/admin/dashboard-view"
import { ProductsView } from "@/components/admin/products-view"
import { OrdersView } from "@/components/admin/orders-view"
import { CustomersView } from "@/components/admin/customers-view"
import { MarketingView } from "@/components/admin/marketing-view"
import { ContentView } from "@/components/admin/content-view"
import { DiscountsView } from "@/components/admin/discounts-view"
import { ChannelsView } from "@/components/admin/channels-view"
import { StorefrontView } from "@/components/admin/storefront-view"
import { AnalyticsView } from "@/components/admin/analytics-view"
import { AgentsView } from "@/components/admin/agents-view"
import { AIStudioView } from "@/components/admin/ai-studio-view"
import { SettingsView } from "@/components/admin/settings-view"
import { NotificationsView } from "@/components/admin/notifications-view"
import { AIAssistantPanel } from "@/components/admin/ai-assistant-panel"
import { MerchantRegistration } from "../components/admin/merchant-registration"
import SidekickConsole from "@/components/admin/os-console/sidekick-console"
import type { ActiveTab, Product, Order, Customer, Discount } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_DISCOUNTS } from "@/lib/mock-data"

export default function Page() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const handleSetActiveTab = (tab: ActiveTab) => {
    console.log(`[Navigation] Tab changed to: ${tab}`)
    setActiveTab(tab)
  }

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS)
  const [stores, setStores] = useState<any[]>([])
  const [currentTheme, setCurrentTheme] = useState("theme-minimal")

  const loadDataFromAPI = async () => {
    try {
      setLoading(true)
      
      const [fetchedProducts, fetchedOrders, fetchedCustomers, fetchedDiscounts] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getOrders(),
        apiClient.getCustomers(),
        apiClient.getDiscounts()
      ])

      setProducts(fetchedProducts)
      setOrders(fetchedOrders)
      setCustomers(fetchedCustomers)
      setDiscounts(fetchedDiscounts)
    } catch (error) {
      console.error("[Data Load] Failed to load from API, using fallback data:", error)
      // If API fails, we keep the initial mock data or restore it
      setProducts(INITIAL_PRODUCTS)
      setOrders(INITIAL_ORDERS)
      setCustomers(INITIAL_CUSTOMERS)
      setDiscounts(INITIAL_DISCOUNTS)
    } finally {
      setLoading(false)
    }
  }

  const handleSetProducts = (newProducts: Product[]) => {
    setProducts(newProducts)
  }

  const handleSetOrders = (newOrders: Order[]) => {
    setOrders(newOrders)
  }

  const handleSetCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers)
  }

  const handleSetDiscounts = (newDiscounts: Discount[]) => {
    setDiscounts(newDiscounts)
  }

  useEffect(() => {
    setMounted(true)

    const registered = typeof window !== "undefined" && window.localStorage.getItem("ai-team-ready") === "true"
    const firstWelcome = registered && typeof window !== "undefined" && window.localStorage.getItem("ai-team-welcome") !== "true"

    setIsRegistered(registered)
    setShowWelcome(firstWelcome)

    if (registered) {
      loadDataFromAPI()
    }
  }, [])

  const handleRegistrationComplete = () => {
    window.localStorage.setItem("ai-team-ready", "true")
    window.localStorage.removeItem("ai-team-welcome")
    setIsRegistered(true)
    setShowWelcome(true)
    loadDataFromAPI()
  }

  const handleCloseWelcome = () => {
    window.localStorage.setItem("ai-team-welcome", "true")
    setShowWelcome(false)
  }

  if (!mounted) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center text-muted-foreground text-sm font-medium">
        正在启动 AI Commerce 控制台...
      </div>
    )
  }

  if (!isRegistered) {
    return <MerchantRegistration onComplete={handleRegistrationComplete} />
  }

  const renderView = () => {
    const safeProducts = products || []
    const safeOrders = orders || []
    const safeCustomers = customers || []
    const safeDiscounts = discounts || []
    const safeStores = stores || []

    switch (activeTab) {
      case "dashboard":
        return <DashboardView showWelcome={showWelcome} onCloseWelcome={handleCloseWelcome} />
      case "products":
        return <ProductsView products={safeProducts} setProducts={handleSetProducts} />
      case "orders":
        return <OrdersView orders={safeOrders} setOrders={handleSetOrders} />
      case "customers":
        return <CustomersView customers={safeCustomers} setCustomers={handleSetCustomers} />
      case "marketing":
        return <MarketingView />
      case "content":
        return <ContentView />
      case "discounts":
        return <DiscountsView discounts={safeDiscounts} setDiscounts={handleSetDiscounts} />
      case "stores":
        return <ChannelsView stores={safeStores} setStores={setStores} />
      case "storefront":
        return <StorefrontView currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
      case "analytics":
        return <AnalyticsView products={safeProducts} orders={safeOrders} customers={safeCustomers} />
      case "agents":
        return <AgentsView />
      case "os-console":
        return <SidekickConsole />
      case "ai-studio":
        return <AIStudioView />
      case "settings":
        return <SettingsView products={safeProducts} orders={safeOrders} />
      case "notifications":
        return <NotificationsView />
      case "merchants":
      case "queues":
      case "logs":
      case "billing":
      case "runtime":
        console.log(`Fallback for unrendered activeTab: ${activeTab}`)
        return <DashboardView showWelcome={showWelcome} onCloseWelcome={handleCloseWelcome} />
      default:
        return <DashboardView showWelcome={showWelcome} onCloseWelcome={handleCloseWelcome} />
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
      
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex h-20 items-center justify-center">
              <div className="text-muted-foreground text-sm">正在加载数据...</div>
            </div>
          )}
          {!loading && renderView()}
        </div>
        
        {showAIPanel && (
          <AIAssistantPanel 
            activeTab={activeTab} 
            onClose={() => setShowAIPanel(false)} 
          />
        )}
      </main>
      
      {!showAIPanel && (
        <button
          onClick={() => setShowAIPanel(true)}
          title="打开 AI 助手"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </button>
      )}
    </div>
  )
}
