"use client"

export interface Feature {
  id?: string
  icon?: string
  title: string
  description: string
}

export interface FeatureSectionProps {
  title: string
  subtitle?: string
  features: Feature[]
}

export function FeatureSection({ 
  title, 
  subtitle, 
  features = [] 
}: FeatureSectionProps) {
  const safeFeatures = features || []
  return (
    <section className="py-16 px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safeFeatures.map((feature, index) => (
            <div key={feature.id || index} className="text-center p-6 bg-card rounded-xl border border-border">
              {feature.icon && <div className="text-5xl mb-4">{feature.icon}</div>}
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const schema = {
  name: "FeatureSection",
  category: "marketing",
  description: "功能特性展示组件",
  props: {
    title: "string",
    subtitle: "string",
    features: "array"
  }
}

export const defaultProps: FeatureSectionProps = {
  title: "为什么选择我们",
  subtitle: "品质保障，值得信赖",
  features: [
    { icon: "🚀", title: "快速配送", description: "全国包邮，闪电发货" },
    { icon: "🛡️", title: "品质保障", description: "正品保证，售后无忧" },
    { icon: "💯", title: "优质服务", description: "7x24小时客服在线" }
  ]
}
