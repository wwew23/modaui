"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "多维金融安防合规认证",
    description: "全面集成全场景交易合规防护机制，实现24小时智能风控阻断与多渠道防刷网关。",
  },
  {
    icon: Lock,
    title: "交易通道高强度重密隔离",
    description: "采用全链路账密通道与底层数据三重物理加密解耦，从源头绝缘买家盗刷与商铺资产泄露。",
  },
  {
    icon: Eye,
    title: "安全对账沙箱与指纹锁",
    description: "每一次结算提现、货品上架、资金转接均需指纹级独立确权登录，保证账户资产绝对安全。",
  },
  {
    icon: FileCheck,
    title: "海内外消费者权益法遵循",
    description: "全面遵循全球消保法案及数据保障条例，让您的品牌出海及跨国买家交易完全合规、安心无忧。",
  },
];

const certifications = ["银联支付安全规范", "消保专项基金机制", "资金对账防篡改", "海外合规绿牌", "防恶意盗刷网关"];

export function SecuritySection() {
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
    <section id="security" ref={sectionRef} className="relative py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              资金与信誉安全保护
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              安全，
              <br />
              是繁荣的前置条件。
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              在独立网络经营中，安全和信任从来都不是可选项。模搭在底层内置了多层银行级加密网盾，为您全力守住每一笔买单，并全力护持您的品牌资产信用。
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 border border-foreground/10 text-sm font-mono transition-all duration-500 bg-white/50 backdrop-blur ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Features */}
          <div className="grid gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 border border-foreground/10 hover:border-foreground/20 transition-all duration-500 group ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-foreground/10 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
