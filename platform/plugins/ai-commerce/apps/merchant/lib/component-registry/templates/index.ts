import { fashionStoreTemplate } from "./fashion-store"
import { luxuryStoreTemplate } from "./luxury-store"
import { minimalStoreTemplate } from "./minimal-store"

export const storeTemplates = {
  fashion: {
    name: "MODA 时尚",
    description: "现代高级时尚精品店",
    category: "fashion",
    icon: "✨",
    featured: true,
    tags: ["时尚", "高级", "现代"],
    aiPrompt: "创建一个现代高级时尚精品店，强调品质和设计感",
    data: fashionStoreTemplate
  },
  luxury: {
    name: "LUXE 奢华",
    description: "顶级奢华精品店",
    category: "fashion",
    icon: "👑",
    featured: true,
    tags: ["奢华", "顶级", "定制"],
    aiPrompt: "创建一个顶级奢华精品店，强调稀有材质和手工工艺",
    data: luxuryStoreTemplate
  },
  minimal: {
    name: "M 极简",
    description: "极简主义精品店",
    category: "fashion",
    icon: "◻",
    featured: true,
    tags: ["极简", "简约", "经典"],
    aiPrompt: "创建一个极简主义精品店，强调简约设计和永恒经典",
    data: minimalStoreTemplate
  }
} as const

export type TemplateKey = keyof typeof storeTemplates

export function getTemplate(key: TemplateKey) {
  return storeTemplates[key]
}

export function getAllTemplates() {
  return Object.entries(storeTemplates).map(([key, value]) => ({
    key: key as TemplateKey,
    ...value
  }))
}

export function getFeaturedTemplates() {
  return getAllTemplates().filter(t => t.featured)
}

export function getAITemplateSuggestion(userPrompt: string): TemplateKey {
  const lowerPrompt = userPrompt.toLowerCase()
  
  if (lowerPrompt.includes("奢华") || lowerPrompt.includes("顶级") || lowerPrompt.includes("定制") || lowerPrompt.includes("鳄鱼") || lowerPrompt.includes("限量")) {
    return "luxury"
  }
  if (lowerPrompt.includes("极简") || lowerPrompt.includes("简约") || lowerPrompt.includes("经典") || lowerPrompt.includes("less")) {
    return "minimal"
  }
  
  return "fashion"
}
