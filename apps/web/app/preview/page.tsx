'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  Globe, 
  Sparkles, 
  Check, 
  Volume2, 
  VolumeX, 
  Send, 
  Mic, 
  ShoppingBag, 
  Eye, 
  Star, 
  CheckCircle, 
  Menu, 
  User, 
  ChevronRight, 
  Home, 
  ArrowRight,
  Monitor,
  Phone,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initialTemplates } from "../../components/landing/hero-section";

// Suspend child wrapper for reading queries safely during build
function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const templateId = searchParams?.get("templateId") || "hangpai-wholesale";
  const overridePrimary = searchParams?.get("primary");
  const overrideSecondary = searchParams?.get("secondary");
  const overrideBg = searchParams?.get("bg");
  const overrideText = searchParams?.get("text");

  // Find base template
  const template = initialTemplates.find(t => t.id === templateId) || initialTemplates[0];

  // Colors
  const colors = {
    primary: overridePrimary || template.primaryColor,
    secondary: overrideSecondary || template.secondaryColor,
    bg: overrideBg || template.bgColor,
    text: overrideText || template.textColor
  };
  // State hooks
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showCartToast, setShowCartToast] = useState(false);
  const [lastAddedProductName, setLastAddedProductName] = useState("");
  const [platformProducts, setPlatformProducts] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ products: 0, orders: 0, customers: 0, discounts: 0 });

  const displayProductsSource = platformProducts.length > 0 ? platformProducts : template.products;
  const displayProducts = displayProductsSource.map((item) => ({
    code: item.sku || item.code || item.id || 'P-000',
    title: item.title || item.name || item.label || '精选商品',
    desc: item.description || item.desc || item.category || '来自统一平台数据库的实时商品。',
    price: typeof item.price === 'number' ? `¥${item.price.toFixed(2)}` : item.price || '¥0',
  }));

  // Sound and AI states
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model", text: string }>>([
    { role: "user", text: template.speech.userQuestion },
    { role: "model", text: template.speech.aiAnswer }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const activeSpeechRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to latest turn
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (activeSpeechRef.current) {
        activeSpeechRef.current.pause();
      }
    };
  }, []);

  // Load real platform data from the unified backend database
  useEffect(() => {
    const controller = new AbortController();

    async function loadPlatformData() {
      try {
        const [productsRes, ordersRes, customersRes, discountsRes] = await Promise.all([
          fetch('/api/platform/products', { signal: controller.signal }),
          fetch('/api/platform/orders', { signal: controller.signal }),
          fetch('/api/platform/customers', { signal: controller.signal }),
          fetch('/api/platform/discounts', { signal: controller.signal }),
        ]);

        if (!productsRes.ok || !ordersRes.ok || !customersRes.ok || !discountsRes.ok) {
          return;
        }

        const [products, orders, customers, discounts] = await Promise.all([
          productsRes.json(),
          ordersRes.json(),
          customersRes.json(),
          discountsRes.json(),
        ]);

        setPlatformProducts(Array.isArray(products) ? products : []);
        setPlatformStats({
          products: Array.isArray(products) ? products.length : 0,
          orders: Array.isArray(orders) ? orders.length : 0,
          customers: Array.isArray(customers) ? customers.length : 0,
          discounts: Array.isArray(discounts) ? discounts.length : 0,
        });
      } catch (error) {
        console.error('Failed to load platform data:', error);
      }
    }

    loadPlatformData();
    return () => controller.abort();
  }, []);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (productName: string) => {
    setCartCount(prev => prev + 1);
    setLastAddedProductName(productName);
    setShowCartToast(true);
    setTimeout(() => setShowCartToast(false), 3000);
  };

  const handleChatSubmit = async (textToSend?: string) => {
    const inputMsg = textToSend || chatInput;
    if (!inputMsg.trim() || isChatLoading) return;

    if (!textToSend) setChatInput("");

    const newHistory = [...chatHistory, { role: "user" as const, text: inputMsg }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const historyParts = newHistory.map(msg => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.text }]
      }));

      const latestContextTurn = {
        role: "user" as const,
        parts: [{
          text: `【外部子站商机联动】：当前独立预览品牌为【${template.title}】。此店铺是由商家一键发布生成的临时高保真预览场景。主色调是 ${colors.primary}，辅助色 ${colors.secondary}，背景色 ${colors.bg}。热销的产品有：${displayProducts.map(p => p.title).join(", ")}。
请结合上述独立商铺的视觉氛围，高情商、像一位极具亲和力的主店长那样，完美且生动地回答客户提问。内容精简在3句话以内，确保情绪饱满并自带对应的 Emoji。
用户的新输入：${inputMsg}`
        }]
      };

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: [...historyParts, latestContextTurn]
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        const responseText = data.text;
        setChatHistory(prev => [...prev, { role: "model" as const, text: responseText }]);

        // Sound text-to-speech option if not muted
        if (!isMuted) {
          try {
            const ttsResponse = await fetch("/api/gemini", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "tts",
                textToSpeak: responseText.replace(/\*\*|#|\*/g, "").slice(0, 100)
              })
            });
            const ttsData = await ttsResponse.json();
            if (ttsData.success && ttsData.audio) {
              if (activeSpeechRef.current) {
                activeSpeechRef.current.pause();
              }
              const sound = new Audio(`data:audio/wav;base64,${ttsData.audio}`);
              activeSpeechRef.current = sound;
              sound.play().catch(e => console.log("Audio play blocked by browser. Click to retry."));
            }
          } catch (ttsErr) {
            console.error("TTS synthesis error:", ttsErr);
          }
        }
      } else {
        const fallbackText = "对不起伙伴，由于网络稍微波动。但我已随时记录您的采购及预约需求，将即刻为您核对专享订单！";
        setChatHistory(prev => [...prev, { role: "model" as const, text: fallbackText }]);
      }
    } catch (err) {
      console.error(err);
      const fallbackText = "已为您保留咨询记录！模搭边缘网络云实时渲染已经同步。期待您的再次预订与支持。";
      setChatHistory(prev => [...prev, { role: "model" as const, text: fallbackText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Pre-generate custom domain hash for professional aesthetic
  const passedSubdomain = searchParams?.get("subdomain");
  const mockSubdomain = passedSubdomain || `moda-${templateId.slice(0, 8)}-${colors.primary.replace("#", "").toLowerCase()}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Simulation Browser Deployment Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push("/")}
            className="group flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all transition-transform hover:scale-[1.02]"
            id="back-to-hq-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>返回模搭工作台</span>
          </button>
          <span className="text-neutral-700 font-light block">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[11px] font-bold text-neutral-300 font-mono">模搭微服务 · 临时子域已部署</div>
          </div>
        </div>

        {/* Address Simulator Bar */}
        <div className="flex-1 max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-neutral-400 font-mono mx-4 w-full">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="text-emerald-400 font-semibold font-mono select-all">
              https://{mockSubdomain}.modaai.shop
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500 font-sans shrink-0">
            <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              copied 
                ? "bg-emerald-600 text-white" 
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white"
            }`}
            id="share-link-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "复制成功！" : "复制临时域名"}</span>
          </button>
          
          <div className="hidden md:flex items-center gap-1 px-1.5 bg-neutral-950 border border-neutral-800 rounded-lg">
            <button 
              onClick={() => setDevice("desktop")} 
              className={`p-1.5 rounded transition-all ${device === "desktop" ? "bg-neutral-800 text-indigo-400" : "text-neutral-500"}`}
              title="桌面端预览"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setDevice("mobile")} 
              className={`p-1.5 rounded transition-all ${device === "mobile" ? "bg-neutral-800 text-indigo-400" : "text-neutral-500"}`}
              title="移动端预览"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Screen Body */}
      <div className="flex-1 w-full bg-neutral-950 flex justify-center items-start p-2 sm:p-6 overflow-hidden">
        
        {/* Responsive Frame container */}
        <div 
          className={`h-full flex-1 transition-all duration-300 max-h-[85vh] flex flex-col md:flex-row gap-6 ${
            device === "mobile" 
              ? "max-w-sm border-4 border-neutral-800 rounded-[3rem] overflow-hidden shadow-2xl relative bg-[#fafafa]" 
              : "w-full max-w-7xl"
          }`}
          id="preview-viewport-container"
        >
          {/* Main Visual Shop Page */}
          <div 
            className="flex-1 bg-white flex flex-col overflow-y-auto rounded-3xl relative shadow-lg text-[#1f2937]"
            style={{ 
              backgroundColor: colors.bg, 
              color: colors.text,
              "--preview-primary": colors.primary,
              "--preview-secondary": colors.secondary,
              "--preview-bg": colors.bg,
              "--preview-text": colors.text,
            } as React.CSSProperties}
          >
            {/* Template Announcement Bar */}
            <div 
              className="py-1.5 px-4 text-[10.5px] font-bold text-center tracking-wide flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary, color: "#ffffff" }}
            >
              <Zap className="w-3 h-3 animate-pulse shrink-0" />
              <span>{template.schema.sections.announcement.text}</span>
            </div>

            {platformStats.products + platformStats.orders + platformStats.customers + platformStats.discounts > 0 && (
              <div className="px-4 py-3 bg-white/80 border-b border-black/5 text-xs text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="font-semibold text-neutral-900">实时平台数据已接入统一数据库</div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
                  <span className="text-neutral-700">商品 {platformStats.products}</span>
                  <span className="text-neutral-700">订单 {platformStats.orders}</span>
                  <span className="text-neutral-700">客户 {platformStats.customers}</span>
                  <span className="text-neutral-700">优惠 {platformStats.discounts}</span>
                </div>
              </div>
            )}

            {/* Template Store Header */}
            <header className="border-b border-black/5 bg-white/70 py-4.5 px-6 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: colors.primary }}>
                  M
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight leading-none text-neutral-900">{template.schema.sections.header.title}</h1>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">MODA DEPLOYED PREVIEW</span>
                </div>
              </div>

              {/* Fake Shop Top Nav Links */}
              <nav className="hidden md:flex items-center gap-4 text-xs font-bold text-neutral-600">
                <span className="text-indigo-600 font-extrabold cursor-pointer">甄选主页</span>
                <span className="hover:text-black transition-colors cursor-pointer">全线品类</span>
                <span className="hover:text-black transition-colors cursor-pointer">设计白皮书</span>
                <span className="hover:text-black transition-colors cursor-pointer">核心参数</span>
              </nav>

              <div className="flex items-center gap-2">
                <button 
                  className="relative p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-800"
                  onClick={() => handleAddToCart("全线奢品订阅契据")}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-bounce shadow-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
                <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            </header>

            {/* Template Shop Hero */}
            <section className="px-6 py-12 md:py-16 text-center shrink-0 border-b border-black/5 flex flex-col items-center">
              <span 
                className="text-[9.5px] font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest mb-3 border border-indigo-100 block"
              >
                模搭AIOS 一键全静态渲染
              </span>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-none max-w-2xl text-neutral-900">
                {template.schema.sections.hero.title}
              </h2>
              <p className="text-neutral-500 text-xs md:text-sm mt-3 max-w-lg leading-relaxed font-sans">
                {template.schema.sections.hero.subtitle}
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button 
                  className="rounded-full px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: colors.primary }}
                  onClick={() => {
                    const firstProduct = displayProducts[0]?.title || "特色好物";
                    handleAddToCart(firstProduct);
                  }}
                >
                  即刻咨询 / 快速点单
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="bg-white border border-neutral-300 text-neutral-700 rounded-full px-5 py-2.5 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  分享给客户
                </button>
              </div>
            </section>

            {/* Featured Collection Section */}
            <section className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-sm font-black text-neutral-400 tracking-wider font-mono uppercase">HOT SALES</h3>
                  <h2 className="text-lg font-black text-neutral-900">{template.schema.sections.featured_collection.title}</h2>
                </div>
                <div className="text-xs text-neutral-400 font-bold flex items-center gap-1 cursor-pointer">
                  <span>查看全部</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Store Products List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="preview-products-grid">
                {displayProducts.map((prod, idx) => (
                  <div 
                    key={`${prod.code}-${idx}`}
                    className="bg-white border border-neutral-200/60 p-5 rounded-2xl flex flex-col justify-between hover:border-neutral-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                          {prod.code}
                        </span>
                        <div className="flex items-center text-amber-500 text-[10px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold ml-0.5">4.9</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {prod.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-1 lines-clamp-2 leading-relaxed">
                        {prod.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-50">
                      <span className="text-xs font-black text-neutral-900 font-mono tracking-tight">{prod.price}</span>
                      <button 
                        onClick={() => handleAddToCart(prod.title)}
                        className="bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-[10.5px] font-bold rounded-xl px-3 py-1.5 transition-all cursor-pointer"
                        id={`btn-add-to-cart-${prod.code}`}
                      >
                        加入采购
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Core expert tips / details */}
            <section className="mx-6 mb-6 p-5 rounded-2xl border border-neutral-200 bg-white/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-neutral-900 font-sans flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{template.schema.sections.expert_tips.title}</span>
                </h4>
                <p className="text-[11px] text-neutral-400 leading-normal mt-0.5">{template.schema.sections.expert_tips.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto text-[10px] font-semibold text-[#8e8e93]">
                <span>部署等级: SECURE</span>
              </div>
            </section>

            {/* Bottom Footer */}
            <footer className="mt-auto border-t border-black/5 bg-neutral-50 py-6 px-6 text-center text-[10px] text-neutral-400 font-sans">
              <p>{template.schema.sections.footer.copyright}</p>
              <p className="mt-1 opacity-70">模搭 AIOS 智能引擎自动编译输出 · 静态商学院沙盒环境</p>
            </footer>
          </div>

          {/* Right Live Multimodal Conversation Assistant Module */}
          <div className="w-full md:w-96 bg-white rounded-3xl border border-neutral-200 flex flex-col overflow-hidden shadow-lg" id="preview-ai-pane">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between select-noneshrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center.font-bold">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black font-display tracking-tight leading-none">AI 智能配菜导购官</h3>
                  <span className="text-[9px] font-medium opacity-85">多模态声音合成随时待命</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title={isMuted ? "开启语音解说" : "静音"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-300" />}
                </button>
              </div>
            </div>

            {/* AI Assistant Chat view history */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50 scrollbar-thin text-xs">
              {chatHistory.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={idx}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2 max-w-full`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                    )}
                    <div 
                      className={`p-3 rounded-2xl leading-relaxed font-sans max-w-[85%] breakout font-medium ${
                        isUser 
                          ? "bg-indigo-600 text-white rounded-tr-none text-right font-medium" 
                          : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none font-medium text-left shadow-xs"
                      }`}
                    >
                      <p>{msg.text.replace(/\*\*/g, '')}</p>
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center animate-spin">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-bold animate-pulse">正在利用 Gemini 结合色系为您深度筹划...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* AI Interactive Guide Speech Input */}
            <div className="p-3 border-t border-neutral-100 shrink-0 bg-white">
              <div className="flex gap-1.5 flex-wrap pb-2 font-sans select-none justify-start">
                <button 
                  onClick={() => handleChatSubmit("有什么近期推荐的新品爆款么？")}
                  className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold py-1 px-2.5 rounded-full text-[10px] transition-all cursor-pointer"
                >
                  ✨ 爆款好货
                </button>
                <button 
                  onClick={() => handleChatSubmit("请问你们这里可以开具正规发票吗？")}
                  className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 font-bold py-1 px-2.5 rounded-full text-[10px] transition-all cursor-pointer"
                >
                  📝 挂单与发票
                </button>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChatSubmit();
                  }}
                  placeholder="说点什么或敲击快捷指引气泡..."
                  className="flex-1 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-xs rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all placeholder-neutral-400 font-medium"
                />
                <button 
                  onClick={() => handleChatSubmit()}
                  disabled={isChatLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  id="preview-chat-send-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cart Toast Notification Screen Widget */}
      <AnimatePresence>
        {showCartToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-neutral-900 border border-neutral-800 p-4.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 max-w-sm font-sans text-left"
            id="toast-added-to-cart"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">加入采购大单成功！</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">已暂存 [{lastAddedProductName}] 至预购结算清单。</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center font-sans">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <span className="text-xs font-bold text-neutral-400 animate-pulse uppercase tracking-widest">正在启动模搭极速预览子系统...</span>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
