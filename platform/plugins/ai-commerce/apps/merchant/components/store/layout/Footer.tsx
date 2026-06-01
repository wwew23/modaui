"use client"

export interface FooterProps {
  logoText?: string
  copyright?: string
  links?: { title: string; items: string[] }[]
}

export function Footer({ 
  logoText = "ModaUI", 
  copyright = "© 2026 ModaUI. All rights reserved.",
  links = [
    { title: "产品", items: ["功能", "定价", "案例"] },
    { title: "公司", items: ["关于", "博客", "联系"] },
    { title: "法律", items: ["隐私", "条款", "安全"] }
  ]
}: FooterProps) {
  return (
    <footer className="bg-muted/30 border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold text-foreground mb-4">{logoText}</div>
            <p className="text-muted-foreground text-sm">打造您的专属在线商店</p>
          </div>
          {links.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          {copyright}
        </div>
      </div>
    </footer>
  )
}

export const schema = {
  name: "Footer",
  category: "layout",
  description: "页脚组件",
  props: {
    logoText: "string",
    copyright: "string",
    links: "array"
  }
}

export const defaultProps: FooterProps = {
  logoText: "ModaUI",
  copyright: "© 2026 ModaUI. All rights reserved."
}
