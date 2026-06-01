"use client"

export interface MinimalHeroProps {
  title: string
  subtitle: string
  ctaText?: string
  background?: string
}

export function MinimalHero({ 
  title, 
  subtitle, 
  ctaText = "立即探索", 
  background = "#f8fafc" 
}: MinimalHeroProps) {
  return (
    <section 
      className="min-h-[500px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden"
      style={{ backgroundColor: background }}
    >
      <div className="relative z-10 max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <button className="px-8 py-4 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity text-lg">
          {ctaText}
        </button>
      </div>
    </section>
  )
}

export const schema = {
  name: "MinimalHero",
  category: "hero",
  description: "简约风格的 Hero 首屏组件",
  props: {
    title: "string",
    subtitle: "string",
    ctaText: "string",
    background: "string"
  }
}

export const defaultProps: MinimalHeroProps = {
  title: "欢迎来到我们的商店",
  subtitle: "发现优质产品，享受购物体验",
  ctaText: "立即探索",
  background: "#f8fafc"
}
