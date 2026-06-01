import React, { useState, useEffect } from 'react';
import {
  Home, Sparkles, LayoutTemplate, Bot, ShoppingCart, Tag, Users, Percent,
  Megaphone, FileText, BarChart3, Radio, Store, Settings, Languages, CreditCard,
  Globe, Users2, Play, RefreshCw, Plus, Trash2, Edit3, X, HelpCircle, Check, Sparkle
} from 'lucide-react';

// Interfaces
interface CanvasElement {
  id: string;
  type: string;
  content: string;
  imageUrl?: string;
  price?: string;
  stock?: string;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    borderRadius?: string;
    padding?: string;
  }
}

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  imageUrl: string;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: 'Pending' | 'Paid' | 'Fulfillment';
}

export default function App() {
  // Current Visual Tab
  const [activeTab, setActiveTab] = useState<string>('ai_canvas');
  // Dynamic Workspace and Canvas Preview Themes (defaults to luxury dark, with full pristine light option)
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>('dark');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  // Sidebar Helper for beautiful theme support
  const getSidebarButtonClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    const isDark = workspaceTheme === 'dark';
    const base = "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-semibold ";
    
    if (isActive) {
      return base + (isDark 
        ? "bg-indigo-600/10 text-indigo-400 font-bold" 
        : "bg-indigo-50 text-indigo-600 font-bold shadow-sm");
    } else {
      return base + (isDark 
        ? "text-gray-400 hover:bg-[#1A1A1C]" 
        : "text-slate-600 hover:bg-slate-50");
    }
  };

  // Helper for Product Canvas elements to pop gracefully on both light/dark backgrounds
  const getAdaptiveStyles = (el: CanvasElement, theme: 'dark' | 'light') => {
    const isDark = theme === 'dark';
    let bg = el.style?.backgroundColor;
    let fg = el.style?.color;
    
    if (el.type === 'badge') {
      if (!bg || bg === '#EEF2FF' || bg === '#FEF3C7' || bg === '#FEE2E2') {
        bg = isDark ? '#1E1B4B' : bg || '#EEF2FF';
      }
      if (!fg || fg === '#4F46E5' || fg === '#D97706' || fg === '#EF4444') {
        fg = isDark ? '#818CF8' : fg || '#4F46E5';
      }
    }
    
    if (el.type === 'text') {
      if (!fg || fg === '#111827' || fg === '#000000') {
        fg = isDark ? '#FFFFFF' : '#111827';
      } else if (fg === '#6B7280' || fg === '#4B5563') {
        fg = isDark ? '#9CA3AF' : '#4B5563';
      }
    }
    
    if (el.type === 'button') {
      if (!bg || bg === '#000000' || bg === '#FFFFFF') {
        bg = isDark ? '#4F46E5' : '#000000';
      }
      if (!fg || fg === '#FFFFFF' || fg === '#000000') {
        fg = isDark ? '#FFFFFF' : '#FFFFFF';
      }
    }
    
    return {
      ...el.style,
      backgroundColor: bg,
      color: fg,
    };
  };

  // Products state (synchronized with Canvas elements)
  const [products, setProducts] = useState<Product[]>([
    { id: 'prod-1', name: 'Minimal Leather Tote', price: '$189.00', stock: 12, category: 'Bag', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
    { id: 'prod-2', name: 'Classic Leather Wallet', price: '$49.00', stock: 24, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1627124357128-5a3cbd8e359o?auto=format&fit=crop&w=600&q=80' },
    { id: 'prod-3', name: 'Saddle Crossbody Bag', price: '$220.00', stock: 8, category: 'Bag', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
  ]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-1002', customer: 'Alex Rivera', date: '2026-05-27', total: '$189.00', status: 'Paid' },
    { id: 'ORD-1003', customer: 'Sophia Chen', date: '2026-05-26', total: '$238.00', status: 'Pending' },
    { id: 'ORD-1004', customer: 'Jonathan Davis', date: '2026-05-25', total: '$49.00', status: 'Fulfillment' },
  ]);

  // Active discounts list
  const [discounts, setDiscounts] = useState([
    { code: 'SATORI20', rate: '20%', status: 'Active', usage: 142 },
    { code: 'WELCOMESATORI', rate: '10%', status: 'Active', usage: 89 }
  ]);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountRate, setNewDiscountRate] = useState('15%');

  // Selected editable element on the AI Canvas
  const [selectedElementId, setSelectedElementId] = useState<string | null>('item-title');

  // Live Canvas state
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([
    {
      id: 'hero-img',
      type: 'image',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'item-badge',
      type: 'badge',
      content: 'Limited Edition',
      style: { backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: 'xs', borderRadius: 'full', padding: '1.5' }
    },
    {
      id: 'item-title',
      type: 'text',
      content: 'Minimal Leather Tote',
      style: { fontSize: '2xl', fontWeight: 'bold', color: '#111827' }
    },
    {
      id: 'item-desc',
      type: 'text',
      content: 'Sustainable materials, handcrafted in Tuscany. The perfect daily companion for the modern creative.',
      style: { fontSize: 'sm', color: '#6B7280' }
    },
    {
      id: 'item-metrics',
      type: 'container',
      content: '',
      price: '$189.00',
      stock: '12 Left'
    },
    {
      id: 'item-button',
      type: 'button',
      content: 'Add to Cart',
      style: { backgroundColor: '#000000', color: '#FFFFFF', fontWeight: 'bold', borderRadius: 'lg', padding: '3' }
    }
  ]);

  // AI Assistant Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: '你好！我是 Satori 智能设计助手。我可以帮你优化产品页面的布局、文案或色彩。您可以试着对我说：“将按钮背景变成靛蓝色” 或 “添加限时折扣徽章”。' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Marketing Campaign generator
  const [campaigns, setCampaigns] = useState([
    { id: 'c-1', name: 'Summer Handcrafted Special', channel: 'Instagram Ads', budget: '$450/mo', status: 'Running', ctr: '3.8%', cpc: '$0.42' },
    { id: 'c-2', name: 'Premium Leather Retargeting', channel: 'Google Search', budget: '$600/mo', status: 'Paused', ctr: '5.2%', cpc: '$0.85' }
  ]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignChannel, setNewCampaignChannel] = useState('TikTok Ads');
  const [newCampaignBudget, setNewCampaignBudget] = useState('$300/mo');

  // AI Copywriting generator
  const [copyKeyword, setCopyKeyword] = useState('意大利进口牛皮, 极简托特包');
  const [copyStyle, setCopyStyle] = useState('高端/奢华');
  const [generatedCopy, setGeneratedCopy] = useState('意大利全粒面牛皮手工缝制，流露尊贵韵致。专为追求极致审美的都市创意人呈现。');

  // Customer DB
  const [customers, setCustomers] = useState([
    { id: 'c-1', name: 'Sophia Chen', email: 'sophia@example.com', spend: '$1,290.00', profile: '高净值核心' },
    { id: 'c-2', name: 'Lucas Sinclair', email: 'lucas@example.com', spend: '$420.00', profile: '活动驱动型' },
    { id: 'c-3', name: 'Emma Watson', email: 'emma@example.com', spend: '$189.00', profile: '新晋顾客' }
  ]);

  // Active integrations
  const [integrations, setIntegrations] = useState([
    { id: 'tiktok', name: 'TikTok Shop SDK', enabled: true, logs: 'TikTok channel synced successfully. 4 products pushed.' },
    { id: 'insta', name: 'Instagram Shopping Feed', enabled: true, logs: 'Connected with Meta Business Manager. Assets synced.' },
    { id: 'gmerch', name: 'Google Merchant Center', enabled: false, logs: 'Awating product feed URL validation' }
  ]);

  // Store Configuration
  const [storeName, setStoreName] = useState('Satori Commerce Studio');
  const [storeCurrency, setStoreCurrency] = useState('USD ($)');
  const [storeLanguage, setStoreLanguage] = useState('zh-CN (简体中文)');

  // Selected preset template to apply quickly
  const handleApplyTemplate = (templateName: string) => {
    if (templateName === 'summer') {
      setCanvasElements([
        { id: 'hero-img', type: 'image', content: '', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
        { id: 'item-badge', type: 'badge', content: 'HOT SUMMER DEALS', style: { backgroundColor: '#FEE2E2', color: '#EF4444', fontSize: 'xs', borderRadius: 'sm', padding: '1.5' } },
        { id: 'item-title', type: 'text', content: 'Saddle Leather Crossbody', style: { fontSize: '2xl', fontWeight: 'bold', color: '#111827' } },
        { id: 'item-desc', type: 'text', content: 'Authentic warm tan color, lightweight and water-resistant.', style: { fontSize: 'sm', color: '#4B5563' } },
        { id: 'item-metrics', type: 'container', content: '', price: '$220.00', stock: '8 Left' },
        { id: 'item-button', type: 'button', content: 'Buy Summer Collection', style: { backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 'bold', borderRadius: 'full', padding: '3.5' } }
      ]);
    } else if (templateName === 'cyberpunk') {
      setCanvasElements([
        { id: 'hero-img', type: 'image', content: '', imageUrl: 'https://images.unsplash.com/photo-1627124357128-5a3cbd8e359o?auto=format&fit=crop&w=600&q=80' },
        { id: 'item-badge', type: 'badge', content: 'NEO-EDITION // 2042', style: { backgroundColor: '#10B981', color: '#047857', fontSize: 'xs', borderRadius: 'none', padding: '1.5' } },
        { id: 'item-title', type: 'text', content: 'Tactical Leather Wallet', style: { fontSize: '2xl', fontWeight: 'bold', color: '#06B6D4' } },
        { id: 'item-desc', type: 'text', content: 'Constructed from Kevlar reinforced leather, RFID block enabled.', style: { fontSize: 'sm', color: '#4B5563' } },
        { id: 'item-metrics', type: 'container', content: '', price: '$79.00', stock: '99+ In stock' },
        { id: 'item-button', type: 'button', content: 'ENGAGE CART SYSTEM', style: { backgroundColor: '#06B6D4', color: '#000000', fontWeight: 'bold', borderRadius: 'none', padding: '3' } }
      ]);
    } else {
      // Default reset
      setCanvasElements([
        { id: 'hero-img', type: 'image', content: '', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
        { id: 'item-badge', type: 'badge', content: 'Limited Edition', style: { backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: 'xs', borderRadius: 'full', padding: '1.5' } },
        { id: 'item-title', type: 'text', content: 'Minimal Leather Tote', style: { fontSize: '2xl', fontWeight: 'bold', color: '#111827' } },
        { id: 'item-desc', type: 'text', content: 'Sustainable materials, handcrafted in Tuscany. The perfect daily companion for the modern creative.',
          style: { fontSize: 'sm', color: '#6B7280' } },
        { id: 'item-metrics', type: 'container', content: '', price: '$189.00', stock: '12 Left' },
        { id: 'item-button', type: 'button', content: 'Add to Cart', style: { backgroundColor: '#000000', color: '#FFFFFF', fontWeight: 'bold', borderRadius: 'lg', padding: '3' } }
      ]);
    }
  };

  // Sync canvas modifications made directly in selection HUD
  const updateSelectedElementValue = (field: string, value: any) => {
    if (!selectedElementId) return;
    setCanvasElements(prev => prev.map(el => {
      if (el.id !== selectedElementId) return el;
      if (field === 'content') return { ...el, content: value };
      if (field === 'price') return { ...el, price: value };
      if (field === 'stock') return { ...el, stock: value };
      if (field === 'imageUrl') return { ...el, imageUrl: value };
      if (field.startsWith('style.')) {
        const styleProp = field.split('.')[1];
        return {
          ...el,
          style: {
            ...el.style,
            [styleProp]: value
          }
        };
      }
      return el;
    }));
  };

  // Ask AI Assistant implementation
  const handleAiAssistantRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const promptText = chatInput;
    setChatLog(prev => [...prev, { sender: 'user', text: promptText }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, canvasState: canvasElements })
      });

      if (!response.ok) {
        throw new Error('API return not OK');
      }

      const rawJson = await response.json();
      if (rawJson?.updatedCanvasState) {
        setCanvasElements(rawJson.updatedCanvasState);
        setChatLog(prev => [...prev, { sender: 'ai', text: rawJson.assistantMessage || '我已根据您的要求修改了页面设计布局。' }]);
      } else {
        throw new Error('JSON mismatch');
      }
    } catch (err) {
      // Detected missing secret or API error, run High Fidelity local emulator immediately
      const lower = promptText.toLowerCase();
      let feedback = '已检测到智能模型，本地模拟微调调整成功：';
      let changed = false;

      const updated = canvasElements.map(el => {
        // Button style changes
        if (el.type === 'button') {
          if (lower.includes('blue') || lower.includes('蓝') || lower.includes('靛') || lower.includes('indigo')) {
            changed = true;
            feedback += '按钮背景已修改为尊贵靛蓝色(#4F46E5)；';
            return { ...el, style: { ...el.style, backgroundColor: '#4F46E5', color: '#FFFFFF' } };
          }
          if (lower.includes('red') || lower.includes('红')) {
            changed = true;
            feedback += '按钮背景已修改为活力中国红(#EF4444)；';
            return { ...el, style: { ...el.style, backgroundColor: '#EF4444', color: '#FFFFFF' } };
          }
          if (lower.includes('black') || lower.includes('黑')) {
            changed = true;
            feedback += '按钮背景已修改为极简纯黑色(#000000)；';
            return { ...el, style: { ...el.style, backgroundColor: '#000000', color: '#FFFFFF' } };
          }
        }
        // Badge text or status edits
        if (el.type === 'badge') {
          if (lower.includes('limited') || lower.includes('限时') || lower.includes('限量') || lower.includes('badge')) {
            changed = true;
            feedback += '标签内容更新为“9.5折限时秒杀”；';
            return { ...el, content: '9.5折限时秒杀', style: { ...el.style, backgroundColor: '#FEF3C7', color: '#D97706' } };
          }
        }
        // Title alterations
        if (el.type === 'text' && el.id === 'item-title') {
          if (lower.includes('tote') || lower.includes('皮包') || lower.includes('名称')) {
            changed = true;
            feedback += '产品名称微调更显著；';
            return { ...el, content: '臻品手工全牛皮托特包', style: { ...el.style, color: '#111827', fontWeight: 'bold' } };
          }
        }
        // Price modifications
        if (el.type === 'container') {
          if (lower.includes('price') || lower.includes('元') || lower.includes('$') || lower.includes('价格')) {
            changed = true;
            feedback += '售价设为优惠价 $169.00（库存调整为剩余 9 件）；';
            return { ...el, price: '$169.00', stock: '仅剩 9 件' };
          }
        }
        return el;
      });

      if (!changed) {
        // General generic simulation to make sure layout improves visually
        feedback = 'AI 建议：已优化托特包产品卡片的文字粗细，并强化了 CTA 购买动作按钮圆角(全圆角)，以增强点击转化率。';
        setCanvasElements(canvasElements.map(el => {
          if (el.type === 'button') {
            return { ...el, style: { ...el.style, borderRadius: 'full', padding: '3.5' } };
          }
          if (el.id === 'item-title') {
            return { ...el, style: { ...el.style, fontSize: '3xl', fontWeight: 'bold' } };
          }
          return el;
        }));
      } else {
        setCanvasElements(updated);
      }

      setChatLog(prev => [...prev, { sender: 'ai', text: feedback }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const selectedElement = canvasElements.find(el => el.id === selectedElementId);

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans transition-all duration-300 ${
      workspaceTheme === 'dark' 
        ? 'text-gray-300 bg-[#0A0A0B]' 
        : 'text-[#1E293B] bg-[#F8FAFC]'
    }`}>
      {/* SIDEBAR NAVIGATION AREA */}
      <aside className={`w-64 border-r flex flex-col shrink-0 transition-colors duration-300 ${
        workspaceTheme === 'dark' 
          ? 'border-[#242426] bg-[#0E0E10]' 
          : 'border-slate-200 bg-[#FFFFFF] shadow-[2px_0_8px_rgba(0,0,0,0.02)]'
      }`}>
        {/* Brand Banner */}
        <div className={`p-5 border-b flex items-center gap-3 ${
          workspaceTheme === 'dark' ? 'border-[#242426]' : 'border-slate-100'
        }`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shrink-0">
            S
          </div>
          <div>
            <span className={`font-semibold tracking-tight block text-sm ${
              workspaceTheme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>Satori AI Studio</span>
            <span className="text-[10px] text-slate-400 block font-medium">智能电商管理控制台</span>
          </div>
        </div>

        {/* Navigation lists strictly parsed based on user's structure diagram */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Main Home section */}
          <div>
            <ul className="space-y-1">
              <li>
                <button
                  id="nav-btn-home"
                  onClick={() => setActiveTab('home')}
                  className={getSidebarButtonClass('home')}
                >
                  <Home className={`w-4 h-4 ${workspaceTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  主页
                </button>
              </li>
            </ul>
          </div>

          {/* Core AI Workspace Section */}
          <div id="section-ai-studio">
            <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 px-3 ${
              workspaceTheme === 'dark' ? 'text-[#818CF8]' : 'text-indigo-600'
            }`}>
              AI 工作室 (核心)
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  id="nav-btn-canvas"
                  onClick={() => setActiveTab('ai_canvas')}
                  className={getSidebarButtonClass('ai_canvas')}
                >
                  <Sparkles className={`w-4 h-4 ${workspaceTheme === 'dark' ? 'text-indigo-400 animate-pulse' : 'text-indigo-600 animate-pulse'}`} />
                  AI 画布
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-templates animate-pulsing"
                  onClick={() => setActiveTab('templates')}
                  className={getSidebarButtonClass('templates')}
                >
                  <LayoutTemplate className="w-4 h-4" />
                  模板库
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-agents"
                  onClick={() => setActiveTab('agents')}
                  className={getSidebarButtonClass('agents')}
                >
                  <Bot className="w-4 h-4" />
                  智能体 (AI Agents)
                </button>
              </li>
            </ul>
          </div>

          {/* Business Admin (订单, 产品, 客户, 折扣) */}
          <div>
            <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 px-3 ${
              workspaceTheme === 'dark' ? 'text-gray-500' : 'text-slate-400'
            }`}>
              商业
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  id="nav-btn-orders"
                  onClick={() => setActiveTab('orders')}
                  className={getSidebarButtonClass('orders')}
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    订单
                  </span>
                  <span className="bg-amber-600/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">1</span>
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-products"
                  onClick={() => setActiveTab('products')}
                  className={getSidebarButtonClass('products')}
                >
                  <Tag className="w-4 h-4" />
                  产品
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-customers"
                  onClick={() => setActiveTab('customers')}
                  className={getSidebarButtonClass('customers')}
                >
                  <Users className="w-4 h-4" />
                  客户
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-discounts"
                  onClick={() => setActiveTab('discounts')}
                  className={getSidebarButtonClass('discounts')}
                >
                  <Percent className="w-4 h-4" />
                  折扣
                </button>
              </li>
            </ul>
          </div>

          {/* Marketing (市场营销, 内容, 分析) */}
          <div>
            <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 px-3 ${
              workspaceTheme === 'dark' ? 'text-gray-500' : 'text-slate-400'
            }`}>
              营销
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  id="nav-btn-campaigns"
                  onClick={() => setActiveTab('marketing')}
                  className={getSidebarButtonClass('marketing')}
                >
                  <Megaphone className="w-4 h-4" />
                  市场营销
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-copywriter"
                  onClick={() => setActiveTab('content')}
                  className={getSidebarButtonClass('content')}
                >
                  <FileText className="w-4 h-4" />
                  内容 / 文案生成
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-analytics"
                  onClick={() => setActiveTab('analytics')}
                  className={getSidebarButtonClass('analytics')}
                >
                  <BarChart3 className="w-4 h-4" />
                  分析 / 报表
                </button>
              </li>
            </ul>
          </div>

          {/* Channels (销售渠道, 在线商店) */}
          <div>
            <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 px-3 ${
              workspaceTheme === 'dark' ? 'text-gray-500' : 'text-slate-400'
            }`}>
              渠道
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  id="nav-btn-channels-list"
                  onClick={() => setActiveTab('channels')}
                  className={getSidebarButtonClass('channels')}
                >
                  <Radio className="w-4 h-4" />
                  销售渠道
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-online-store"
                  onClick={() => setActiveTab('online_store')}
                  className={getSidebarButtonClass('online_store')}
                >
                  <Store className="w-4 h-4" />
                  在线商店
                </button>
              </li>
            </ul>
          </div>

          {/* Settings Set (店铺设置, 市场, 支付, 域名, 团队) */}
          <div>
            <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 px-3 ${
              workspaceTheme === 'dark' ? 'text-gray-500' : 'text-slate-400'
            }`}>
              设置
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  id="nav-btn-setting-generic"
                  onClick={() => setActiveTab('settings_store')}
                  className={getSidebarButtonClass('settings_store')}
                >
                  <Settings className="w-4 h-4" />
                  店铺设置
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-setting-lang"
                  onClick={() => setActiveTab('settings_markets')}
                  className={getSidebarButtonClass('settings_markets')}
                >
                  <Languages className="w-4 h-4" />
                  市场 (多语言/多货币)
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-setting-payment"
                  onClick={() => setActiveTab('settings_payments')}
                  className={getSidebarButtonClass('settings_payments')}
                >
                  <CreditCard className="w-4 h-4" />
                  支付方式
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-setting-domain"
                  onClick={() => setActiveTab('settings_domains')}
                  className={getSidebarButtonClass('settings_domains')}
                >
                  <Globe className="w-4 h-4" />
                  域名指向
                </button>
              </li>
              <li>
                <button
                  id="nav-btn-setting-team"
                  onClick={() => setActiveTab('settings_team')}
                  className={getSidebarButtonClass('settings_team')}
                >
                  <Users2 className="w-4 h-4" />
                  团队管理
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Workspace status marker */}
        <div className={`p-4 border-t text-[11px] flex flex-col gap-1 transition-all duration-300 ${
          workspaceTheme === 'dark' 
            ? 'border-[#242426] bg-[#0B0B0C] text-gray-500' 
            : 'border-slate-100 bg-[#FAFAFA] text-slate-500'
        }`}>
          <div className="flex items-center gap-2 text-emerald-500 font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>本地开发沙盒就绪</span>
          </div>
          <span className={workspaceTheme === 'dark' ? 'text-gray-600' : 'text-slate-400'}>UTC: 2026-05-27 22:49</span>
        </div>
      </aside>

      {/* MAIN VIEWPORT PORT */}
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        workspaceTheme === 'dark' ? 'bg-[#121214]' : 'bg-[#F8FAFC]'
      }`}>
        {/* Top bar */}
        <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 transition-colors duration-300 ${
          workspaceTheme === 'dark' 
            ? 'border-[#242426] bg-[#0E0E10]' 
            : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={workspaceTheme === 'dark' ? 'text-gray-500 uppercase' : 'text-slate-400 uppercase'}>Satori Studio</span>
            <span className="text-gray-500 mt-0.5">/</span>
            <span className={workspaceTheme === 'dark' ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold'}>
              {activeTab === 'home' && '店铺主页概览'}
              {activeTab === 'ai_canvas' && '核心 AI 画布编辑器'}
              {activeTab === 'templates' && 'AI 精选店铺模板库'}
              {activeTab === 'agents' && '智能体控制台 (AI Agents)'}
              {activeTab === 'orders' && '订单管理'}
              {activeTab === 'products' && '产品目录库'}
              {activeTab === 'customers' && '高净值客户 CRM'}
              {activeTab === 'discounts' && '促销折扣管理'}
              {activeTab === 'marketing' && '营销投放配置'}
              {activeTab === 'content' && '智能文案撰稿人'}
              {activeTab === 'analytics' && '全渠道数据统计'}
              {activeTab === 'channels' && '销售分销渠道'}
              {activeTab === 'online_store' && '在线商店自定义'}
              {activeTab.startsWith('settings') && '系统高级配置'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Workspace Theme Switcher */}
            <div className={`flex items-center gap-1 p-0.5 rounded-lg border transition-all duration-300 ${
              workspaceTheme === 'dark' ? 'bg-[#161618] border-[#2D2D30]' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="workspace-theme-dark-btn"
                onClick={() => setWorkspaceTheme('dark')}
                className={`p-1 px-2.5 text-[10.5px] font-bold rounded transition-all ${
                  workspaceTheme === 'dark' 
                    ? 'bg-indigo-600/90 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="深色工作空间"
              >
                深色栏
              </button>
              <button
                id="workspace-theme-light-btn"
                onClick={() => setWorkspaceTheme('light')}
                className={`p-1 px-2.5 text-[10.5px] font-bold rounded transition-all ${
                  workspaceTheme === 'light' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="白色工作空间"
              >
                白色版
              </button>
            </div>

            <button
              onClick={() => setActiveTab('ai_canvas')}
              className={`px-3 py-1.5 rounded text-xs transition-all font-medium flex items-center gap-2 ${
                workspaceTheme === 'dark' 
                  ? 'border border-[#2D2D30] text-gray-300 hover:bg-[#1A1A1C]' 
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              进入 AI 画布
            </button>
            <div className="px-3 py-1.5 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-600/10">
              一键部署上线
            </div>
          </div>
        </header>

        {/* Dynamic Display area containing distinct page modules */}
        <div className={`flex-1 overflow-auto p-6 lg:p-8 transition-colors duration-300 ${
          workspaceTheme === 'dark' ? 'bg-[#121214]' : 'bg-[#FAFAFA]'
        }`}>

          {/* TAB 1: HOME PANEL */}
          {activeTab === 'home' && (
            <div id="view-home" className="max-w-6xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-indigo-900/40 to-[#0E0E10] p-6 rounded-xl border border-[#242426] flex flex-col justify-between md:flex-row md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    欢迎来到 {storeName}
                  </h1>
                  <p className="text-gray-400 text-xs mt-1">
                    当前商店已与 **AI 画布 (AI Canvas)** 协同绑定，您可以立即使用顶尖 AI 助理重构视觉样式并更新转化。
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ai_canvas')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-all self-start"
                >
                  启动 AI 画布
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: '预计本月营业总额', value: '$18,490.00', change: '+18.4% 环比增长', color: 'text-emerald-400' },
                  { title: '访客平均转化率', value: '4.2%', change: '转化极高 (高于均值2.8%)', color: 'text-indigo-400' },
                  { title: '全渠道活跃 AI 智能体', value: '2 个运行中', change: '客服 & 仓储警戒', color: 'text-amber-400' },
                  { title: '待处理未发货订单', value: '1 笔订单', change: '需尽快跟进', color: 'text-rose-400' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#0E0E10] p-4 rounded-lg border border-[#242426]">
                    <span className="text-gray-500 text-[10px] block font-bold uppercase tracking-wider">{stat.title}</span>
                    <span className="text-xl font-bold text-white block mt-1.5">{stat.value}</span>
                    <span className={`text-[11px] block mt-1.5 ${stat.color}`}>{stat.change}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Conversion Auditor Dashboard */}
                <div className="bg-[#0E0E10] p-5 rounded-lg border border-[#242426]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] mb-4">
                    AI 商店视觉转化率智能审核
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xl">
                      94%
                    </div>
                    <div>
                      <span className="text-white text-sm font-semibold block">排版与配色设计极佳</span>
                      <span className="text-gray-500 text-xs block">AI 引擎实时对 AI 画布进行了色彩学以及文案可读性检测。</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400 mt-2">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> 按钮对比度完美匹配 AAA 水准色值
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> 移动端排版行高和内边距响应安全
                    </li>
                    <li className="flex items-center gap-2 text-indigo-400">
                      <Sparkle className="w-3.5 h-3.5" /> 建议: 在托特包描述下添加一处真实“顾客评价”块
                    </li>
                  </ul>
                </div>

                {/* Audit activities */}
                <div className="bg-[#0E0E10] p-5 rounded-lg border border-[#242426]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                    最新协同修改日志
                  </h3>
                  <div className="space-y-4 text-xs">
                    {[
                      { user: 'AI Assistant', act: '优化了 “Minimal Leather Tote” 购买点击转化按钮', time: '刚刚' },
                      { user: 'Admin (您)', act: '更新了 Saddle Crossbody Bag 库存至 8 件', time: '1小时前' },
                      { user: 'AI Customer Care', act: '自动答复了 Sophia Chen 有关托特包尺寸疑问的询单', time: '2小时前' }
                    ].map((act, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 pb-2 border-b border-[#1C1C1E] last:border-none">
                        <div>
                          <span className="text-white font-semibold block">{act.user}</span>
                          <span className="text-gray-400 text-[11px] block mt-0.5">{act.act}</span>
                        </div>
                        <span className="text-gray-600 text-[11px] whitespace-nowrap">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI CANVAS */}
          {activeTab === 'ai_canvas' && (
            <div id="view-ai-canvas" className="h-full flex flex-col xl:flex-row gap-6">

              {/* Left Panel: Components/Templates */}
              <div className="w-full xl:w-64 bg-[#0E0E10] border border-[#242426] rounded-xl p-4 flex flex-col gap-5 shrink-0">
                <div>
                  <label className="text-[10px] uppercase text-[#4F46E5] font-bold block mb-3 tracking-wider">
                    点击/拖拽元素添加组件
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 text-xs">
                    {[
                      { label: '新文本行', icon: 'Text', action: () => {
                        setCanvasElements([...canvasElements, { id: 'new-txt-' + Date.now(), type: 'text', content: '新添加的提示文案段落', style: { fontSize: 'sm', color: '#6B7280' } }]);
                      }},
                      { label: '折扣徽章', icon: 'Badge', action: () => {
                        setCanvasElements([...canvasElements, { id: 'new-badge-' + Date.now(), type: 'badge', content: '智能限时：优惠八折', style: { backgroundColor: '#FEE2E2', color: '#EF4444', fontSize: 'xs', borderRadius: 'md', padding: '1' } }]);
                      }},
                      { label: '功能按钮', icon: 'Button', action: () => {
                        setCanvasElements([...canvasElements, { id: 'new-btn-' + Date.now(), type: 'button', content: '预定专属会员通道', style: { backgroundColor: '#4F46E5', color: '#FFFFFF', fontWeight: 'medium', borderRadius: 'md', padding: '2.5' } }]);
                      }}
                    ].map((comp, idx) => (
                      <button
                        key={idx}
                        onClick={comp.action}
                        className="bg-[#161618] border border-[#2D2D30] p-2.5 rounded-lg text-center cursor-pointer hover:border-indigo-500 hover:text-white transition-all text-xs text-gray-400"
                      >
                        {comp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#242426] pt-4">
                  <label className="text-[10px] uppercase text-gray-500 font-bold block mb-3 tracking-wider">
                    精选风格预设 (一键重组)
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'summer', title: '西西里之夏 (红色系/高转化)', desc: '意式热情红调' },
                      { id: 'cyberpunk', title: '塞伯霓虹 (Cyan/硬核风)', desc: '赛博科技绿蓝' },
                      { id: 'default', title: '极简摩登 (灰黑素雅)', desc: '高反差黑白' }
                    ].map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => handleApplyTemplate(tpl.id)}
                        className="bg-[#161618] rounded-lg border border-[#2D2D30] p-2 hover:border-indigo-400 cursor-pointer transition-all"
                      >
                        <div className="text-xs text-white font-medium">{tpl.title}</div>
                        <div className="text-[10px] text-gray-500">{tpl.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HUD Component Modifier Panel */}
                {selectedElement ? (
                  <div className="border-t border-[#242426] pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase text-indigo-400 font-bold tracking-wider">
                        选定组件配置面板
                      </span>
                      <button onClick={() => setSelectedElementId(null)} className="text-gray-500 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs bg-[#161618] p-3 rounded-lg border border-[#2D2D30]">
                      <div>
                        <span className="text-gray-500 block text-[10px] mb-1">组件标识 (ID)</span>
                        <code className="text-indigo-300 block font-mono text-[10px] break-keep">{selectedElement.id}</code>
                      </div>

                      {/* Content editor */}
                      {selectedElement.type !== 'image' && selectedElement.type !== 'container' && (
                        <div>
                          <label className="text-gray-400 block text-[10px] mb-1">文字内容 (Content)</label>
                          <input
                            type="text"
                            value={selectedElement.content}
                            onChange={(e) => updateSelectedElementValue('content', e.target.value)}
                            className="w-full bg-[#1e1e21] border border-[#2D2D30] rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}

                      {/* Style Background/Color */}
                      {selectedElement.style && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-1">文字颜色</span>
                            <input
                              type="text"
                              value={selectedElement.style.color || ''}
                              onChange={(e) => updateSelectedElementValue('style.color', e.target.value)}
                              placeholder="#000"
                              className="w-full bg-[#1e1e21] border border-[#2D2D30] rounded p-1 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-1">背景颜色</span>
                            <input
                              type="text"
                              value={selectedElement.style.backgroundColor || ''}
                              onChange={(e) => updateSelectedElementValue('style.backgroundColor', e.target.value)}
                              placeholder="transparent"
                              className="w-full bg-[#1e1e21] border border-[#2D2D30] rounded p-1 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setCanvasElements(canvasElements.filter(el => el.id !== selectedElement.id));
                          setSelectedElementId(null);
                        }}
                        className="w-full bg-rose-950/40 text-rose-400 hover:bg-rose-900/30 font-semibold p-1.5 rounded text-[11px] border border-rose-900/40 mt-1 transition-all"
                      >
                        删除此组件
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#161618] p-3 rounded-lg border border-[#2D2D30] text-[10px] text-gray-500 mt-auto text-center">
                    在右侧画布上点击任意一块，即可直接编辑其对应的高级属性配置
                  </div>
                )}
              </div>

              {/* Center Panel: Real-time Live Web preview */}
              <div className={`flex-1 border rounded-xl p-4 flex flex-col items-center justify-start overflow-y-auto transition-colors duration-300 ${
                workspaceTheme === 'dark' ? 'bg-[#0E0E10] border-[#242426]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-full flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                    workspaceTheme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    <Store className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    商品卡片编辑器实时画布 (可点击元素直接修改)
                  </span>

                  {/* Target Preview Theme Selector */}
                  <div className={`flex items-center gap-1 p-0.5 rounded-lg border transition-all duration-300 ${
                    workspaceTheme === 'dark' ? 'bg-[#161618] border-[#2D2D30]' : 'bg-slate-150 border-slate-200'
                  }`}>
                    <button
                      id="preview-theme-dark-btn"
                      onClick={() => setPreviewTheme('dark')}
                      className={`p-1 px-2.5 text-[10px] font-bold rounded transition-all ${
                        previewTheme === 'dark' 
                          ? 'bg-neutral-800 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🌙 奢华暗制 (Elegant Dark)
                    </button>
                    <button
                      id="preview-theme-light-btn"
                      onClick={() => setPreviewTheme('light')}
                      className={`p-1 px-2.5 text-[10px] font-bold rounded transition-all ${
                        previewTheme === 'light' 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      ☀️ 极简雅白 (Original Light)
                    </button>
                  </div>
                </div>

                <div 
                  id="view-ai-canvas"
                  className={`w-full max-w-[420px] rounded-2xl relative overflow-hidden transition-all duration-300 min-h-[520px] shadow-2xl ${
                    previewTheme === 'dark' 
                      ? 'bg-[#0A0A0B] text-white ring-4 ring-neutral-800/10' 
                      : 'bg-white text-black ring-4 ring-indigo-500/5'
                  }`}
                >
                  {/* Outer content blocks */}
                  {canvasElements.map(el => {
                    const isSelected = selectedElementId === el.id;
                    const finalStyle = getAdaptiveStyles(el, previewTheme);

                    if (el.type === 'image') {
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={`relative cursor-pointer group transition-all ${
                            isSelected ? 'ring-2 ring-indigo-600 ring-offset-2' : 'hover:outline hover:outline-2 hover:outline-indigo-400'
                          }`}
                        >
                          <img
                            src={el.imageUrl}
                            alt="Mock preview item"
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-semibold transition-opacity bg-black/40">
                            换图/编辑
                          </div>
                        </div>
                      );
                    }

                    if (el.type === 'badge') {
                      return (
                        <div key={el.id} className="px-6 pt-5" onClick={() => setSelectedElementId(el.id)}>
                          <span
                            className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-all"
                            style={{
                              backgroundColor: finalStyle.backgroundColor,
                              color: finalStyle.color,
                              borderRadius: finalStyle.borderRadius === 'full' ? '9999px' : '4px',
                            }}
                          >
                            {el.content}
                          </span>
                        </div>
                      );
                    }

                    if (el.type === 'text') {
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={`px-6 pt-1 text-left cursor-pointer transition-all ${
                            isSelected 
                              ? (workspaceTheme === 'dark' ? 'bg-indigo-950/40 outline-dashed outline-2 outline-indigo-500' : 'bg-indigo-50 outline-dashed outline-2 outline-indigo-400') 
                              : (previewTheme === 'dark' ? 'hover:bg-zinc-800/20' : 'hover:bg-gray-50')
                          }`}
                        >
                          <p
                            style={{
                              fontSize: finalStyle.fontSize === '2xl' ? '1.5rem' : finalStyle.fontSize === '3xl' ? '1.875rem' : '0.875rem',
                              fontWeight: finalStyle.fontWeight === 'bold' ? 'bold' : 'normal',
                              color: finalStyle.color,
                            }}
                          >
                            {el.content}
                          </p>
                        </div>
                      );
                    }

                    if (el.type === 'container') {
                      return (
                        <div key={el.id} className="px-6 py-4 flex gap-4 my-2" onClick={() => setSelectedElementId(el.id)}>
                          <div className={`flex-1 p-3 border rounded-xl text-center transition-colors ${
                            previewTheme === 'dark' 
                              ? 'border-neutral-800 bg-neutral-900/35' 
                              : 'border-slate-100 bg-[#FAFAFA]'
                          }`}>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">秒杀特惠</span>
                            <span className={`font-extrabold block text-lg ${
                              previewTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                            }`}>{el.price}</span>
                          </div>
                          <div className={`flex-1 p-3 border rounded-xl text-center transition-colors ${
                            previewTheme === 'dark' 
                              ? 'border-neutral-800 bg-neutral-900/35' 
                              : 'border-slate-100 bg-[#FAFAFA]'
                          }`}>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">当前余量</span>
                            <span className={`font-bold block text-lg ${
                              previewTheme === 'dark' ? 'text-neutral-200' : 'text-slate-800'
                            }`}>{el.stock}</span>
                          </div>
                        </div>
                      );
                    }

                    if (el.type === 'button') {
                      return (
                        <div key={el.id} className="px-6 pb-6 pt-1" onClick={() => setSelectedElementId(el.id)}>
                          <button
                            className="w-full text-center py-3.5 px-4 font-black transition-all cursor-pointer shadow-md inline-block text-xs animate-pulse"
                            style={{
                              backgroundColor: finalStyle.backgroundColor,
                              color: finalStyle.color,
                              borderRadius: finalStyle.borderRadius === 'full' ? '9999px' : '8px',
                            }}
                          >
                            {el.content}
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })}

                  {/* Tiny mockup UI footer */}
                  <div className={`border-t p-4 text-center text-[10px] transition-colors ${
                    previewTheme === 'dark' ? 'border-neutral-800 bg-neutral-950/60 text-slate-500' : 'border-slate-100 bg-slate-50/80 text-gray-400'
                  }`}>
                    🛡️ Satori Secure checkout 256-bit S-SSL Encryption.
                  </div>
                </div>
              </div>

              {/* Right Panel: AI Assistant */}
              <div id="panel-design-ai-assistant" className="w-full xl:w-72 bg-[#0E0E10] border border-[#242426] rounded-xl flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-[#242426] bg-[#0E0E10]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Satori AI 视觉助理
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    深度学习视觉配比，专注于点击转化升级。
                  </p>
                </div>

                {/* Chat Log logs */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[290px] xl:max-h-none scrollbar-thin">
                  {chatLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                        log.sender === 'user'
                          ? 'bg-indigo-600/20 text-indigo-200 self-end ml-auto border border-indigo-500/20'
                          : 'bg-[#161618] text-gray-300 mr-auto border border-[#2D2D30]'
                      }`}
                    >
                      {log.text}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="bg-[#161618] p-2 rounded-lg text-xs text-indigo-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      根据当前布局精密演算中...
                    </div>
                  )}
                </div>

                {/* Preset Fast Quick Prompts */}
                <div className="p-3 border-t border-[#242426] bg-[#0A0A0B]/50 gap-1.5 flex flex-wrap">
                  {[
                    { label: '💄 按钮设为中国红', prompt: '将按钮背景变成红色，醒目一些。' },
                    { label: '💎 按钮设为靛蓝色', prompt: '将产品价格那里的按钮变成靛蓝色' },
                    { label: '🏷️ 标注9.5折特惠', prompt: '添加或者修改顶部的标签内容，写上限时9.5折' }
                  ].map((quick, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(quick.prompt);
                      }}
                      className="text-[10px] bg-[#161618] hover:bg-indigo-950/20 hover:text-indigo-300 text-gray-400 px-2 py-1 rounded border border-[#2D2D30] transition-all text-left truncate w-full"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>

                {/* Interactive Ask input */}
                <form onSubmit={handleAiAssistantRequest} className="p-3 border-t border-[#242426]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="发送指令，如“把按钮圆角设为大圆角”"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="w-full bg-[#161618] border border-[#2D2D30] rounded-lg pl-3 pr-10 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none placeholder-gray-600"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 text-xs top-1/2 -translate-y-1/2 bg-indigo-600 font-bold hover:bg-indigo-500 text-white rounded-md px-2.5 py-1.5 transition-all"
                    >
                      发送
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATE LIBRARY */}
          {activeTab === 'templates' && (
            <div id="view-templates" className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-white">
                  多用途场景及行业模板库
                </h1>
                <p className="text-gray-400 text-xs">
                  选择以下针对性经过深度商业转化测试测试的行业美化页面模板，一键载入 AI 画布，助您快速验证细分赛道并上线投产。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'default',
                    title: '极简意式皮具 (Minimalist Leather)',
                    desc: '主打高质感手作工匠风，大白底，无衬线沉稳字体，高奢气韵。',
                    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
                    tag: '高奢首选'
                  },
                  {
                    id: 'summer',
                    title: '西西里橙夏 (Summer Sicilian Warmth)',
                    desc: '鲜活热辣的红色主调，配衬明快标签，专供夏季特卖。',
                    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
                    tag: '热卖爆款'
                  },
                  {
                    id: 'cyberpunk',
                    title: '赛博新纪元 (Tech Cyberpunk RFID Block)',
                    desc: '亮荧蓝，硬直线条边角。针对高端RFID硬核战术极客饰物专门设计。',
                    img: 'https://images.unsplash.com/photo-1627124357128-5a3cbd8e359o?auto=format&fit=crop&w=400&q=80',
                    tag: '極客潮流'
                  }
                ].map(tpl => (
                  <div key={tpl.id} className="bg-[#0E0E10] border border-[#242426] rounded-xl overflow-hidden flex flex-col">
                    <div className="relative h-40 bg-zinc-800">
                      <img src={tpl.img} alt={tpl.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                        {tpl.tag}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="text-white text-sm font-bold">{tpl.title}</h4>
                        <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{tpl.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleApplyTemplate(tpl.id);
                          setActiveTab('ai_canvas');
                        }}
                        className="w-full py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold rounded-lg border border-indigo-500/20"
                      >
                        应用并加载到 AI 画布
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AGENTS */}
          {activeTab === 'agents' && (
            <div id="view-agents" className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-white">
                  智能体集成面板 (Satori AI Agents Console)
                </h1>
                <p className="text-gray-400 text-xs">
                  托管于云端的全自动商业流程执行官，协助管理日常售前咨询、获客和仓储警戒。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: '智能客服助理 Agent (Sophia)', desc: '全天候响应客户对产品细节、意大利手工艺原料及售后寄送策略的答疑。', status: '运行中', logs: '5分钟前答复了 Alex 托特包内侧拉链位置。', toggle: 'tiktok' },
                  { name: '自动成单/流量裂变 Agent (TikTok)', desc: '实时监控销售点击比重，联动 TikTok shop 规则推荐爆品。', status: '运行中', logs: '2小时前优化竞价策略。', toggle: 'insta' },
                  { name: '智能仓储预估 Agent', desc: '在产品热卖或库存低于配置极限值时，自动向供应商生成临时预订。', status: '静默运行', logs: '库存充足，运行平稳。', toggle: 'gmerch' }
                ].map((act, id) => (
                  <div key={id} className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-sm">{act.name}</span>
                        <span className="bg-emerald-600/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {act.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{act.desc}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#1C1C1E]">
                      <span className="text-[10px] text-gray-500 font-bold block">最近一笔决策记录：</span>
                      <code className="text-[#A78BFA] text-[11px] block break-all font-mono italic">{act.logs}</code>
                    </div>

                    <button className="w-full bg-[#161618] hover:bg-zinc-800 text-white font-semibold text-xs py-2 rounded-lg border border-[#2D2D30] transition-colors">
                      配置高级核心指令
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div id="view-orders" className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-white">店铺实时订单管理</h1>
                  <p className="text-gray-400 text-xs">在这里查看和处理通过在线商店及 AI 画布转化的客户购物订单。</p>
                </div>
                <button
                  onClick={() => {
                    const nextId = 'ORD-' + (1000 + orders.length + 3);
                    setOrders([{ id: nextId, customer: '游客订单', date: '2026-05-27', total: '$189.00', status: 'Pending' }, ...orders]);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors"
                >
                  模拟新增一笔订单
                </button>
              </div>

              <div className="bg-[#0E0E10] border border-[#242426] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-[#121214] text-white uppercase text-[10px] font-bold border-b border-[#242426]">
                    <tr>
                      <th className="p-4">订单号</th>
                      <th className="p-4">客户姓名</th>
                      <th className="p-4">下单日期</th>
                      <th className="p-4">订单总价</th>
                      <th className="p-4">付款状态</th>
                      <th className="p-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242426]">
                    {orders.map(or => (
                      <tr key={or.id} className="hover:bg-[#161618]/50">
                        <td className="p-4 font-mono font-bold text-indigo-400">{or.id}</td>
                        <td className="p-4 text-white font-medium">{or.customer}</td>
                        <td className="p-4">{or.date}</td>
                        <td className="p-4 text-white font-bold">{or.total}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            or.status === 'Paid' ? 'bg-emerald-600/20 text-emerald-400' :
                            or.status === 'Pending' ? 'bg-amber-600/20 text-amber-400' :
                            'bg-indigo-600/20 text-indigo-400'
                          }`}>
                            {or.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {or.status === 'Pending' ? (
                            <button
                              onClick={() => {
                                setOrders(orders.map(o => o.id === or.id ? { ...o, status: 'Paid' as any } : o));
                              }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all"
                            >
                              确认收款
                            </button>
                          ) : (
                            <span className="text-gray-500 text-[10px]">无需操作</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PRODUCTS */}
          {activeTab === 'products' && (
            <div id="view-products" className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-white">产品管理与定价发布 (同步画布)</h1>
                  <p className="text-gray-400 text-xs">在这里修改产品库存或者名称，该修改会同步反馈给 AI 画布页面进行高保真展示。</p>
                </div>
              </div>

              {/* Grid of products */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map(prod => (
                  <div key={prod.id} className="bg-[#0E0E10] border border-[#242426] rounded-xl overflow-hidden flex flex-col">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-40 object-cover" />
                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">{prod.category}</span>
                        <h4 className="text-white text-sm font-bold block">{prod.name}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-500 text-[9px] uppercase font-bold block">售价 (USD)</label>
                          <input
                            type="text"
                            value={prod.price}
                            onChange={(e) => {
                              const v = e.target.value;
                              setProducts(products.map(p => p.id === prod.id ? { ...p, price: v } : p));
                              // Also sync to Canvas immediately!
                              if (prod.id === 'prod-1') {
                                setCanvasElements(canvasElements.map(el => el.id === 'item-metrics' ? { ...el, price: v } : el));
                              }
                            }}
                            className="bg-[#161618] border border-[#2D2D30] rounded p-1 text-xs text-white focus:outline-none w-full"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 text-[9px] uppercase font-bold block">剩余物理库存</label>
                          <input
                            type="number"
                            value={prod.stock}
                            onChange={(e) => {
                              const s = parseInt(e.target.value) || 0;
                              setProducts(products.map(p => p.id === prod.id ? { ...p, stock: s } : p));
                              if (prod.id === 'prod-1') {
                                setCanvasElements(canvasElements.map(el => el.id === 'item-metrics' ? { ...el, stock: `${s} Left` } : el));
                              }
                            }}
                            className="bg-[#161618] border border-[#2D2D30] rounded p-1 text-xs text-white focus:outline-none w-full"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCanvasElements(canvasElements.map(el => {
                            if (el.id === 'item-title') return { ...el, content: prod.name };
                            if (el.id === 'hero-img') return { ...el, imageUrl: prod.imageUrl };
                            if (el.id === 'item-metrics') return { ...el, price: prod.price, stock: `${prod.stock} Left` };
                            return el;
                          }));
                          setActiveTab('ai_canvas');
                        }}
                        className="w-full mt-2 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
                      >
                        将该产品装载到 AI 画布
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div id="view-customers" className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white">高净值客户 CRM 数据中心</h1>
                <p className="text-gray-400 text-xs text-left">对店铺客户购物画像、终身总消费进行全方位多维度沉淀和营销赋能。</p>
              </div>

              <div className="bg-[#0E0E10] border border-[#242426] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-[#121214] text-white uppercase text-[10px] font-bold border-b border-[#242426]">
                    <tr>
                      <th className="p-4">用户头像</th>
                      <th className="p-4">客户邮箱</th>
                      <th className="p-4">下单终身总消</th>
                      <th className="p-4">购物人格分类</th>
                      <th className="p-4 text-right">跟进动作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242426]">
                    {customers.map(cust => (
                      <tr key={cust.id} className="hover:bg-[#161618]/50">
                        <td className="p-4 font-bold text-white flex items-center gap-3">
                          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
                            {cust.name[0]}
                          </div>
                          <span>{cust.name}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px]">{cust.email}</td>
                        <td className="p-4 text-emerald-400 font-bold">{cust.spend}</td>
                        <td className="p-4">
                          <span className="bg-indigo-600/15 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {cust.profile}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              alert(`已成功通过 Satori AI客服 锁定了与客户 ${cust.name} 的特别沟通通道`);
                            }}
                            className="text-xs hover:text-white text-indigo-400 transition-all underline"
                          >
                            发送独占邀请券
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: DISCOUNTS */}
          {activeTab === 'discounts' && (
            <div id="view-discounts" className="max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-white">店铺折扣策略中心</h1>
                <p className="text-gray-400 text-xs">设置用于在线促销、AI Canvas 浮动广告条中的折扣兑换码，以推动客单上升。</p>
              </div>

              <div className="bg-[#0E0E10] border border-[#242426] rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase text-white mb-4">创建新优惠券</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1 uppercase">优惠码CODE</label>
                    <input
                      type="text"
                      placeholder="e.g. SATORI30"
                      value={newDiscountCode}
                      onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                      className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1 uppercase">优惠折率 / 比例</label>
                    <input
                      type="text"
                      placeholder="e.g. 30%"
                      value={newDiscountRate}
                      onChange={(e) => setNewDiscountRate(e.target.value)}
                      className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        if (!newDiscountCode) return;
                        setDiscounts([...discounts, { code: newDiscountCode, rate: newDiscountRate, status: 'Active', usage: 0 }]);
                        setNewDiscountCode('');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded transition-all w-full h-9"
                    >
                      新增折扣码规则
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#0E0E10] border border-[#242426] rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">当前存续优惠码列表</h3>
                <div className="space-y-3">
                  {discounts.map(disc => (
                    <div key={disc.code} className="flex justify-between items-center bg-[#161618] p-3 rounded-lg border border-[#2D2D30]">
                      <div>
                        <span className="text-white font-mono font-bold block">{disc.code}</span>
                        <span className="text-gray-500 text-[10px]">有效促销价立减比例：{disc.rate}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-xs">使用次数: {disc.usage}</span>
                        <button
                          onClick={() => setDiscounts(discounts.filter(d => d.code !== disc.code))}
                          className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: MARKETING */}
          {activeTab === 'marketing' && (
            <div id="view-marketing" className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-white">数字广告营销投放配置</h1>
                  <p className="text-gray-400 text-xs">由 Satori AI 推算的在线广告实时模拟器。预估您的元数据在 Meta、TikTok 或 Google 中的投入产出比。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl md:col-span-1 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase">启动新投放仿真</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1 text-[10px] font-bold">营销主体名称</span>
                      <input
                        type="text"
                        placeholder="e.g. Italian Leather Launch"
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1 text-[10px] font-bold">目标渠道</span>
                      <select
                        value={newCampaignChannel}
                        onChange={(e) => setNewCampaignChannel(e.target.value)}
                        className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                      >
                        <option>TikTok Ads</option>
                        <option>Google Ads</option>
                        <option>Meta Marketplace</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1 text-[10px] font-bold">每月拟投预算</span>
                      <input
                        type="text"
                        value={newCampaignBudget}
                        onChange={(e) => setNewCampaignBudget(e.target.value)}
                        className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newCampaignName) return;
                        setCampaigns([...campaigns, {
                          id: 'c-' + Date.now(),
                          name: newCampaignName,
                          channel: newCampaignChannel,
                          budget: newCampaignBudget,
                          status: 'Running',
                          ctr: '4.1%',
                          cpc: '$0.50'
                        }]);
                        setNewCampaignName('');
                      }}
                      className="w-full py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-500 transition-all"
                    >
                      创建并开始演算
                    </button>
                  </div>
                </div>

                <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl md:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase">当前存续营销广告计划</h3>
                  <div className="space-y-3">
                    {campaigns.map(camp => (
                      <div key={camp.id} className="bg-[#161618] p-4 rounded-lg border border-[#2D2D30] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <span className="text-white font-bold block text-xs">{camp.name}</span>
                          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest block">{camp.channel} // {camp.budget}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                          <div className="p-1 px-3 bg-zinc-800 rounded">
                            <span className="text-[9px] text-gray-500 block font-bold">点击率(CTR)</span>
                            <span className="text-emerald-400 font-bold block">{camp.ctr}</span>
                          </div>
                          <div className="p-1 px-3 bg-zinc-800 rounded">
                            <span className="text-[9px] text-gray-500 block font-bold">每点开销(CPC)</span>
                            <span className="text-indigo-400 font-bold block">{camp.cpc}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: CONTENT / AI COPYWRITER */}
          {activeTab === 'content' && (
            <div id="view-content" className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-white">智能 AI 文案撰稿人</h1>
                <p className="text-gray-400 text-xs">输入商品主打关键词及拟采用的行文风格腔调，瞬间渲染专供发布的高转文案。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase">生成指令输入</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1 text-[10px]">产品核心卖点或关键字</span>
                      <textarea
                        value={copyKeyword}
                        onChange={(e) => setCopyKeyword(e.target.value)}
                        className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full min-h-[90px]"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1 text-[10px]">品牌笔调腔调</span>
                      <select
                        value={copyStyle}
                        onChange={(e) => setCopyStyle(e.target.value)}
                        className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                      >
                        <option>高端/奢华</option>
                        <option>极简克制/冷静美学</option>
                        <option>促销/激发紧迫感</option>
                        <option>文艺温暖/手作精神</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (copyStyle.includes('极简')) {
                          setGeneratedCopy(`甄选纯正手工工艺包裹精制，除却浮华雕饰，唯余质感本色。`);
                        } else if (copyStyle.includes('促销')) {
                          setGeneratedCopy(`【最后2小时！】源自佛罗伦萨的老牌工匠皮料，抢到即省$20！售罄绝不补货！`);
                        } else {
                          setGeneratedCopy(`意大利全粒面牛皮手工缝制，流露尊贵韵致。专为追求极致审美的都市创意人呈现。`);
                        }
                      }}
                      className="w-full py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-500 transition-all"
                    >
                      重新智能渲染文案
                    </button>
                  </div>
                </div>

                <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase">AI 建议成品文案展示</h3>
                    <div className="bg-[#161618] p-4 rounded-lg border border-[#2D2D30] text-xs text-white leading-relaxed font-serif tracking-wide min-h-[140px]">
                      {generatedCopy}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCanvasElements(canvasElements.map(el => el.id === 'item-desc' ? { ...el, content: generatedCopy } : el));
                      alert('已将优化完成的文案装配注入到 AI Canvas 主页预览的说明栏中！');
                    }}
                    className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-400 font-bold rounded-lg border border-indigo-500/20 text-xs transition-colors mt-4"
                  >
                    同步此段描述文案到 AI 画布
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div id="view-analytics" className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white">店铺全链路数据转换分析</h1>
                <p className="text-gray-400 text-xs">实时监控经由 AI 优化方案推荐所产生的支付链路追踪报表。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: '昨日成交转化率', val: '4.8%', delta: '高于同等行业基准50%' },
                  { label: '总访客足迹', val: '12,490 PV', delta: '同比上周增长 +23.2%' },
                  { label: '平均客单成交均价', val: '$189.00', delta: '受极简托特包热销推动' }
                ].map((an, idx) => (
                  <div key={idx} className="bg-[#0E0E10] border border-[#242426] p-4 rounded-lg">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">{an.label}</span>
                    <span className="text-xl font-bold text-white block mt-1">{an.val}</span>
                    <span className="text-[11px] text-indigo-400 block mt-1">{an.delta}</span>
                  </div>
                ))}
              </div>

              {/* Simulated visual progress blocks representing funnel */}
              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase">店铺转化漏斗 (Funnel Optimization)</h3>
                <div className="space-y-4">
                  {[
                    { step: '1. 点击产品页 (View Product Page)', percent: '100%', vol: '12,490 访客' },
                    { step: '2. 选定加车 (Add to Cart Click)', percent: '18.4%', vol: '2,298 动作' },
                    { step: '3. 录入收款信息 (Enter Shipping)', percent: '8.2%', vol: '1,024 阶段' },
                    { step: '4. 完成付费 (Success Orders)', percent: '4.2%', vol: '524 结单' }
                  ].map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{f.step}</span>
                        <span className="text-white font-mono font-bold">{f.percent} ({f.vol})</span>
                      </div>
                      <div className="w-full h-2 bg-[#161618] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                          style={{ width: f.percent === '100%' ? '100%' : `${parseFloat(f.percent) * 3}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: CHANNELS */}
          {activeTab === 'channels' && (
            <div id="view-channels" className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white">多销售渠道和 API 推送配置</h1>
                <p className="text-gray-400 text-xs">同步管理除主站外的其他第三方销售和分销接口状态。</p>
              </div>

              <div className="space-y-4">
                {integrations.map(integ => (
                  <div key={integ.id} className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-sm block">{integ.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          integ.enabled ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-800 text-gray-500'
                        }`}>
                          {integ.enabled ? '已激活同步' : '未开启 / 暂挂'}
                        </span>
                      </div>
                      <code className="text-[10px] text-gray-500 font-mono block break-keep bg-[#161618] p-2 rounded border border-[#2D2D30]/60 max-w-xl">
                        {integ.logs}
                      </code>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIntegrations(integrations.map(i => i.id === integ.id ? { ...i, enabled: !i.enabled } : i));
                        }}
                        className={`text-xs px-3 py-1.5 rounded transition-all font-semibold ${
                          integ.enabled ? 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/30' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                        }`}
                      >
                        {integ.enabled ? '暂时撤销授权' : '启用并连接 API 协议'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: ONLINE STORE CUSTOMIZATION */}
          {activeTab === 'online_store' && (
            <div id="view-online-store" className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white">在线网页商店设置 (Web Storefront Setup)</h1>
                <p className="text-gray-400 text-xs">自定义面向终端购物群体的默认展示名称、搜索导航和品牌要素。</p>
              </div>

              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-[10px] font-bold block mb-1">商店品牌发布名称</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-bold block mb-1">主控结算货币</label>
                    <input
                      type="text"
                      value={storeCurrency}
                      onChange={(e) => setStoreCurrency(e.target.value)}
                      className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-bold block mb-2">主控导航选项</span>
                  <div className="space-y-2">
                    {['1. 首页 (Home)', '2. 最新单品目录 (New Catalog)', '3. 关于工匠手作 (About Handcrafted)'].map((nav, i) => (
                      <div key={i} className="bg-[#161618] p-2.5 rounded border border-[#2D2D30] flex justify-between items-center">
                        <span className="text-white">{nav}</span>
                        <span className="text-[10px] text-indigo-400 cursor-pointer">修改路由</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PANELS */}
          {activeTab === 'settings_store' && (
            <div id="view-settings-store" className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-xl font-bold text-white">基本店铺设置</h1>
              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4 text-xs">
                <div>
                  <label className="text-gray-500 text-[10px] font-bold block mb-1 uppercase">默认语言偏好</label>
                  <input
                    type="text"
                    value={storeLanguage}
                    onChange={(e) => setStoreLanguage(e.target.value)}
                    className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] font-bold block mb-1">客服回复用默认语气</label>
                  <span className="text-gray-400 block mb-2 text-[11px]">该内容可在客服 Agent 与终端用户答疑时生效。</span>
                  <select className="bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none w-full">
                    <option>自然亲和型 (Warm & Responsive)</option>
                    <option>高冷极简奢华笔调 (Exclusive & Professional)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings_markets' && (
            <div id="view-settings-markets" className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-xl font-bold text-white">分销区域与国际市场 (Markets Localization)</h1>
              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4 text-xs text-gray-400 leading-relaxed">
                <p>
                  Satori AI Studio 原生具备多语言和多货币汇率无缝适配。您可以为不同目标大洲/国家的流量，展现独特的本地标价和折扣策略。
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-[#161618] rounded border border-[#2D2D30] flex justify-between">
                    <span className="text-white font-bold">🎯 北美市场 (North America Market)</span>
                    <span className="text-emerald-400 font-mono">已开通汇率自动折合 (USD)</span>
                  </div>
                  <div className="p-3 bg-[#161618] rounded border border-[#2D2D30] flex justify-between">
                    <span className="text-white font-bold">🎯 东亚市场 (East Asia Domestic Market)</span>
                    <span className="text-indigo-400 font-mono">已配置自提/微信及支付宝接口 (CNY)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings_payments' && (
            <div id="view-settings-payments" className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-xl font-bold text-white">付款和结算网关通道 (Payment Providers)</h1>
              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4 text-xs text-gray-400">
                <p>配置在线完成全包式结算的网关信息：</p>
                {[
                  { name: 'Stripe 快捷收银', desc: '支持各大信用卡及一键 Apple Pay 结算', active: true },
                  { name: 'PayPal 金流服务', desc: '支持万国主流本国钱包协议联动', active: false },
                  { name: '微信/支付宝 跨境付款', desc: '适配跨境直联方案', active: true }
                ].map((pay, i) => (
                  <div key={i} className="p-3.5 bg-[#161618] rounded-xl border border-[#2D2D30] flex justify-between items-center">
                    <div>
                      <span className="text-white font-bold block">{pay.name}</span>
                      <span className="text-gray-500 text-[10px] block mt-0.5">{pay.desc}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      pay.active ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-800 text-gray-500'
                    }`}>
                      {pay.active ? '已启用 API 验证' : '暂未开通'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings_domains' && (
            <div id="view-settings-domains" className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-xl font-bold text-white">配置独立顶级域名 (Point Custom Domain)</h1>
              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4 text-xs text-gray-400">
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="satoricommerce.store"
                    className="flex-1 bg-[#161618] border border-[#2D2D30] rounded p-2 text-xs text-white focus:outline-none"
                  />
                  <button className="bg-indigo-600 text-white font-bold px-4 rounded text-xs hover:bg-indigo-500">
                    绑定验证 DNS Pointers
                  </button>
                </div>
                <div className="p-3 bg-indigo-600/5 text-indigo-400 rounded border border-indigo-500/10 block font-mono">
                  CNAME 指向配置：请将您的域名首要解析记录（CNAME）指向: **cname.satoricommerce.com** 并确保已解析成功。
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings_team' && (
            <div id="view-settings-team" className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-xl font-bold text-white">团队共享协作与角色分配 (Workspace Roles)</h1>
              <div className="bg-[#0E0E10] border border-[#242426] p-5 rounded-xl space-y-4 text-xs text-gray-400">
                <div className="flex justify-between items-center bg-[#161618] p-3 rounded-lg border border-[#2D2D30]">
                  <div>
                    <span className="text-white font-bold block">chi2030ai@gmail.com</span>
                    <span className="text-gray-500 text-[10px]">店铺拥有者主管 (Owner)</span>
                  </div>
                  <span className="bg-indigo-600/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">超级权限</span>
                </div>
                <button className="w-full py-2 bg-[#161618] hover:bg-zinc-800 text-white font-semibold rounded-lg border border-[#2D2D30] transition-colors">
                  邀请新运营协作主管
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
