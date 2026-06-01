"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, ShoppingBag, Globe, MessageSquare } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "表达您的独立商店构想",
    description: "用您最习惯的自然语言描述您的零售设想（如产品方案、独特视觉品味、目标客群感观），完全不需要任何复杂的开发或代码配置环节。",
    icon: Sparkles,
    highlight: "表达即是设计",
  },
  {
    number: "02",
    title: "AI 智能建档与多模态匹配",
    description: "自动适配匹配行业调性并组合专属大色块布局，同时无缝装配具有高精识别的多模态智能语音客服，并自动载入安全聚合收银结算收单组件。",
    icon: ShoppingBag,
    highlight: "功能全景就绪",
  },
  {
    number: "03",
    title: "零门槛发布即刻开业变现",
    description: "通过极低延迟的边缘分发网络一键发布您的商业页面，支持绑定独占自定义域名，24小时 AIOS 自动化帮您迎客成交与接受无忧支付汇兑。",
    icon: Globe,
    highlight: "边缘即刻上线",
  },
];

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-28 lg:py-36 bg-neutral-900 text-white overflow-hidden"
    >
      
      {/* Decorative clean radial background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="mb-20">
          <span className="inline-flex items-center gap-3 text-xs font-mono text-neutral-400 mb-6 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            The Workflow
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display font-black tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            化凡入简，
            <br />
            <span className="text-neutral-400 font-normal">轻松迈出独立网店第一步。</span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`p-8 bg-white/5 border border-white/10 rounded-3xl space-y-8 flex flex-col justify-between transition-all duration-700 hover:border-white/20 hover:bg-white/[0.07] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="space-y-6">
                
                {/* Header indicators */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black text-indigo-400">{step.number}</span>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-indigo-400">
                    <step.icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-black tracking-tight text-white">{step.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">{step.description}</p>
                </div>

              </div>

              {/* Highlight info */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider select-none">
                <span>{step.highlight}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
