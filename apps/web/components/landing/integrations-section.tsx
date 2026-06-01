"use client";

import { useEffect, useState, useRef } from "react";

const integrations = [
  { name: "Stripe", category: "全球主流信用卡收单方式" },
  { name: "WeChat Pay", category: "微信安全即时扫码支付" },
  { name: "Alipay", category: "支付宝跨境聚合交易收银" },
  { name: "Apple Pay", category: "云闪付一键触控指纹安全闪付" },
  { name: "PayPal", category: "全球信赖买家交易安全机制" },
  { name: "Shopify", category: "跨平台多店货品同步与订单追踪" },
  { name: "TikTok Shop", category: "海外社交流量变现自动导购挂载" },
  { name: "DHL Express", category: "智能跨境国际物流自动测算发货" },
  { name: "FedEx", category: "单号生成与端到端物流实时追踪" },
  { name: "Instagram Shop", category: "图文穿搭商品同步及流量转化" },
  { name: "Google Pay", category: "谷歌钱包极速安全零步跳转" },
  { name: "WooCommerce", category: "自由独立站一键平滑无损迁移" },
];

export function IntegrationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
    <section id="integrations" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 lg:mb-24 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            聚合全生态零售资源
            <span className="w-8 h-px bg-foreground/30" />
          </span>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6">
            无缝畅享，
            <br />
            你已习以为常的工作流。
          </h2>
          <p className="text-xl text-muted-foreground">
            200+ 精选商业生态直联。只需几十秒，让资金流、物流与货品流全套就绪。
          </p>
        </div>

      </div>
      
      {/* Full-width marquees outside container */}
      <div className="w-full mb-6">
        <div className="flex gap-6 marquee">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 shrink-0">
              {integrations.map((integration) => (
                <div
                  key={`${integration.name}-${setIndex}`}
                  className="shrink-0 px-8 py-6 border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-all duration-300 group"
                >
                  <div className="text-lg font-medium group-hover:translate-x-1 transition-transform">
                    {integration.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{integration.category}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Reverse marquee */}
      <div className="w-full">
        <div className="flex gap-6 marquee-reverse">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 shrink-0">
              {[...integrations].reverse().map((integration) => (
                <div
                  key={`${integration.name}-reverse-${setIndex}`}
                  className="shrink-0 px-8 py-6 border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-all duration-300 group"
                >
                  <div className="text-lg font-medium group-hover:translate-x-1 transition-transform">
                    {integration.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{integration.category}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
