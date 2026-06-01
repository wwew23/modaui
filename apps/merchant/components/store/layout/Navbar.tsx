"use client"

export interface NavbarProps {
  logo?: string
  logoText?: string
  links?: string[]
  cartIcon?: boolean
}

export function Navbar({ 
  logo, 
  logoText = "ModaUI", 
  links = ["首页", "商品", "关于", "联系"], 
  cartIcon = true 
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            ) : (
              <div className="text-xl font-bold text-foreground">{logoText}</div>
            )}
          </div>
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <a 
                key={index} 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {cartIcon && (
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                🛒
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export const schema = {
  name: "Navbar",
  category: "layout",
  description: "导航栏组件",
  props: {
    logo: "string",
    logoText: "string",
    links: "array",
    cartIcon: "boolean"
  }
}

export const defaultProps: NavbarProps = {
  logoText: "ModaUI",
  links: ["首页", "商品", "关于", "联系"],
  cartIcon: true
}
