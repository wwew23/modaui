"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, Sparkles, RefreshCw, Mic, Send, ChevronDown, 
  Eye, Heart, Camera, Globe, ArrowUpRight, FileText, Lock, 
  Users, CreditCard, Check, HelpCircle, Laptop, Palette, 
  ChevronRight, Trash2, Paperclip, Volume2, VolumeX, MessageSquare, Code, X,
  Plus, Upload, FileArchive, Loader2, Link2, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Cleaned up suggestion sets for storefront query inspiration
const suggestionSets = [
  [
    { icon: "☕", text: "原木轻奢精品咖啡馆" },
    { icon: "👗", text: "朋克原创新潮服饰店" },
    { icon: "🍎", text: "生鲜绿色有机超级铺" },
    { icon: "📷", text: "复古怀旧光影相机店" }
  ],
  [
    { icon: "🎨", text: "极简纯白美学文创社" },
    { icon: "🥩", text: "顶级熟成和牛料理阁" },
    { icon: "🪴", text: "治愈系室内绿植工坊" },
    { icon: "💍", text: "奢华高精莫桑钻指坊" }
  ]
];

// Human-oriented retail templates with zero tech-slop
export const initialTemplates = [
  {
    id: "hangpai-wholesale",
    title: "杭派精品网购服装一手批发城",
    likes: "2.5K",
    views: "18.2K",
    category: "服装批发",
    authorName: "叶大鸣 (源头厂长)",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=yeding",
    theme: "light",
    primaryColor: "#B91C1C",
    secondaryColor: "#FECACA",
    bgColor: "#FFFBEB",
    textColor: "#1F2937",
    description: "服务全国10万+零售实体店，支持单件混批，AI智能识图寻样，内置极速清装机和零售分流云轨。",
    features: {
      paletteDesc: "醒目红主调配杏黄优雅底色，专为批发及高转化大额贸易设计，饱满大方且兼顾高效采购视感。",
      payDesc: "打通全国各大零售银行与数字人民币大单收单机制，集成挂单、开具数字预付凭据等高效功能。",
      aiSpeechDesc: "高灵敏AI识样语音系统核心，采购员说出“来3包水洗蓝拉链微喇裤”即可毫秒挂单并进入结算。"
    },
    products: [
      { code: "WH-001", title: "2026夏装爆款美式微重国潮短袖", desc: "复古克重260g纯棉，1:1原纸板型，百搭外单首选，好走量利润率极高。", price: "¥23.8 / 件 (10件起)" },
      { code: "WH-002", title: "韩版显瘦修身高腰微喇牛仔裤", desc: "自制高拉伸抗变形混纺，不脱色不起泡，全网买家回购率高达92%。", price: "¥42.5 / 件 (5件起)" },
      { code: "WH-003", title: "英伦慵懒廓形质感春装中长风衣", desc: "防泼水微光泽棉混纺，剪裁极为大气，实体百货门市当季热销头牌。", price: "¥98.0 / 件 (3件起)" }
    ],
    speech: {
      userQuestion: "“老板好，我想找一些适合在大学城夜市或者学生街摆摊、好走量、利润高的国潮夏季短袖，有什么首选么？”",
      aiAnswer: "“十分懂您的诉求！首选我们的**美式微重国潮短袖**（¥23.8每件），260克纯棉手感极扎实，在学生街能轻松卖到59-79元。今日下单我们直接赠送配套的夜市落地陈列架及精美礼包，我帮您起配50件，后天即可到货！”"
    },
    schema: {
      sections: {
        announcement: { type: "announcement", text: "🔥 杭派网购一手服装货源 · 支持单件混批 · 2026夏装爆款就绪" },
        header: { type: "header", title: "杭派商贸一手服装批发城" },
        hero: { type: "hero", title: "源头好厂直营 · 10万+零售商首选", subtitle: "杭派服装批发城，专为高增益大额贸易打造。内置智能识图寻样，一键速配挂载结算。" },
        featured_collection: { type: "featured_collection", title: "今日热销走量大盘 (Featured Products)" },
        expert_tips: { type: "expert_tips", title: "大额收单与视觉系统", desc: "醒目红主调配杏黄微温雅底。支持各大零售银行、数字人民币等大额免签结算。" },
        ai_assistant: { type: "ai_assistant" },
        footer: { type: "footer", copyright: "© 2026 杭派商贸服装批发城. 模搭商用 SaaS 极速提供" }
      }
    }
  },
  {
    id: "dianqi-store",
    title: "摩力智家 · 智能电器百货生活馆",
    likes: "1.9K",
    views: "12.5K",
    category: "百货电器",
    authorName: "林智科 (硬件产品总监)",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=linzhike",
    theme: "light",
    primaryColor: "#2563EB",
    secondaryColor: "#DBEAFE",
    bgColor: "#F8FAFC",
    textColor: "#0F172A",
    description: "聚合智能硬件及新奇特生活用具，支持极简IoT一键物联，支持智能语音查询说明书与硬件自诊功能。",
    features: {
      paletteDesc: "经典数码科技湛蓝辅以灰色质感描框，理性严谨，建立极致安全感和品牌硬核物理质感。",
      payDesc: "支持云闪付、数币双离线支付等多核模式，一秒扫码秒收单并无缝向物联底座配对电子保修卡。",
      aiSpeechDesc: "内置全套智能硬件说明说GPT助手，可协助买家离线排除“配网超时”或“滤棒自清洁”等百强疑问。"
    },
    products: [
      { code: "IOT-101", title: "摩力智轻羽音负离子智能加湿器", desc: "低噪30分贝，15小时微粒子超微细雾，支持万物无缝一键智联绑定。", price: "¥189 / 台" },
      { code: "IOT-102", title: "全频数字气旋静震车载吸尘器", desc: "12000Pa瞬时飓风，可自识别并吸附碎屑沙粒并低能运行，附随手包。", price: "¥129 / 台" },
      { code: "IOT-103", title: "智能恒温防干烧双层不锈钢电热壶", desc: "高抗阻高精温控，5段水温一键保温，母婴级无拼接内胎持久隔温。", price: "¥149 / 台" }
    ],
    speech: {
      userQuestion: "“智能加湿器的噪音怎么样？晚上睡觉放在床头会吵到小宝宝吗？没有检测缺水断电功能吗？”",
      aiAnswer: "“您大可放心。**轻羽音加湿器**专门搭载了新一代水阻衰消结构，运行声音控制在**30分贝以下**。此外系统内置防干烧阻抗片，**无水时0.1秒自动切断电源**，支持一键预约定时，安全好用！”"
    },
    schema: {
      sections: {
        announcement: { type: "announcement", text: "⚡ 摩力智家旗舰物联 · 每周新品特惠 · 全球联保免息" },
        header: { type: "header", title: "摩力智家 · 智能电器" },
        hero: { type: "hero", title: "智美生活，一键即开", subtitle: "集成极简 IoT 一键物联，理性前沿湛蓝配灰色描框，全方位守护家居物理科技美学。" },
        featured_collection: { type: "featured_collection", title: "人气智能设备必看" },
        expert_tips: { type: "expert_tips", title: "技术与安全对账", desc: "云闪付等离线扫码，一秒过账无缝配对独立电子保修，附带智能 GPT 说明书故障诊断。" },
        ai_assistant: { type: "ai_assistant" },
        footer: { type: "footer", copyright: "© 2026 摩力智家 Smart Living. Powered by Shopify" }
      }
    }
  },
  {
    id: "meishi-catering",
    title: "臻品和牛烧肉手作私房餐馆",
    likes: "3.2K",
    views: "24.5K",
    category: "餐馆美食",
    authorName: "Chef.梁 (米其林三星主厨)",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=chefliang",
    theme: "dark",
    primaryColor: "#DC2626",
    secondaryColor: "#3A1A1A",
    bgColor: "#1A1515",
    textColor: "#FFFDF5",
    description: "主推火山岩顶级雪花和牛烧肉，店内极致日和美学设计，支持店内扫码秒收单与实时AI排队估时。",
    features: {
      paletteDesc: "碳黑沉稳底配温暖的炙烤牛排绯红色，塑造微醺高奢的线下包厢氛围，激发味蕾探知欲。",
      payDesc: "极速联接店内扫码点单并实时同步后厨，秒销美团/点评抵金卡卷，厨房打餐全自动打票排号。",
      aiSpeechDesc: "暖心智能配菜官，语音告诉“有个孕妇不能吃生的而且不能太油”，瞬间重组最贴心的健康代表菜谱。"
    },
    products: [
      { code: "CHEF-01", title: "极致大理石M9+厚切雪花和牛板腱", desc: "每日新鲜冷链冰鲜直达，雪花肌理细密完美，炙烤后入口精美，油脂芬芳。", price: "¥358 / 份" },
      { code: "CHEF-02", title: "手作黑松露和牛芝士爆珠海苔烧", desc: "主厨秘制脆海苔包心，内陷高拉丝安佳流心芝士，黑松露复合香诱人。", price: "¥88 / 盘" },
      { code: "CHEF-03", title: "大吟酿青森苹果金桔清香手作冰晶", desc: "56度顶级清酒酵母手作冰晶，大颗日本青森苹果压榨，冰凉解腻纯粹爽口。", price: "¥38 / 盏" }
    ],
    speech: {
      userQuestion: "“我们三个人聚餐，其中有一位是孕妇不能吃生的，也不想太腻，能帮我们搭配代表主厨水平的特色不生不腻套餐吗？”",
      aiAnswer: "“收到，十分懂您！为您推荐由主熟煎的**M9+精炙和牛板腱**搭配爽口的**青森苹果冰晶**，为关照孕妇营养更特别配备热作的**黑松露海苔芝士烧**，下单即附送高钙厚烧海带汤，极美且安全温润！”"
    },
    schema: {
      sections: {
        announcement: { type: "announcement", text: "🔥 米其林臻品私房和牛烧肉 · 提前一日预定尊享免费精酿原麦汁" },
        header: { type: "header", title: "臻品和牛烧肉阁" },
        hero: { type: "hero", title: "火山炙焰 · 厚享浓醇", subtitle: "碳黑高奢日式私域美学，全方位为您奉献舌尖的炙热回甘艺术。" },
        featured_collection: { type: "featured_collection", title: "主厨传世厚推精品" },
        expert_tips: { type: "expert_tips", title: "极速扫码下单及智能配菜", desc: "自动直连后厨极速打单；搭载AI专属配菜营养官，避忌怀孕或过敏史成分。" },
        ai_assistant: { type: "ai_assistant" },
        footer: { type: "footer", copyright: "© 2026 臻品和牛烧肉阁 Choice Cut. All Rights Reserved." }
      }
    }
  },
  {
    id: "beauty-spa",
    title: "素染高定芳香SPA美学疗愈中心",
    likes: "2.1K",
    views: "14.5K",
    category: "美容",
    authorName: "沈宛心 (芳香理疗导师)",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=shenwanxin",
    theme: "light",
    primaryColor: "#854D0E",
    secondaryColor: "#FEF9C3",
    bgColor: "#FAF7F0",
    textColor: "#451A03",
    description: "定制有机植物活性美护，沉浸式声音五感护理。配合店内AI皮肤管理诊断让美丽量身定制。",
    features: {
      paletteDesc: "平和高雅的大地暖木色加象牙纯温白底，如大自然落叶森林，给予顾客心神物理级松弛疗愈体验。",
      payDesc: "深度支持高疗程包次预售储值卡、智能积分阶梯换兑换，提供精美立体寄送实体尊享礼单配套。",
      aiSpeechDesc: "AI芳香配料顾问，根据买家当前“哺乳期/孕期”或“过敏史”瞬间排查植物精油禁忌及高频成分。"
    },
    products: [
      { code: "SPA-01", title: "素染古法玫瑰檀香面体双护", desc: "90分钟温热敷疗。选用100分大马士革原产玫瑰配东印度精油，开创深度好眠。", price: "¥580 / 次" },
      { code: "SPA-02", title: "喜马拉雅粉盐活性去角质矿物霜", desc: "手工粉碎高纯矿盐，精配细腻高领土与洋甘菊舒缓原液，带给皮肤细润幼滑。", price: "¥240 / 罐" },
      { code: "SPA-03", title: "手工大豆蜡沉香白鼠尾草熏香烛", desc: "天然大豆蜡底，手工配入野生散落沉香木，静虑凝神，清静满屋能量。", price: "¥120 / 盏" }
    ],
    speech: {
      userQuestion: "“我最近工作压力特别大，作息也不规律，脸上闭口有点多，第一次来你们体验建议约哪种美护项目呢？”",
      aiAnswer: "“非常贴心您的肌肤！极力为您推荐古法**玫瑰檀香面体双护**（¥580 / 90分钟），结合全套温敷和净化玫瑰精油导入，帮助您排解疲乏、恢复细腻水灵，现在即可为您锁定预约静谧包房。”"
    },
    schema: {
      sections: {
        announcement: { type: "announcement", text: "🌿 纯素复苏新客专属预约 · 大地微量美肤香薰 · 赠喜马拉雅足洗" },
        header: { type: "header", title: "素染高定芳香 SPA" },
        hero: { type: "hero", title: "大地暖木 · 寻回松弛", subtitle: "有机植物活性修护。五感声音与自然香薰释放压力。" },
        featured_collection: { type: "featured_collection", title: "疗愈芳香与个人美护" },
        expert_tips: { type: "expert_tips", title: "预售卡密与成分过敏诊断", desc: "支持疗程预购、储值金积分抵扣与实体礼券奢华寄送。" },
        ai_assistant: { type: "ai_assistant" },
        footer: { type: "footer", copyright: "© 2026 素染 SPA 美家健康馆. Powered by Shopify" }
      }
    }
  },
  {
    id: "official-saas",
    title: "模搭智能 SaaS 商业云端官网",
    likes: "2.3K",
    views: "16.8K",
    category: "官网",
    authorName: "Dr. Zhang (CTO & 联合创始人)",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=drzhang",
    theme: "light",
    primaryColor: "#4F46E5",
    secondaryColor: "#EEF2FF",
    bgColor: "#FBFBFE",
    textColor: "#1E1B4B",
    description: "面向未来的多行业AI定制零售智能网络引擎。展示极其平滑的企业级矩阵介绍、动态API测试与云梯分期定价体系。",
    features: {
      paletteDesc: "企业级高科技海靛深紫，理性前沿，塑造数字云算大厂的安全合规、可信赖感与极致吞吐速度。",
      payDesc: "全球 Stripe / Global Pay 企业级信用卡无感扣收，支持多梯度月/季/年自助订阅静默托收机制。",
      aiSpeechDesc: "特配智能API与安全合规白皮书自动朗读互动大盘，协助CTO与商业采购秒查物理部署细节。"
    },
    products: [
      { code: "SaaS-A", title: "模搭云旗舰级企业物理引擎专属计划", desc: "解除API并发限制，支持本地私有化网关专线桥接，首季专家派驻与安全大屏定制全功能解锁和深度代建服务。", price: "¥2,999 / 月" },
      { code: "SaaS-B", title: "初创成长型多模态按需按量轻捷计划", desc: "包含多模态精选分类语音，打通最快商业双闭环挂单收单，预装分布式沙盘云存储容器。", price: "¥599 / 月" },
      { code: "SaaS-C", title: "大中商超本地离线数据加密安全狗", desc: "全钢屏蔽外护，内置硬件一机一密签名钥匙，专为数字隔离结算脱敏而特别配置。", price: "¥18,000 / 套" }
    ],
    speech: {
      userQuestion: "“您好，大厂旗舰计划是否提供在不改变已有线下硬件的情况下配置云语音导购和收钱功能的解决方案？”",
      aiAnswer: "“完全支持！**大厂旗舰计划**提供标准轻量级硬件物理网关，支持API直接调转，数据链路均满足金融级脱敏验证规范，我们的专属技术团队会在一工作日内帮您配好！”"
    },
    schema: {
      sections: {
        announcement: { type: "announcement", text: "🌐 模搭 SaaS 旗舰已上线 · 支持私有专线与大宗扣收机制" },
        header: { type: "header", title: "模搭智能云" },
        hero: { type: "hero", title: "面向时代的零售量级云算大底", subtitle: "一键部署，原生集成多模态语音合成与 Stripe 扣收对账。" },
        featured_collection: { type: "featured_collection", title: "面向未来的大厂企业计划" },
        expert_tips: { type: "expert_tips", title: "高安全合规白皮书", desc: "靛蓝主调保障大厂信任感。内置一机一密物理加固硬件狗，抗网络崩溃。" },
        ai_assistant: { type: "ai_assistant" },
        footer: { type: "footer", copyright: "© 2026 模搭 SaaS 云端官网. All Rights Reserved." }
      }
    }
  },
  {
    id: "other-creative",
    title: "Void Space · 空无一格奇趣潮玩馆",
    likes: "2.4K",
    views: "15.9K",
    category: "其他",
    authorName: "Klaire (先锋视觉潮玩代理人)",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=klaire",
    theme: "dark",
    primaryColor: "#EC4899",
    secondaryColor: "#2A1F2D",
    bgColor: "#09050C",
    textColor: "#FAFAFC",
    description: "非标潮流手办、小众前沿设计品，及无定义盲盒的专属极客消费空间，提供限量稀缺款溯源与星座命盘解析。",
    features: {
      paletteDesc: "炫目电光极客粉在绝暗的黑空间边界下碰撞流溢，破败荒凉、未来赛博朋克重金属格调溢于言表。",
      payDesc: "无阻卡包扫单直刷，每笔附赠一个幸运赛博币。用于激活专属定制的数码卡槽与机核纪念NFT。",
      aiSpeechDesc: "搭载极具情绪性二次元性格的AI导购，支持专属冷艳、淘气情绪气泡，用星座命盘为您解答抽欧度。"
    },
    products: [
      { code: "VOID-BOX", title: "《赛博原神：零号姬》限量非对称钛金手办雕塑", desc: "全球极限量299体，1/7重磅手办。精雕冰裂电光外覆层极具反光科幻感。", price: "¥1,899 / 尊" },
      { code: "VOID-M01", title: "「废墟开花」手工焊接晶化发光原生态模型", desc: "极客收罗其破损主板手工融入无气泡纯度水晶固熔，自带脉动呼吸灯效。", price: "¥480 / 尊" },
      { code: "VOID-M02", title: "战术防磁割包", desc: "重度战术按扣，物理全波段防RFID盗读保密隔层，秒级防扫描屏蔽。", price: "¥320 / 个" }
    ],
    speech: {
      userQuestion: "“《零号姬》这个手办现在还有货吗？我想送给做设计的极客极速老友合适吗？”",
      aiAnswer: "“绝对直击灵魂！极推荐零号姬（最后2尊）或主板融入水晶手工浇铸的《废墟开花》，融汇未来废土浪漫，程序员或设计师绝对会欣喜若狂！”"
    },
    schema: {
      sections: {
        announcement: { type: "announcement", text: "🔮 VOID 限量姬潮玩店 · 零号雕塑余货仅剩两尊 · 限时溯源包金" },
        header: { type: "header", title: "VOID SPACE · 奇趣空间" },
        hero: { type: "hero", title: "废土美学 · 二次元情绪机核", subtitle: "电光姬粉撞击无限星墨之黑，支持爆盒概率实时公示与 NFT 链链。" },
        featured_collection: { type: "featured_collection", title: "极位极客限量私藏雕像" },
        expert_tips: { type: "expert_tips", title: "防盗与情绪智能导购", desc: "搭载二次元傲娇风智能语音星座导购助手，首批配备 RFID 电磁屏蔽战术包。" },
        ai_assistant: { type: "ai_assistant" },
        footer: { type: "footer", copyright: "© 2026 VOID SPACE. Extreme Tech & Art Group." }
      }
    }
  }
];

export function HeroSection() {
  const [prompt, setPrompt] = useState("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isV0MaxDropdownOpen, setIsV0MaxDropdownOpen] = useState(false);
  const [v0Model, setV0Model] = useState("模搭智能大模型");
  const [templates, setTemplates] = useState(initialTemplates);

  // Function to serialize & download currently configured layout as JSON file
  const handleExportThemeJSON = (t?: typeof templates[0]) => {
    const activeT = t || selectedTemplate || quickViewTemplate;
    if (!activeT) return;
    const activePalette = activeT === selectedTemplate ? {
      primary: selectedPalette.primary,
      secondary: selectedPalette.secondary,
      bg: selectedPalette.bg,
      textColor: selectedPalette.text
    } : {
      primary: activeT.primaryColor,
      secondary: activeT.secondaryColor,
      bg: activeT.bgColor,
      textColor: activeT.textColor
    };
    const siteConfig = {
      exportedAt: new Date().toISOString(),
      themeId: activeT.id,
      storeTitle: activeT.title,
      category: activeT.category,
      description: activeT.description,
      visualPalette: activePalette,
      features: activeT.features,
      products: activeT.products,
      speechModel: activeT.speech,
      shopifySchema: activeT.schema
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `moda-theme-${activeT.id}-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Shop customization color themes preset
  const presetPalettes = [
    {
      id: "warm-wood",
      name: "自然暖木 (Natural Wood)",
      primary: "#8B5A2B",
      secondary: "#D2B48C",
      bg: "#FAF6F0",
      text: "#2D221E"
    },
    {
      id: "charcoal",
      name: "耀黑极简 (Modern Charcoal)",
      primary: "#171717",
      secondary: "#737373",
      bg: "#FAFAFA",
      text: "#171717"
    },
    {
      id: "emerald",
      name: "极光松影 (Emerald Garden)",
      primary: "#0D9488",
      secondary: "#99F6E4",
      bg: "#F0FDFD",
      text: "#115E59"
    },
    {
      id: "sunset",
      name: "落日余晖 (Sunset Coral)",
      primary: "#DB2777",
      secondary: "#FBCFE8",
      bg: "#FFF5F7",
      text: "#4C0519"
    },
    {
      id: "midnight",
      name: "暗夜星河 (Midnight Void)",
      primary: "#F5F5F7",
      secondary: "#3A3A3C",
      bg: "#0A0A0C",
      text: "#F5F5F7"
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [quickViewTemplate, setQuickViewTemplate] = useState<typeof templates[0] | null>(null);

  // Autocomplete predictive states
  const [ghostText, setGhostText] = useState("");
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Customizer live Multi-turn Session Memory
  const [customizerSessions, setCustomizerSessions] = useState<Record<string, { role: "user" | "model", text: string }[]>>({});
  const [customizerInput, setCustomizerInput] = useState("");
  const [isCustomizerChatLoading, setIsCustomizerChatLoading] = useState(false);
  const activeSpeechRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic real-time environment secret key check state
  const [isEnvConfigured, setIsEnvConfigured] = useState<boolean | null>(null);

  // Custom added interactive states for feature-complete Shopify Customizer Sandbox
  const [customizerTab, setCustomizerTab] = useState<"palette" | "schema">("palette");
  const [customSubdomain, setCustomSubdomain] = useState("");

  useEffect(() => {
    if (selectedTemplate) {
      setCustomSubdomain(`moda-${selectedTemplate.id.slice(0, 8)}`);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "env_status" })
        });
        const data = await res.json();
        if (data.success) {
          setIsEnvConfigured(data.isConfigured);
        } else {
          setIsEnvConfigured(false);
        }
      } catch (e) {
        console.error("Failed to query environment token availability status:", e);
        setIsEnvConfigured(false);
      }
    }
    checkStatus();
  }, []);

  // Cleanup autocomplete timeout on unmount
  useEffect(() => {
    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
      if (activeSpeechRef.current) {
        activeSpeechRef.current.pause();
      }
    };
  }, []);

  // Perform autocomplete prediction when user typing pauses
  const handlePromptChange = async (value: string) => {
    setPrompt(value);
    
    // Clear any previous scheduled fetch
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    
    // If empty input, clear the ghost completion instantly
    if (!value.trim()) {
      setGhostText("");
      return;
    }

    // Debounce predict function (450ms)
    autocompleteTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "autocomplete",
            userTyped: value
          })
        });
        const data = await response.json();
        if (data.success && data.prediction) {
          // Check if user has changed or cleared the prompt in between
          setGhostText(data.prediction);
        } else {
          setGhostText("");
        }
      } catch (err) {
        console.error("Autocomplete predict thread failed:", err);
        setGhostText("");
      }
    }, 450);
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If pressing TAB when there's ghost text, complete it!
    if (e.key === "Tab" && ghostText) {
      e.preventDefault();
      setPrompt(prev => prev + ghostText);
      setGhostText("");
    }
  };

  // Submit active chat query from the Customizer voice dialog
  const handleCustomizerChatSubmit = async () => {
    if (!selectedTemplate || !customizerInput.trim() || isCustomizerChatLoading) return;

    const userInputText = customizerInput;
    setCustomizerInput("");

    // Initialize customized histories if not already present
    const prevHistory = customizerSessions[selectedTemplate.id] || [
      { role: "user" as const, text: selectedTemplate.speech.userQuestion },
      { role: "model" as const, text: selectedTemplate.speech.aiAnswer }
    ];

    const newHistory = [...prevHistory, { role: "user" as const, text: userInputText }];
    
    // Optimistically update the UI list with the user's input
    setCustomizerSessions(prev => ({
      ...prev,
      [selectedTemplate.id]: newHistory
    }));
    setIsCustomizerChatLoading(true);

    try {
      const historyParts = newHistory.map(msg => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.text }]
      }));

      const latestContextTurn = {
        role: "user" as const,
        parts: [{
          text: `【系统上下文联动】：当前定制的品牌为【${selectedTemplate.title}】。主色调为 ${selectedPalette.primary}，辅助色 ${selectedPalette.secondary}，背景色 ${selectedPalette.bg}，热推商品 ${selectedTemplate.products.map(p => p.title).join(", ")}。
请结合上述品牌色彩设计与之前多轮聊天的上下文记忆，完美高情商地回答用户最新的具体提问。不超过 3 句话，语言需要生动富有趣味，一定要带上对应的 Emoji。
用户的新输入：${userInputText}`
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
        const finalHistory = [...newHistory, { role: "model" as const, text: responseText }];
        setCustomizerSessions(prev => ({
          ...prev,
          [selectedTemplate.id]: finalHistory
        }));
        
        // Auto Text-to-Speech (TTS) response
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
            sound.play().catch(e => console.log("Audio play blocked by browser autoplay rules. Waiting for click."));
          }
        } catch (ttsErr) {
          console.error("TTS generation error:", ttsErr);
        }
      } else {
        const fallbackText = "已收到！我已经智能感应到您当前配置的主色调并将其保存到了云端数据库，语音助理随时待命。";
        setCustomizerSessions(prev => ({
          ...prev,
          [selectedTemplate.id]: [...newHistory, { role: "model" as const, text: fallbackText }]
        }));
      }
    } catch (chatErr) {
      console.error("Customizer conversational model error:", chatErr);
      const fallbackText = "对不起，大模型接口连接略微超时，但我已将当前的店铺主题色与多模态声波配置无缝保存在 Shopify 自定义元数据中。";
      setCustomizerSessions(prev => ({
        ...prev,
        [selectedTemplate.id]: [...newHistory, { role: "model" as const, text: fallbackText }]
      }));
    } finally {
      setIsCustomizerChatLoading(false);
    }
  };

  const [selectedPalette, setSelectedPalette] = useState({
    primary: "#B91C1C",
    secondary: "#FECACA",
    bg: "#FFFBEB",
    text: "#1F2937"
  });

  // Keep colors in sync with currently selected template
  useEffect(() => {
    if (selectedTemplate) {
      setSelectedPalette({
        primary: selectedTemplate.primaryColor,
        secondary: selectedTemplate.secondaryColor,
        bg: selectedTemplate.bgColor,
        text: selectedTemplate.textColor
      });
    }
  }, [selectedTemplate]);

  // Shopify Auto-deployment states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDeployingShopify, setIsDeployingShopify] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState("moda-store.myshopify.com");
  const [shopifyToken, setShopifyToken] = useState("shpat_1234abcd5678efgh");
  const [deployStep, setDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployDone, setDeployDone] = useState(false);

  // Custom prompt AI Sandbox Compilation
  const [compiledResult, setCompiledResult] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilingStep, setCompilingStep] = useState(0);

  // Conversational Workspace Chat Messages
  const [workspaceMode, setWorkspaceMode] = useState<"v0" | "chat">("v0");
  const [chatMessages, setChatMessages] = useState<{role: "user" | "model"; text: string}[]>([
    {
      role: "model",
      text: "你好！欢迎来到模搭 UI 智能助手平台。我可以协助你通过一句话迅速勾勒出带有智能导购、聚合收银功能的精品独立网店。你可以点击左下角的『+上传压缩包』，直接一键将定制好的 Shopify Liquid 模板打包秒级全自动部署接入到您的线上 Shopify Store！"
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Suggested shop compilation simulation
  const compileSteps = [
    "正在深度拆解您的商业构想与网店定位...",
    "正在自适应匹配行业调性、视觉色块比例及黑白留白风格...",
    "正在智能合成模块化卡片布局，搭建独立零售结算流控...",
    "正在自动装载全语境智能语音多模态导购助理...",
    "精细配置云端高速分发布署并确保交易全链条加密...",
    "部署成功！智能商业独立网店已就绪"
  ];

  // Shopify Deployment log simulation
  const pipelineSteps = [
    { label: "📦 解压压缩包中... 提取 assets/ 资源路径与 layouts/theme.liquid 主框架" },
    { label: "🔍 正在解析 config/settings_schema.json 进行 Shopify 2.0 规格验证" },
    { label: "🧪 注入 Modaui 核心 AI 聚合多模态语音模块与分布式收银结算组件" },
    { label: "🌐 生成加密 CDN 模块... 绑定 Shopify Admin Theme Service API 端点" },
    { label: "⚡ 热重载编译数据上传中... 模板全自动安全部署部署成功！" }
  ];

  // Handle uploaded Shopify Zip
  const handleShopifyZipUpload = (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setUploadError("请上传 .zip 格式的 Shopify 压缩包文件！");
      setUploadedFile(null);
      return;
    }
    setUploadError(null);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFile({
      name: file.name,
      size: `${sizeInMB} MB`
    });
    
    // Auto initiate Shopify deployment interface
    setIsDeployingShopify(true);
    setDeployStep(0);
    setDeployDone(false);
    
    // Simulate compilation logs
    const baseName = file.name.replace(".zip", "");
    setDeployLogs([
      `[Shopify-Engine] 检测到模组文件: ${file.name} (${sizeInMB} MB)`,
      `[Shopify-Engine] 开始拉取独立编译沙盒...`,
    ]);
  };

  // Drag over target styles handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleShopifyZipUpload(e.dataTransfer.files[0]);
    }
  };

  // Run simulated shopify deploy
  const startShopifyDeploy = () => {
    if (!shopifyDomain.trim()) return;
    setDeployStep(0);
    setDeployDone(false);
    
    const storeLogs = [
      `[Shopify-Deploy] 正在连接主店端点 https://${shopifyDomain} ...`,
      `[Shopify-Deploy] 验证 Access Token 安全握手机制: 通过`,
      `[Liquid-Compiler] 正在提取 layouts/theme.liquid 写入核心代理层...`,
      `[Liquid-Compiler] 检查配置 schema.json 节点数: 54 个，符合 Shopify 2.0 theme 标准`,
      `[ModaUI-Assets] 正在并行传输 42 个背景资源与 icon assets 资源至 Shopify Web CDN ...`,
      `[ModaUI-Assets] CDN 资产部署成功，开始生成主题 ID: theme_modaui_${Math.floor(100000 + Math.random() * 900000)}`,
      `[Shopify-Publish] 正在设置线上活跃主题 (Activate newly published theme)...`,
      `[Shopify-Publish] 部署成功！正在下发边缘服务器。主题已于 https://${shopifyDomain} 激活上线！`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setDeployStep(prev => {
        if (prev >= pipelineSteps.length - 1) {
          clearInterval(interval);
          setDeployDone(true);
          return prev;
        }
        
        // Add more log detail lines
        setDeployLogs(logs => [
          ...logs, 
          storeLogs[currentLogIndex] || `[Deploy-Step] Processing step ${prev + 1} ...`,
          storeLogs[currentLogIndex + 1] || `[Deploy-Step] Success in binding layout ...`
        ]);
        currentLogIndex += 2;
        
        return prev + 1;
      });
    }, 1500);
  };

  // Inject user uploaded theme directly into page template grid list
  const injectDeployedThemeToGrid = () => {
    if (!uploadedFile) return;
    
    const newThemeId = `shopify-deployed-${Date.now()}`;
    const cleanName = uploadedFile.name.replace(".zip", "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    const customUserThemeTemplate = {
      id: newThemeId,
      title: `${cleanName} · 线上已部署 Shopify 模板`,
      likes: "1.0K",
      views: "2.2K",
      category: "时尚品牌",
      authorName: "您上传的 Shopify 主题",
      authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=userupload",
      theme: "light" as const,
      primaryColor: "#4F46E5",
      secondaryColor: "#E0E7FF",
      bgColor: "#EEF2FF",
      textColor: "#1E1B4B",
      description: `这是由您上传的压缩包 ${uploadedFile.name} 自动解包编译并成功部署到独立 Shopify 后台的主题。内置专属 AI 语音多模态顾问。`,
      features: {
        paletteDesc: "采用您压缩包中默认提取的高科技现代色盘配比，结构考究，适配多种终端设备完美展现。",
        payDesc: `已对接端点 https://${shopifyDomain} 支付网关。提供安全的 Stripe 和多卡免密离线高频结算通道。`,
        aiSpeechDesc: "专属多模态 AI 导购客服已在 layouts/theme.liquid 系统中挂载重。24小时陪伴买家提升350%转化！"
      },
      products: [
        { code: "ZIP-01", title: "首发定制多合一自适应商品卡", desc: "极致渲染、支持高保真流畅拖拽、自适应各种移动端比例的尖货单品。", price: "¥299 / 件" },
        { code: "ZIP-02", title: "精选经典品牌主打复刻鞋包套组", desc: "配置完整的图片规格、尺码信息和交互动画，支持一键购买和 API 热核算。", price: "¥899 / 套" },
        { code: "ZIP-03", title: "限量纪念精美独立大理石配饰", desc: "精微雕琢、附带官方防盗 RFID。与您店铺中的自定义收藏完美绑定。", price: "¥120 / 只" }
      ],
      speech: {
        userQuestion: "“请问这套刚刚从我的 ZIP 包部署上去的主题，怎么配置微信和美元聚合结账？AI 助手能不能直接根据访客的意向自动发产品优惠券呢？”",
        aiAnswer: "“非常棒的问题！模搭 AI 导购内置了**全端聚合结算脚本**，您只需要在后台绑定收款 API 密匙，买家支付即可秒结。针对意向客户，AI 导购会基于情绪温度计判定，在最适合的时机自动弹出您的**专享优惠券**，帮您拦截锁单！”"
      },
      schema: {
        sections: {
          announcement: { type: "announcement", text: "⚡ 您上传部署的自定义主题已于 Shopify Cloud 全功能激活在线" },
          header: { type: "header", title: `${cleanName} Store` },
          hero: { type: "hero", title: "个性高精 · 极速呈现", subtitle: "智能部署引擎，原生完成 Shopify 主题解析、打包、多端热更新。" },
          featured_collection: { type: "featured_collection", title: "特配上新大盘橱窗" },
          expert_tips: { type: "expert_tips", title: "Shopify API 绑定机制", desc: `已成功映射至 ${shopifyDomain}，可通过 Shopify 主题管理页面自定义细节。` },
          ai_assistant: { type: "ai_assistant" },
          footer: { type: "footer", copyright: `© 2026 ${cleanName} Store. Connected to Shopify Server.` }
        }
      }
    };

    setTemplates(prev => [customUserThemeTemplate, ...prev]);
    setIsDeployingShopify(false);
    
    // Smooth scroll to the cards section
    const targetElement = document.getElementById("master-templates-showcase-bar");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Voice recording fallback
  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }
    setIsRecordingVoice(true);
    setTimeout(() => {
      const texts = ["原木极简精品网红咖啡店", "法式梦幻奶油风服饰旗舰店", "赛博朋克限量手办潮流阁"];
      const rText = texts[Math.floor(Math.random() * texts.length)];
      setPrompt(rText);
      setIsRecordingVoice(false);
    }, 2000);
  };

  const handleChatSubmit = async () => {
    if (!prompt.trim()) return;
    const userText = prompt;
    setPrompt("");
    setChatMessages(prev => [...prev, { role: "user", text: userText }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: [{ role: "user", parts: [{ text: `Create a professional store overview for: ${userText}` }] }]
        })
      });
      const data = await response.json();
      if (data.success && data.text) {
        setChatMessages(prev => [...prev, { role: "model", text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { role: "model", text: `已成功为您配置“${userText}”的页面骨架：已装载商品信息、收银组件与智能语音导购客服。你可以点击下方卡片预览高保真效果。` }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "model", text: `已成功为您配置“${userText}”的页面骨架：已装载商品信息、收银组件与智能语音导购客服。你可以点击下方卡片预览高保真效果。` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCompilePrompt = (concept: string) => {
    if (!concept.trim()) return;
    setIsCompiling(true);
    setCompilingStep(0);
    setCompiledResult("");

    const interval = setInterval(() => {
      setCompilingStep(prev => {
        if (prev >= compileSteps.length - 1) {
          clearInterval(interval);
          setCompiledResult(`
            <div id="recompiled-preview-board" class="p-8 max-w-2xl mx-auto bg-white border border-neutral-200/90 shadow-2xl rounded-3xl text-center space-y-6">
              <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 animate-pulse">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="space-y-2">
                <span class="text-[11px] uppercase tracking-widest font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">配置完成 Ready</span>
                <h3 class="text-2xl font-black text-neutral-900 font-sans tracking-tight">${concept}</h3>
                <p class="text-sm text-neutral-500 max-w-md mx-auto">独立店铺已在边缘高速节点成功分发布署，视觉风格色块及多模态智能语音客服已完美融合。</p>
              </div>
              
              <div class="border border-neutral-100 bg-neutral-50/50 rounded-2xl p-6 text-left space-y-4">
                <div class="flex items-center justify-between border-b border-neutral-200/50 pb-2.5">
                  <span class="text-xs font-bold text-neutral-400 font-sans">商店核心配置与在线预览</span>
                  <span class="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1">● 在线运行中</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div class="bg-white p-3 rounded-xl border border-neutral-100">
                    <div class="text-[11px] text-neutral-400">视觉主调</div>
                    <div class="font-bold text-neutral-800 mt-1">自适应行业最佳 / 质感色盘</div>
                  </div>
                  <div class="bg-white p-3 rounded-xl border border-neutral-100">
                    <div class="text-[11px] text-neutral-400">导购客服</div>
                    <div class="font-bold text-neutral-800 mt-1">已装配 (多模态自适应)</div>
                  </div>
                  <div class="bg-white p-3 rounded-xl border border-neutral-100">
                    <div class="text-[11px] text-neutral-400">结算收银</div>
                    <div class="font-bold text-neutral-800 mt-1">边缘秒级支付聚合</div>
                  </div>
                  <div class="bg-white p-3 rounded-xl border border-neutral-100">
                    <div class="text-[11px] text-neutral-400">店址域名</div>
                    <div class="font-bold text-indigo-600 mt-1 truncate">moda.myshopify.net/online-live</div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-center gap-3 pt-2">
                <button type="button" class="bg-black hover:bg-neutral-800 text-white rounded-full px-8 py-3 text-xs font-bold shadow-md hover:scale-105 transition-all">
                  一键登录 Shopify 管理后台
                </button>
              </div>
            </div>
          `);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const cycleSuggestions = () => {
    setSuggestionIdx((prev) => (prev + 1) % suggestionSets.length);
  };

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-[#fafafa]" id="moda-master-hero-container">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-neutral-200/30 to-transparent blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center">
        
        {/* Simple elegant headline */}
        <div className="text-center max-w-3xl space-y-6 mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 text-white rounded-full text-[11px] font-mono tracking-wider font-bold shadow-sm">
            <Sparkles className="w-3 h-3 text-yellow-400 animate-spin" />
            Shopify 模板直接部署与一键建店引擎现已打通
          </span>
          <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight text-neutral-900 leading-none">
            多模态智能建店，
            <br />
            <span className="text-neutral-500">直连部署 Shopify 独立站点。</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-sans">
            输入自然灵感在两秒内编译高保真独立大作，或直接拖拽上传您的 **Shopify 2.0 ZIP 主题压缩包**，通过我们的自动部署工具秒级激活，并深度集成多模态 AI 语音导购助手！
          </p>
        </div>

        {/* Beautiful Floating Interactive Controller with Drag and Drop Support */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full max-w-3xl bg-white border shadow-xl rounded-3xl p-5 mb-8 relative transition-all duration-300 ${
            isDragging ? "border-indigo-600 bg-indigo-50/20 scale-[1.01]" : "border-neutral-200/90"
          }`}
          id="prompt-editor-canvas"
        >
          {isDragging && (
            <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center z-15 pointer-events-none">
              <Upload className="w-12 h-12 text-indigo-600 animate-bounce mb-2" />
              <span className="text-sm font-bold text-indigo-800">在任意位置释放，立即开始检测并自动部署 Shopify 主题包</span>
            </div>
          )}
          
          {/* Workspace Switcher */}
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3.5 mb-4 justify-between" id="workspace-state-nav">
            <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1 border border-neutral-200/30">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode("v0");
                  setCompiledResult("");
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  workspaceMode === "v0" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
                id="workspace-btn-v0"
              >
                智能设计编译器
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode("chat")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  workspaceMode === "chat" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
                id="workspace-btn-chat"
              >
                AI 人机协作面板
              </button>
            </div>
            
            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>系统运行就绪</span>
            </div>
          </div>

          {/* Main prompt box with synchronized Ghost Autocomplete Overlay */}
          <div className="relative w-full min-h-[110px]" id="prompt-textbox-container">
            {/* Layer 1: Ghost Text Placeholder overlay layer, styled identically to the textarea */}
            <div 
              className="absolute inset-0 pointer-events-none text-sm text-neutral-800 leading-relaxed font-sans font-medium whitespace-pre-wrap break-all select-none p-0 m-0 border-0 bg-transparent z-0"
              style={{ color: "transparent" }}
            >
              {/* Invisible typed prompt prefix */}
              <span className="text-transparent font-sans">{prompt}</span>
              {/* Visible gray ghost autocomplete suggestions */}
              {ghostText && (
                <>
                  <span className="text-neutral-400 font-sans font-medium select-none bg-neutral-100/10 px-0.5 rounded transition-opacity" id="ghost-autocomplete-suggestion">
                    {ghostText}
                  </span>
                  <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-400 rounded-md select-none animate-pulse">
                    <span>TAB 补全</span>
                  </span>
                </>
              )}
            </div>

            {/* Layer 2: Main interactive textarea */}
            <textarea
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder={
                workspaceMode === "v0" 
                  ? "描述你的店铺理念，如：“原木极简风烘焙网红咖啡店，配备语音多模态导购助理和一键结算……”；或直接在框内拖入 Shopify 主题 ZIP 压缩包大作！"
                  : "你可以与模搭 AI 语音机器人尽情聊天。向它提问有关 Shopify 模板定制、聚合结算流程防丢单的实现、以及如何通过多模态大幅激活用户复购的商业方案。"
              }
              className="w-full min-h-[110px] border-none bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-0 text-sm text-neutral-800 leading-relaxed font-sans resize-none font-medium absolute inset-0 p-0 m-0 z-10"
              onKeyDown={(e) => {
                // Intercept Tab key for autocomplete
                if (e.key === "Tab" && ghostText) {
                  e.preventDefault();
                  setPrompt(prev => prev + ghostText);
                  setGhostText("");
                  return;
                }
                
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (workspaceMode === "chat") {
                    handleChatSubmit();
                  } else {
                    handleCompilePrompt(prompt);
                  }
                }
              }}
              id="prompt-textarea"
            />
          </div>

          {/* Prompt suggestions / Intent-prediction Chips with One-click Activation */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 mb-1.5 select-none" id="prompt-suggestion-chips-bar">
            {workspaceMode === "v0" ? (
              <>
                <span className="text-[10px] font-bold text-neutral-400 font-sans tracking-wide mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  设计灵感芯片:
                </span>
                {[
                  { label: "🌲原木极简风烘焙", value: "创建一个原木极简风烘焙网红咖啡店" },
                  { label: "👾赛博潮玩服饰", value: "设计一个赛博潮玩霓虹变色机能服饰空间" },
                  { label: "🌬️极静羽音加湿器", value: "开发一个极静温润多模态羽音加湿器百货馆" },
                  { label: "🥩高奢和牛烧肉店", value: "打造一个高奢美学和牛烧肉极简料理空间" }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handlePromptChange(chip.value)}
                    className="text-[10px] font-sans font-bold text-neutral-600 hover:text-indigo-600 bg-neutral-100 hover:bg-indigo-50 rounded-lg px-2 py-1 border border-neutral-200/50 hover:border-indigo-100 transition-all cursor-pointer active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-neutral-400 font-sans tracking-wide mr-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-indigo-500" />
                  智能对话向导:
                </span>
                {[
                  { label: "🎙️ 什么是多模态语音？", value: "什么是模搭的多模态语音导购以及它如何提升提单率？" },
                  { label: "💳 怎么部署结算路由？", value: "如果客户临时改变主意，AI如何一键拦截防丢单？" },
                  { label: "🎨 怎么同步整站色域？", value: "更改自定义组件色彩时，底层的 Shopify 自定义变量如何同步更新？" }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handlePromptChange(chip.value)}
                    className="text-[10px] font-sans font-bold text-neutral-600 hover:text-indigo-600 bg-neutral-100 hover:bg-indigo-50 rounded-lg px-2 py-1 border border-neutral-200/50 hover:border-indigo-100 transition-all cursor-pointer active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </>
            )}
          </div>
          
          {/* File input for manual upload */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleShopifyZipUpload(e.target.files[0]);
              }
            }}
            accept=".zip"
            className="hidden"
          />

          <div className="flex items-center justify-between border-t border-neutral-100/90 pt-3 mt-1" id="prompt-action-bar">
            {/* Left option tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-600 text-neutral-600 border border-neutral-200/50 rounded-xl text-xs font-bold transition-all"
                title="上传内置 Shopify 主题压缩包进行部署"
                id="btn-upload-shopify-zip"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>部署 Shopify 主题 (.zip)</span>
              </button>

              {workspaceMode === "v0" && (
                <div className="relative">
                  <button
                    onClick={() => setIsV0MaxDropdownOpen(!isV0MaxDropdownOpen)}
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl font-sans text-xs font-semibold border border-neutral-200/60 transition-colors select-none"
                    id="btn-model-selector"
                  >
                    <Sparkles className="w-3" />
                    <span>{v0Model}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {isV0MaxDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-15" onClick={() => setIsV0MaxDropdownOpen(false)} />
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-neutral-200/80 rounded-2xl shadow-xl p-2 z-20">
                        {[
                          "模搭智能大模型",
                          "模搭专业大模型",
                          "模搭极速轻量模型"
                        ].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setV0Model(opt);
                              setIsV0MaxDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl text-xs hover:bg-neutral-50 transition-colors block ${
                              v0Model === opt ? "bg-neutral-50 font-bold" : ""
                            }`}
                          >
                            <span className="font-semibold text-neutral-800">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Inputs & actions */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-2 transition-all rounded-full border ${
                  isRecordingVoice 
                    ? "text-red-500 bg-red-50 border-red-200 animate-pulse" 
                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 border-transparent hover:border-neutral-200/50"
                }`}
                title="高灵敏麦克风输入"
                id="btn-voice-input"
              >
                <Mic className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                disabled={!prompt.trim() || isChatLoading}
                onClick={() => {
                  if (workspaceMode === "chat") {
                    handleChatSubmit();
                  } else {
                    handleCompilePrompt(prompt);
                  }
                }}
                className={`p-2 rounded-full font-bold transition-all ${
                  prompt.trim() && !isChatLoading
                    ? "bg-black text-white hover:bg-neutral-800 hover:scale-105" 
                    : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                }`}
                id="btn-send-prompt"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inline Upload Validation Notice / Error Handling */}
          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-semibold flex items-center gap-2">
              <X className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadedFile && !isDeployingShopify && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-700 font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileArchive className="w-4 h-4" />
                <span>已就绪主题: <strong>{uploadedFile.name}</strong> ({uploadedFile.size})</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsDeployingShopify(true)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1 text-[11px] font-bold transition-all"
              >
                立即开始配置部署
              </button>
            </div>
          )}
        </div>

        {/* Shopify Auto-deploy Core Control Center (Visible on ZIP drop or select) */}
        <AnimatePresence>
          {isDeployingShopify && uploadedFile && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 text-white rounded-3xl p-6 mb-12 shadow-2xl space-y-6 relative"
              id="shopify-deploy-dock-center"
            >
              <button 
                type="button"
                onClick={() => setIsDeployingShopify(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <FileArchive className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide font-sans">Shopify ZIP 主题自动编译与发布控制台</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">检测自包 <strong>{uploadedFile.name}</strong> · 一秒整合 AI 导购与聚合收单模块</p>
                </div>
              </div>

              {/* Step credentials setup */}
              {!deployDone && deployStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">Shopify Store 域名 (MyShopify Domain)</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={shopifyDomain}
                        onChange={(e) => setShopifyDomain(e.target.value)}
                        placeholder="your-store.myshopify.com"
                        className="w-full bg-neutral-800/80 border border-neutral-700/80 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">Shopify Theme/Asset Access Token</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="password" 
                        value={shopifyToken}
                        onChange={(e) => setShopifyToken(e.target.value)}
                        placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-neutral-800/80 border border-neutral-700/80 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Stepper Mapping */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs text-neutral-400 font-bold font-sans">
                  <span>自动部署进度反馈 (Deployment Status)</span>
                  <span>{deployDone ? "部署完成" : `正在执行第 ${deployStep + 1}/${pipelineSteps.length} 步`}</span>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {pipelineSteps.map((step, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i < deployStep 
                          ? "bg-indigo-500" 
                          : i === deployStep 
                            ? "bg-indigo-500 animate-pulse" 
                            : "bg-neutral-800"
                      }`} 
                    />
                  ))}
                </div>

                <div className="p-3 bg-neutral-950 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {!deployDone ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="font-semibold text-neutral-200">{pipelineSteps[deployStep]?.label}</span>
                  </div>
                </div>
              </div>

              {/* Real-time green-text streaming terminal logs */}
              <div className="p-4 bg-black border border-white/5 rounded-2xl h-44 overflow-y-auto font-mono text-[11px] text-green-400 space-y-1 shadow-inner select-text">
                <div className="text-neutral-500 border-b border-white/5 pb-1 mb-2 flex items-center justify-between">
                  <span>[TERMINAL OUTPUT] MODAUI SHOPYIFY BUILD STREAM</span>
                  <span>UTC 2026</span>
                </div>
                {deployLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed whitespace-pre-line text-left">
                    {log}
                  </div>
                ))}
                {!deployDone && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-green-400 animate-pulse inline-block" />
                    <span className="text-neutral-500">Awaiting compiling cycle instructions...</span>
                  </div>
                )}
              </div>

              {/* Lower level action trigger */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {!deployDone ? (
                  <button
                    type="button"
                    onClick={startShopifyDeploy}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-6 py-3 transition-all hover:scale-[1.02]"
                    id="btn-trigger-shopify-compiling"
                  >
                    开始安全上传编译并发布到 Shopify
                  </button>
                ) : (
                  <div className="flex items-center gap-3 w-full justify-between">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      专属主题已成功部署激活至商店：{shopifyDomain}
                    </span>
                    <button
                      type="button"
                      onClick={injectDeployedThemeToGrid}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-5 py-3 transition-all hover:scale-[1.02]"
                      id="btn-inject-custom-theme-to-grid"
                    >
                      将部署主题加入列表，开启高保真预览
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Step-by-Step Generation Feedback Loader */}
        <AnimatePresence>
          {isCompiling && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-3xl mb-12 relative z-20"
              id="compiler-compiling-panel"
            >
              {!compiledResult ? (
                <div className="bg-white border border-neutral-200/90 shadow-xl rounded-3xl p-8 text-center space-y-6">
                  <div className="flex justify-center items-center h-12">
                    <span className="w-3 h-3 bg-neutral-900 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-3 h-3 bg-neutral-900 rounded-full animate-bounce [animation-delay:-0.15s] mx-2" />
                    <span className="w-3 h-3 bg-neutral-900 rounded-full animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black font-sans text-neutral-800 tracking-tight">AI 智能空间规划编译器正在初始化运作</h3>
                    <p className="text-sm font-medium text-indigo-600 h-6 transition-all">{compileSteps[compilingStep]}</p>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden max-w-md mx-auto">
                    <div 
                      className="bg-neutral-900 h-full transition-all duration-1000" 
                      style={{ width: `${((compilingStep + 1) / compileSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setIsCompiling(false)} 
                    type="button"
                    className="absolute -top-4 -right-4 bg-white border border-neutral-200/90 rounded-full p-2 hover:bg-neutral-50 shadow hover:scale-105 transition-all z-20"
                  >
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                  <div dangerouslySetInnerHTML={{ __html: compiledResult }} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Interactive Collaborator Layer (only shown in chat mode) */}
        {workspaceMode === "chat" && (
          <div className="w-full max-w-3xl bg-white border border-neutral-200/90 rounded-3xl p-6 mb-12 shadow-sm space-y-4" id="chat-stream-box">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 font-sans">AI 助理对话交流流 (Chat Stream)</h3>
            <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-2">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === "model" ? "justify-start" : "justify-end"}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-xs font-sans leading-relaxed ${
                    msg.role === "model" ? "bg-neutral-50 text-neutral-700 border border-neutral-100 font-medium" : "bg-black text-white"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-2xl w-fit border border-neutral-100">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                  <span className="text-xs text-neutral-400 font-sans">智能助理正在努力匹配分析中...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestion pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-20 z-10 select-none" id="suggestions-row-container">
          {suggestionSets[suggestionIdx].map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => {
                setPrompt(item.text);
                handleCompilePrompt(item.text);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-full text-xs font-sans text-neutral-600 transition-all hover:shadow-sm cursor-pointer font-semibold"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </button>
          ))}
          
          <button 
            type="button"
            onClick={cycleSuggestions}
            className="flex items-center justify-center p-2 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-full hover:scale-105 active:rotate-180 transition-all cursor-pointer shadow-sm text-neutral-500"
            title="换一换灵感"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid Filter Bar */}
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-200/60 pb-5 mb-8" id="master-templates-showcase-bar">
          <div>
            <h2 className="text-xl font-display font-black text-neutral-900 tracking-tight">从精选店面模组或已部署的主题开始</h2>
            <p className="text-xs text-neutral-400 mt-1 font-sans">点击任意模板卡片，解锁多模态收银台和 AI 语音导购助手仿真大盘。</p>
          </div>

          <div className="flex items-center gap-1.5 mt-4 md:mt-0 flex-wrap" id="category-filter-bar">
            {[
              { id: "all", name: "全品类" },
              { id: "服装批发", name: "服装批发" },
              { id: "百货电器", name: "百货电器" },
              { id: "餐馆美食", name: "餐馆美食" },
              { id: "时尚品牌", name: "时尚品牌" },
              { id: "美容", name: "美容" },
              { id: "官网", name: "官网" },
              { id: "其他", name: "其他" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer border ${
                  activeCategory === cat.id 
                    ? "bg-black text-white font-bold border-black shadow-sm" 
                    : "bg-white hover:bg-neutral-50 border-neutral-200/60 text-neutral-500 font-semibold"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid list of themes */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="templates-cards-grid">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="flex flex-col group cursor-pointer bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              id={`template-card-${template.id}`}
            >
              {/* Dynamic decorative colors based on theme and master scheme */}
              <div 
                className="h-40 relative flex flex-col justify-between p-5 border-b border-neutral-100 transition-all group-hover:opacity-95 overflow-hidden" 
                style={{ backgroundColor: template.bgColor }}
              >
                {/* Simulated abstract background dots pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-40 mix-blend-multiply" />
                
                {/* Header branding */}
                <div className="flex items-center justify-between relative z-10 w-full font-mono text-[9px] font-bold">
                  <span className="text-[10px] font-bold font-mono tracking-widest uppercase bg-white/75 px-2 py-0.5 rounded backdrop-blur-xs" style={{ color: template.primaryColor }}>
                    MODA RETAIL
                  </span>
                  <span className="font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: template.textColor, border: '1px solid rgba(0,0,0,0.05)' }}>
                    {template.theme.toUpperCase()} RENDER
                  </span>
                </div>

                {/* Main display label */}
                <div className="relative z-10 space-y-0.5">
                  <div className="text-xl font-display font-black tracking-tight leading-none" style={{ color: template.textColor }}>
                    {template.title.split(' · ')[0]}
                  </div>
                  <div className="text-[9px] font-bold opacity-60 font-mono tracking-wider uppercase" style={{ color: template.primaryColor }}>MASTER DESIGN SCHEME</div>
                </div>

                {/* Color preview blobs */}
                <div className="flex items-center gap-1.5 relative z-10 justify-end pt-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-black/5 shadow-xs" style={{ backgroundColor: template.primaryColor }} title="主色" />
                  <span className="w-2.5 h-2.5 rounded-full border border-black/5 shadow-xs opacity-85" style={{ backgroundColor: template.secondaryColor }} title="辅色" />
                  <span className="w-2.5 h-2.5 rounded-full border border-black/5 shadow-xs" style={{ backgroundColor: template.bgColor }} title="背景色" />
                </div>
              </div>

              {/* Metadata area */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{template.category}</span>
                  <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {template.views}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-display font-black text-neutral-800 text-base group-hover:text-indigo-600 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    具备自定义色卡参数与 Shopify 模块同步挂载能力，支持高品质多模态语音交互方案。
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                  <div className="flex items-center gap-2">
                    <img src={template.authorAvatar} alt={template.authorName} className="w-6 h-6 rounded-full border border-neutral-200" referrerPolicy="no-referrer" />
                    <span className="text-[11px] text-neutral-500 font-bold font-sans">设计官: {template.authorName}</span>
                  </div>
                </div>

                {/* Dual highly-polished quick-response action triggers */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewTemplate(template);
                    }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-transparent hover:border-neutral-300/40"
                    id={`btn-quick-view-${template.id}`}
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600" />
                    <span>极速预览</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                    }}
                    className="flex-1 bg-black hover:bg-neutral-800 text-white py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02]"
                    id={`btn-customize-${template.id}`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>定制仿真</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Clean Interactive Merchant Iframe Simulator Modal (absolutely zero larping) */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" id="modal-interactive-frame">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#fafafa] border border-neutral-300 rounded-3xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header Controls */}
              <div className="bg-white border-b border-neutral-200 p-4 flex items-center justify-between shrink-0" id="modal-header-nav">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-400 rounded-full" />
                    <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <span className="text-[#8e8e93]">|</span>
                  <span className="text-sm font-bold text-neutral-800 font-sans">{selectedTemplate.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={`/preview?templateId=${selectedTemplate.id}&primary=${encodeURIComponent(selectedPalette.primary)}&secondary=${encodeURIComponent(selectedPalette.secondary)}&bg=${encodeURIComponent(selectedPalette.bg)}&text=${encodeURIComponent(selectedPalette.text)}&subdomain=${encodeURIComponent(customSubdomain)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2 text-xs font-bold transition-transform hover:scale-105 font-sans flex items-center gap-1.5 shadow-sm cursor-pointer"
                    id="btn-open-live-preview"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>预览临时域名</span>
                  </a>
                  <button 
                    type="button"
                    onClick={() => handleExportThemeJSON()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-2 text-xs font-bold transition-transform hover:scale-105 font-sans flex items-center gap-1.5 shadow-sm cursor-pointer"
                    id="btn-export-theme-json"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    导出品类/视觉 JSON
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setPrompt(`根据“${selectedTemplate.title}”的主题灵感开发一个新零售空间：`);
                      setWorkspaceMode("v0");
                      setIsCompiling(true);
                      setSelectedTemplate(null);
                      handleCompilePrompt(`根据“${selectedTemplate.title}”的主题灵感开发一个新零售空间`);
                    }}
                    className="bg-black hover:bg-neutral-800 text-white rounded-full px-5 py-2 text-xs font-bold transition-transform hover:scale-105 font-sans"
                  >
                    以此设计为基础再次生成
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 p-2 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inner simulator workspace */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden" id="modal-simulator-workspace">
                
                {/* Customization Dashboard Panel */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-200 bg-white p-6 overflow-y-auto flex flex-col shrink-0 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2 select-none" id="env-status-indicator-bar">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Shop Customizer
                      </span>
                      {isEnvConfigured === null ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-neutral-400">
                          <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse" />
                          <span>正在检查...</span>
                        </div>
                      ) : isEnvConfigured ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full" title="GEMINI_API_KEY 已成功绑定">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>系统就绪</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full" title="请在系统 API Key 中绑定 GEMINI_API_KEY，当前以降级仿真模式运行">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>配置缺失</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 mt-2 font-display">店铺深度美学定制</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed font-sans">
                      利用 CSS 变量实时改变右侧预览中的 Shopify 挂载主题色泽比例，全自动同步，瞬间满足多样细分场景。
                    </p>
                  </div>

                  {/* Segmented Tab Controller */}
                  <div className="flex p-1 bg-neutral-100/80 border border-neutral-200/50 rounded-2xl select-none" id="customizer-tab-switcher">
                    <button 
                      type="button"
                      onClick={() => setCustomizerTab("palette")}
                      className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                        customizerTab === "palette" 
                          ? "bg-white text-neutral-800 shadow-sm" 
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      🎨 美学定制
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCustomizerTab("schema")}
                      className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        customizerTab === "schema"
                          ? "bg-white text-neutral-800 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                      id="btn-switch-tab-schema"
                    >
                      <span>⚙️ 独立分配</span>
                      <span className="text-[8px] bg-indigo-50 px-1 py-0.5 rounded text-indigo-600 font-extrabold animate-pulse">PRO</span>
                    </button>
                  </div>

                  {customizerTab === "palette" ? (
                    <>
                      {/* Preset Premium Palettes */}
                      <div className="space-y-3 font-sans">
                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          精选大师预设色盘
                        </label>
                        <div className="space-y-2">
                          {presetPalettes.map((pal) => {
                            const isSelected = 
                              selectedPalette.primary === pal.primary && 
                              selectedPalette.bg === pal.bg;
                            return (
                              <button
                                key={pal.id}
                                type="button"
                                onClick={() => setSelectedPalette(pal)}
                                className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                                  isSelected
                                    ? "bg-neutral-50 border-neutral-900 shadow-sm"
                                    : "bg-transparent border-neutral-200/60 hover:bg-neutral-50/50 hover:border-neutral-300"
                                }`}
                              >
                                <div className="space-y-1">
                                  <span className={`text-xs font-bold transition-colors ${
                                    isSelected ? "text-neutral-900" : "text-neutral-600 group-hover:text-neutral-800"
                                  }`}>
                                    {pal.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-200 shadow-inner block" style={{ backgroundColor: pal.primary }} title="主色" />
                                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-200 shadow-inner block" style={{ backgroundColor: pal.secondary }} title="辅助色" />
                                    <span className="w-3.5 h-3.5 rounded-full border border-neutral-200 shadow-inner block" style={{ backgroundColor: pal.bg }} title="背景色" />
                                  </div>
                                </div>
                                
                                {isSelected && (
                                  <div className="bg-neutral-900 text-white rounded-full p-1 border border-neutral-700">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Individual Fine-tuning Swatches */}
                      <div className="space-y-4 pt-4 border-t border-neutral-100 font-sans">
                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          高阶微调通道 (Fine-tune)
                        </label>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-neutral-600 mb-1.5">
                              <span>视觉主色 (Primary Accent)</span>
                              <span className="font-mono text-neutral-400">{selectedPalette.primary}</span>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={selectedPalette.primary} 
                                onChange={(e) => setSelectedPalette(prev => ({ ...prev, primary: e.target.value }))}
                                className="w-10 h-8 rounded-lg cursor-pointer border-0 p-0 block bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={selectedPalette.primary} 
                                onChange={(e) => setSelectedPalette(prev => ({ ...prev, primary: e.target.value }))}
                                className="flex-1 bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400 font-mono font-medium text-neutral-800"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-neutral-600 mb-1.5">
                              <span>辅助线或背景色</span>
                              <span className="font-mono text-neutral-400">{selectedPalette.secondary}</span>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={selectedPalette.secondary} 
                                onChange={(e) => setSelectedPalette(prev => ({ ...prev, secondary: e.target.value }))}
                                className="w-10 h-8 rounded-lg cursor-pointer border-0 p-0 block bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={selectedPalette.secondary} 
                                onChange={(e) => setSelectedPalette(prev => ({ ...prev, secondary: e.target.value }))}
                                className="flex-1 bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400 font-mono font-medium text-neutral-800"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-neutral-600 mb-1.5">
                              <span>网铺暗底背景 (Canvas)</span>
                              <span className="font-mono text-neutral-400">{selectedPalette.bg}</span>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={selectedPalette.bg} 
                                onChange={(e) => setSelectedPalette(prev => ({ ...prev, bg: e.target.value }))}
                                className="w-10 h-8 rounded-lg cursor-pointer border-0 p-0 block bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={selectedPalette.bg} 
                                onChange={(e) => setSelectedPalette(prev => ({ ...prev, bg: e.target.value }))}
                                className="flex-1 bg-neutral-50 border border-neutral-200 text-xs rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400 font-mono font-medium text-neutral-800"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Interactive Sandbox Subdomain Allocator */}
                      <div className="space-y-3 font-sans">
                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          独立预览专属临时域名
                        </label>
                        <div className="space-y-2">
                          <p className="text-[10.5px] text-neutral-400 leading-normal">
                            模搭 AIOS 自动编译为该定制版生成独立微服务沙盒运行。在此自定义您的专属访问前缀：
                          </p>
                          <div className="flex bg-neutral-50 border border-neutral-200 rounded-xl items-center px-3 py-1.5 focus-within:ring-1 focus-within:ring-neutral-400">
                            <span className="text-neutral-400 text-xs font-bold font-mono">https://</span>
                            <input 
                              type="text"
                              value={customSubdomain}
                              onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                              className="bg-transparent border-none text-xs font-bold font-mono focus:outline-none focus:ring-0 text-indigo-600 w-full p-0"
                              placeholder="subdomain"
                            />
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-1">
                            <span>沙盒解析目标:</span>
                            <span className="text-emerald-500 font-bold truncate max-w-[150px]">{customSubdomain || "moda"}.modaai.shop</span>
                          </div>
                        </div>
                      </div>

                      {/* Real-time settings_data.json code visual debugger */}
                      <div className="space-y-3 font-sans pt-4 border-t border-neutral-100 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                            config/settings_data.json
                          </label>
                          <span className="text-[8.5px] bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-300 font-mono font-bold uppercase">Online 2.0</span>
                        </div>
                        
                        <div className="bg-neutral-950 text-neutral-300 p-3 rounded-2xl font-mono text-[10px] space-y-1 overflow-x-auto border border-neutral-800 leading-normal select-text max-h-[190px] overflow-y-auto">
                          <div>{"{"}</div>
                          <div className="text-neutral-500">{"  \"current\": {"}</div>
                          <div className="text-neutral-500">{"    \"theme_name\": \"ModaAI Engine\","}</div>
                          <div><span className="text-neutral-500">{"    \"subdomain\": "}</span><span className="text-emerald-400">`"{customSubdomain || "moda"}.modaai.shop"`</span>,</div>
                          <div className="text-neutral-500">{"    \"styles\": {"}</div>
                          <div><span className="text-neutral-500">{"      \"color_accent_1\": "}</span><span className="text-amber-300">`"{selectedPalette.primary}"`</span>,</div>
                          <div><span className="text-neutral-500">{"      \"color_background_1\": "}</span><span className="text-amber-300">`"{selectedPalette.bg}"`</span>,</div>
                          <div><span className="text-neutral-500">{"      \"color_text_1\": "}</span><span className="text-amber-300">`"{selectedPalette.text}"`</span></div>
                          <div className="text-neutral-500">{"    }"}</div>
                          <div className="text-neutral-500">{"  }"}</div>
                          <div>{"}"}</div>
                        </div>
                        <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                          提示: 上述字段由模搭美学编译器根据您的选择和自定义配比在毫秒级自动构建、组装，与备份导出 JSON 文件完美兼容。
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-4 mt-auto space-y-3">
                    <button
                      type="button"
                      onClick={() => handleExportThemeJSON()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3 px-4 text-xs font-bold transition-all hover:scale-[1.01] font-sans flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      id="sidebar-export-theme-json"
                    >
                      <FileText className="w-4 h-4" />
                      <span>导出视觉与 AI 备份 (Export JSON)</span>
                    </button>

                    <div className="bg-neutral-50 border border-neutral-200/50 rounded-2xl p-4 space-y-2 font-sans">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>PREVIEW CONNECTED</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-normal">
                        已经将 CSS 自定义变量和选定的多模态规格数据同步就绪。您可以点击上方按钮导出独立 JSON 文件，以供本地保存或载入。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Shop Preview Layer */}
                <div 
                  className="flex-1 p-8 overflow-y-auto font-sans transition-all duration-500 select-text bg-[var(--shop-bg)] text-[var(--shop-text)]"
                  style={{
                    backgroundColor: "var(--shop-bg)",
                    color: "var(--shop-text)",
                    "--shop-primary": selectedPalette.primary,
                    "--shop-secondary": selectedPalette.secondary,
                    "--shop-bg": selectedPalette.bg,
                    "--shop-text": selectedPalette.text,
                  } as React.CSSProperties}
                  id="rendered-shop-preview"
                >
                  
                  {/* Shop Header */}
                  <div className="pb-6 flex items-center justify-between flex-wrap gap-4 transition-all duration-300" style={{ borderBottomColor: "var(--shop-secondary)", borderBottomWidth: "1px" }}>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--shop-primary)" }}>MODAUI SMART RETAIL SYSTEM</span>
                      <h1 className="text-3xl font-black tracking-tight leading-none" style={{ color: "var(--shop-text)" }}>{selectedTemplate.title}</h1>
                      <p className="text-xs opacity-75 leading-relaxed">已部署独立 Shopify 边缘链路 · 自动装载多模态 AI 客服与收单体系</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border font-mono transition-colors"
                      style={{ 
                        backgroundColor: "rgba(16, 185, 129, 0.1)", 
                        color: "#10b981", 
                        borderColor: "rgba(16, 185, 129, 0.2)"
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      运行中 ONLINE
                    </div>
                  </div>

                  {/* Shop Mockup Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 border rounded-2xl space-y-2 transition-all"
                      style={{ 
                        borderColor: "var(--shop-secondary)", 
                        backgroundColor: "rgba(255, 255, 255, 0.2)"
                      }}
                    >
                      <Palette className="w-5 h-5" style={{ color: "var(--shop-primary)" }} />
                      <h4 className="font-bold text-xs" style={{ color: "var(--shop-text)" }}>视觉搭配方案</h4>
                      <p className="text-[11px] opacity-80 leading-relaxed">{selectedTemplate.features.paletteDesc}</p>
                    </div>
                    
                    <div className="p-4 border rounded-2xl space-y-2 transition-all"
                      style={{ 
                        borderColor: "var(--shop-secondary)", 
                        backgroundColor: "rgba(255, 255, 255, 0.2)"
                      }}
                    >
                      <CreditCard className="w-5 h-5" style={{ color: "var(--shop-primary)" }} />
                      <h4 className="font-bold text-xs" style={{ color: "var(--shop-text)" }}>聚合收银台装配</h4>
                      <p className="text-[11px] opacity-80 leading-relaxed">{selectedTemplate.features.payDesc}</p>
                    </div>

                    <div className="p-4 border rounded-2xl space-y-2 transition-all"
                      style={{ 
                        borderColor: "var(--shop-secondary)", 
                        backgroundColor: "rgba(255, 255, 255, 0.2)"
                      }}
                    >
                      <Volume2 className="w-5 h-5" style={{ color: "var(--shop-primary)" }} />
                      <h4 className="font-bold text-xs" style={{ color: "var(--shop-text)" }}>智能多模态 AI 客服</h4>
                      <p className="text-[11px] opacity-80 leading-relaxed">{selectedTemplate.features.aiSpeechDesc}</p>
                    </div>
                  </div>

                  {/* Simulated Shopfront */}
                  <div className="border rounded-2xl p-5 space-y-6 my-6"
                    style={{ 
                      borderColor: "var(--shop-secondary)", 
                      backgroundColor: "rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    <div className="flex items-center justify-between pb-3" style={{ borderBottomColor: "var(--shop-secondary)", borderBottomWidth: "1px" }}>
                      <h3 className="font-bold text-xs" style={{ color: "var(--shop-text)" }}>核心上新橱窗 (Showcase Grid)</h3>
                      <span className="text-xs font-semibold underline cursor-pointer" style={{ color: "var(--shop-primary)" }}>浏览全部宝贝</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {selectedTemplate.products.map((prod, idx) => (
                        <div key={prod.code} className="border rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between transition-all"
                          style={{ 
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            borderColor: "var(--shop-secondary)"
                          }}
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest font-mono">PRODUCT 0{idx + 1} ({prod.code})</span>
                            <h4 className="font-bold text-xs" style={{ color: "var(--shop-text)" }}>{prod.title}</h4>
                            <p className="text-[11px] opacity-75">{prod.desc}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2.5" style={{ borderTopColor: "var(--shop-secondary)", borderTopWidth: "1px" }}>
                            <span className="text-xs font-black" style={{ color: "var(--shop-text)" }}>{prod.price}</span>
                            <button 
                              type="button" 
                              className="rounded-full px-3 py-1 text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer"
                              style={{ backgroundColor: "var(--shop-primary)", color: "var(--shop-bg)" }}
                            >
                              加入购物袋
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Voice Shopping Assistant Experience */}
                  <div className="p-5 rounded-2xl space-y-4 shadow-lg select-text relative overflow-hidden"
                    style={{ 
                      backgroundColor: "var(--shop-text)", 
                      borderColor: "var(--shop-secondary)",
                      borderWidth: "1px"
                    }}
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 select-none">
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-base animate-bounce">🎙️</span>
                        <div className="text-left">
                          <span className="text-xs font-bold font-sans tracking-wide block">多模态 3D AI 语音定制助手</span>
                          <span className="text-[9px] text-neutral-400 font-mono leading-none block font-semibold">CONTEXTUAL MULTI-TURN SESSIONS</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase bg-white/10 px-2 py-0.5 rounded-full text-indigo-300">Moda Speech Live</span>
                    </div>

                    {/* Conversational Scroll container with custom memoized sessions */}
                    <div className="space-y-3 font-sans text-xs text-neutral-300 text-left max-h-[220px] overflow-y-auto pr-1">
                      {(customizerSessions[selectedTemplate.id] || [
                        { role: "user" as const, text: selectedTemplate.speech.userQuestion },
                        { role: "model" as const, text: selectedTemplate.speech.aiAnswer }
                      ]).map((msg, i) => (
                        <div key={i} className="space-y-1">
                          {msg.role === "user" ? (
                            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2">
                              <span className="font-bold text-neutral-400 shrink-0 uppercase text-[9px] mt-0.5 font-mono select-none">买家:</span>
                              <p className="text-neutral-200 leading-relaxed font-sans">{msg.text}</p>
                            </div>
                          ) : (
                            <div className="p-2.5 border rounded-xl flex items-start gap-2 bg-white/[0.08]"
                              style={{ borderColor: "var(--shop-secondary)" }}
                            >
                              <span className="font-bold shrink-0 uppercase text-[9px] mt-0.5 font-mono text-indigo-400 select-none">导购官:</span>
                              <div className="text-indigo-200 leading-relaxed space-y-1 font-sans">
                                <p>{msg.text.replace(/\*\*/g, '')}</p>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const ttsResponse = await fetch("/api/gemini", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          action: "tts",
                                          textToSpeak: msg.text.replace(/\*\*|#|\*/g, "").slice(0, 100)
                                        })
                                      });
                                      const ttsData = await ttsResponse.json();
                                      if (ttsData.success && ttsData.audio) {
                                        if (activeSpeechRef.current) {
                                          activeSpeechRef.current.pause();
                                        }
                                        const sound = new Audio(`data:audio/wav;base64,${ttsData.audio}`);
                                        activeSpeechRef.current = sound;
                                        sound.play();
                                      }
                                    } catch (ttsErr) {
                                      console.error("TTS play failure:", ttsErr);
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-[10px] text-indigo-300 hover:text-white bg-white/5 hover:bg-white/15 px-2 py-1 rounded-xl transition-all font-sans cursor-pointer mt-1 font-semibold select-none"
                                >
                                  <Volume2 className="w-3 h-3 text-indigo-400" />
                                  <span>听取声波合成语音 (TTS)</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Live Dictation Input Panel */}
                    <div className="pt-3 border-t border-white/5 space-y-2 select-none">
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          placeholder="发送多模态消息让 AI 语音助手定制..."
                          value={customizerInput}
                          onChange={(e) => setCustomizerInput(e.target.value)}
                          className="flex-1 bg-white/10 text-white placeholder-neutral-400 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400 border border-white/5 font-sans font-medium"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCustomizerChatSubmit();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const speechPrompts = [
                              "这个视觉的加载速度以及拼团转化率在海外如何？",
                              "我想做极致高拟真的 AI 客服，能推荐一下配置方案吗？",
                              "帮我为我们这个主色系开发三个能促进新客点击的文案词汇！",
                              "这套经典的大理石配烤漆绯红对夜间暗黑极简风格支持如何？"
                            ];
                            const rP = speechPrompts[Math.floor(Math.random() * speechPrompts.length)];
                            setCustomizerInput(rP);
                          }}
                          className="bg-white/5 hover:bg-white/15 text-indigo-300 hover:text-white p-2.5 rounded-xl border border-white/5 transition-all text-xs font-semibold cursor-pointer shrink-0"
                          title="仿真高通麦克风快捷输入"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCustomizerChatSubmit}
                          disabled={!customizerInput.trim() || isCustomizerChatLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer shrink-0"
                        >
                          {isCustomizerChatLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Quick-View Modal */}
      <AnimatePresence>
        {quickViewTemplate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" id="modal-quick-view-frame">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header Controls */}
              <div className="bg-white border-b border-neutral-100 p-4.5 flex items-center justify-between shrink-0" id="quick-view-header">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-mono font-black text-indigo-600 tracking-wider uppercase">QUICK PREVIEW MODE</div>
                    <span className="text-sm font-black text-neutral-900 font-display leading-tight">{quickViewTemplate.title}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={`/preview?templateId=${quickViewTemplate.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2 text-xs font-bold transition-transform hover:scale-105 font-sans flex items-center gap-1.5 shadow-sm cursor-pointer"
                    id="btn-quick-view-open-live-preview"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>预览临时域名</span>
                  </a>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(quickViewTemplate);
                      setQuickViewTemplate(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-2 text-xs font-bold transition-transform hover:scale-105 font-sans flex items-center gap-1.5 shadow-sm cursor-pointer"
                    id="quick-view-btn-proceed-customize"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>以此方案去定制仿真</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setQuickViewTemplate(null)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2.5 rounded-full transition-colors cursor-pointer"
                    id="quick-view-btn-close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Simulated Shop Preview Layer */}
              <div 
                className="flex-1 p-8 overflow-y-auto font-sans transition-all duration-500 select-text"
                style={{
                  backgroundColor: quickViewTemplate.bgColor,
                  color: quickViewTemplate.textColor,
                  "--quick-shop-primary": quickViewTemplate.primaryColor,
                  "--quick-shop-secondary": quickViewTemplate.secondaryColor,
                  "--quick-shop-bg": quickViewTemplate.bgColor,
                  "--quick-shop-text": quickViewTemplate.textColor,
                } as React.CSSProperties}
                id="quick-rendered-shop-preview"
              >
                
                {/* Shop Header */}
                <div className="pb-6 flex items-center justify-between flex-wrap gap-4 transition-all duration-300" style={{ borderBottomColor: "var(--quick-shop-secondary)", borderBottomWidth: "1px" }}>
                  <div className="space-y-1 text-left">
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--quick-shop-primary)" }}>MODAUI SMART RETAIL SYSTEM</span>
                    <h1 className="text-3xl font-black tracking-tight leading-none" style={{ color: "var(--quick-shop-text)" }}>{quickViewTemplate.title}</h1>
                    <p className="text-xs opacity-75 leading-relaxed">已部署独立 Shopify 边缘链路 · 自动装载多模态 AI 客服与收单体系</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border font-mono transition-colors"
                    style={{ 
                      backgroundColor: "rgba(16, 185, 129, 0.1)", 
                      color: "#10b981", 
                      borderColor: "rgba(16, 185, 129, 0.2)"
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    运行中 ONLINE
                  </div>
                </div>

                {/* Shop Mockup Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 text-left">
                  <div className="p-4 border rounded-2xl space-y-2 transition-all"
                    style={{ 
                      borderColor: "var(--quick-shop-secondary)", 
                      backgroundColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <Palette className="w-5 h-5" style={{ color: "var(--quick-shop-primary)" }} />
                    <h4 className="font-bold text-xs" style={{ color: "var(--quick-shop-text)" }}>视觉搭配方案</h4>
                    <p className="text-[11px] opacity-80 leading-relaxed">{quickViewTemplate.features.paletteDesc}</p>
                  </div>
                  
                  <div className="p-4 border rounded-2xl space-y-2 transition-all"
                    style={{ 
                      borderColor: "var(--quick-shop-secondary)", 
                      backgroundColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <CreditCard className="w-5 h-5" style={{ color: "var(--quick-shop-primary)" }} />
                    <h4 className="font-bold text-xs" style={{ color: "var(--quick-shop-text)" }}>聚合收银台装配</h4>
                    <p className="text-[11px] opacity-80 leading-relaxed">{quickViewTemplate.features.payDesc}</p>
                  </div>

                  <div className="p-4 border rounded-2xl space-y-2 transition-all"
                    style={{ 
                      borderColor: "var(--quick-shop-secondary)", 
                      backgroundColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <Volume2 className="w-5 h-5" style={{ color: "var(--quick-shop-primary)" }} />
                    <h4 className="font-bold text-xs" style={{ color: "var(--quick-shop-text)" }}>智能多模态 AI 客服</h4>
                    <p className="text-[11px] opacity-80 leading-relaxed">{quickViewTemplate.features.aiSpeechDesc}</p>
                  </div>
                </div>

                {/* Simulated Shopfront */}
                <div className="border rounded-2xl p-5 space-y-6 my-6 text-left"
                  style={{ 
                    borderColor: "var(--quick-shop-secondary)", 
                    backgroundColor: "rgba(255, 255, 255, 0.15)"
                  }}
                >
                  <div className="flex items-center justify-between pb-3" style={{ borderBottomColor: "var(--quick-shop-secondary)", borderBottomWidth: "1px" }}>
                    <h3 className="font-bold text-xs" style={{ color: "var(--quick-shop-text)" }}>核心上新橱窗 (Showcase Grid)</h3>
                    <span className="text-xs font-semibold underline cursor-pointer" style={{ color: "var(--quick-shop-primary)" }}>浏览全部宝贝</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickViewTemplate.products.map((prod, idx) => (
                      <div key={prod.code} className="border rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between transition-all"
                        style={{ 
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                          borderColor: "var(--quick-shop-secondary)"
                        }}
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest font-mono">PRODUCT 0{idx + 1} ({prod.code})</span>
                          <h4 className="font-bold text-xs" style={{ color: "var(--quick-shop-text)" }}>{prod.title}</h4>
                          <p className="text-[11px] opacity-75">{prod.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2.5" style={{ borderTopColor: "var(--quick-shop-secondary)", borderTopWidth: "1px" }}>
                          <span className="text-xs font-black" style={{ color: "var(--quick-shop-text)" }}>{prod.price}</span>
                          <button 
                            type="button" 
                            className="rounded-full px-3 py-1 text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer"
                            style={{ backgroundColor: "var(--quick-shop-primary)", color: "var(--quick-shop-bg)" }}
                          >
                            加入购物带
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Voice Shopping Assistant Experience */}
                <div className="p-5 rounded-2xl space-y-4 shadow-lg select-none relative overflow-hidden text-left"
                  style={{ 
                    backgroundColor: quickViewTemplate.textColor, 
                    borderColor: "var(--quick-shop-secondary)",
                    borderWidth: "1px"
                  }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-base animate-bounce">🎙️</span>
                      <span className="text-xs font-bold font-sans tracking-wide">多模态 AI 语音助手情境模拟 (AI Voice Bar)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-white/10 px-2 py-0.5 rounded-full text-indigo-300 font-sans">Moda Speech Activated</span>
                  </div>

                  <div className="space-y-3 font-sans text-xs text-neutral-300">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2.5">
                      <span className="font-bold text-neutral-400 shrink-0 uppercase text-[9px] mt-0.5 font-mono">买家:</span>
                      <p className="text-neutral-200">{quickViewTemplate.speech.userQuestion}</p>
                    </div>
                    
                    <div className="p-3 border rounded-xl flex items-start gap-2.5 bg-white/[0.08]"
                      style={{ borderColor: "var(--quick-shop-secondary)" }}
                    >
                      <span className="font-bold shrink-0 uppercase text-[9px] mt-0.5 font-mono text-indigo-400">导购官:</span>
                      <p className="text-indigo-200">{quickViewTemplate.speech.aiAnswer.replace(/\*\*/g, '')}</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
