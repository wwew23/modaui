"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatedWave } from "./animated-wave";

const footerLinks = {
  "产品与方案": [
    { name: "特点功能", href: "#features" },
    { name: "如何运作", href: "#how-it-works" },
    { name: "资费套餐", href: "#pricing" },
    { name: "整合对接", href: "#integrations" },
  ],
  "生态系统": [
    { name: "行业白皮书", href: "#" },
    { name: "合作伙伴联盟", href: "#" },
    { name: "全系统运行资信", href: "#" },
    { name: "系统状态", href: "#" },
  ],
  "关于模搭": [
    { name: "关于我们", href: "#" },
    { name: "前沿博客", href: "#" },
    { name: "加入我们", href: "#", badge: "诚聘" },
    { name: "联系我们", href: "#" },
  ],
  "合规与法律": [
    { name: "隐私政策", href: "#" },
    { name: "服务条款", href: "#" },
    { name: "交易安全保障", href: "#security" },
  ],
};

const socialLinks = [
  { name: "官方公告", href: "#" },
  { name: "领英主页", href: "#" },
];

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 h-64 opacity-20 pointer-events-none overflow-hidden">
        <AnimatedWave />
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <a href="#" className="inline-flex items-center gap-1 mb-6 group">
                <span className="text-2xl font-black tracking-tight text-neutral-950 group-hover:text-indigo-600 transition-colors">modaui<span className="text-indigo-600 font-bold">.</span></span>
              </a>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs text-sm">
                一句话生成自己的智能商店系统。基于强大的多模态 AI 与 Agent 联动，开启属于您的新零售时代。
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                      >
                        {link.name}
                        {"badge" in link && link.badge && (
                          <span className="text-xs px-2 py-0.5 bg-foreground text-background rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 modaui. All rights reserved. 杭州大幕网络科技有限公司 版权所有。
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground" id="footer-status-indicator">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              全链路安全合规通道开启，系统稳定运载中
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
