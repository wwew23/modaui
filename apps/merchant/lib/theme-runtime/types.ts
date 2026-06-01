// 主题运行时类型定义
export interface SectionStyleResponsive<T = any> {
  desktop?: T
  tablet?: T
  mobile?: T
}

export interface SectionStyle {
  padding?: SectionStyleResponsive<string>
  margin?: SectionStyleResponsive<string>
  radius?: SectionStyleResponsive<string>
  background?: SectionStyleResponsive<string>
  textColor?: SectionStyleResponsive<string>
  align?: SectionStyleResponsive<'left' | 'center' | 'right'>
  containerWidth?: SectionStyleResponsive<string>
  gap?: SectionStyleResponsive<string>
  typography?: SectionStyleResponsive<string>
}

export interface Section {
  id: string
  type: string
  props: Record<string, any>
  binding?: DataBinding
  style?: SectionStyle
}

export interface DataBinding {
  source: 'collection' | 'manual' | 'all'
  collection_id?: string
  handle?: string
  ids?: string[]
}

export interface Page {
  id: string
  title: string
  sections: string[]
}

export interface StoreDSL {
  template: string
  theme?: string
  pages: Page[]
  sections: Section[]
  tokens?: Record<string, any>
}

export interface Component {
  name: string
  category: string
  schema: Record<string, any>
  bindingSchema?: Record<string, any>
  editableProps: string[]
}

export interface ComponentRegistry {
  components: Component[]
}

export interface Product {
  id: string
  title: string
  price: number
  image?: string
}

export interface Collection {
  id: string
  title: string
  handle: string
}
