export const aiComponentsInfo = {
  MinimalHero: {
    name: "MinimalHero",
    category: "hero",
    description: "简约风格的 Hero 首屏组件",
    props: {
      title: "string",
      subtitle: "string",
      ctaText: "string",
      background: "string"
    }
  },
  ProductGrid: {
    name: "ProductGrid",
    category: "product",
    description: "商品网格展示组件",
    props: {
      title: "string",
      subtitle: "string",
      columns: "number",
      products: "array"
    }
  },
  FeatureSection: {
    name: "FeatureSection",
    category: "marketing",
    description: "功能特性展示组件",
    props: {
      title: "string",
      subtitle: "string",
      features: "array"
    }
  },
  Testimonials: {
    name: "Testimonials",
    category: "marketing",
    description: "用户评价展示组件",
    props: {
      title: "string",
      subtitle: "string",
      testimonials: "array"
    }
  },
  Navbar: {
    name: "Navbar",
    category: "layout",
    description: "导航栏组件",
    props: {
      logo: "string",
      logoText: "string",
      links: "array",
      cartIcon: "boolean"
    }
  },
  Footer: {
    name: "Footer",
    category: "layout",
    description: "页脚组件",
    props: {
      logoText: "string",
      copyright: "string",
      links: "array"
    }
  }
} as const

export type AIComponentName = keyof typeof aiComponentsInfo

export function getAIComponentsList() {
  return Object.keys(aiComponentsInfo) as AIComponentName[]
}

export function getAIComponentPrompt() {
  let prompt = "你可以使用以下组件来构建商店：\n\n"
  
  for (const [name, info] of Object.entries(aiComponentsInfo)) {
    prompt += `- ${name}: ${info.description}\n`
    prompt += `  Props: ${Object.entries(info.props).map(([key, type]) => `${key} (${type})`).join(", ")}\n`
  }
  
  prompt += "\n示例输出格式：\n"
  prompt += "{\n"
  prompt += "  \"type\": \"MinimalHero\",\n"
  prompt += "  \"props\": { \"title\": \"标题\", \"subtitle\": \"副标题\" }\n"
  prompt += "}\n"
  
  return prompt
}
