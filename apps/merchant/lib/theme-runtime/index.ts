import { StoreDSL, Section, Page } from './types'

export * from './types'

/**
 * Theme Runtime: 解析和管理 Store DSL
 */
export class ThemeRuntime {
  private dsl: StoreDSL

  constructor(dsl: StoreDSL) {
    this.dsl = dsl
  }

  /**
   * 获取 DSL
   */
  getDSL(): StoreDSL {
    return this.dsl
  }

  /**
   * 获取首页（通常是 pages[0]）
   */
  getHomePage(): Page | null {
    return this.dsl.pages?.[0] || null
  }

  /**
   * 获取页面中的所有 section
   */
  getPageSections(pageId: string): Section[] {
    const page = this.dsl.pages?.find(p => p.id === pageId)
    if (!page) return []
    const sectionMap = new Map(this.dsl.sections?.map(s => [s.id, s]))
    return (page.sections || []).map(sid => sectionMap.get(sid)).filter(Boolean) as Section[]
  }

  /**
   * 获取单个 section
   */
  getSection(sectionId: string): Section | null {
    return this.dsl.sections?.find(s => s.id === sectionId) || null
  }

  /**
   * 获取所有 sections
   */
  getAllSections(): Section[] {
    return this.dsl.sections || []
  }

  /**
   * 获取模板 ID
   */
  getTemplate(): string {
    return this.dsl.template
  }

  /**
   * 获取主题
   */
  getTheme(): string | undefined {
    return this.dsl.theme
  }

  /**
   * 检查 DSL 是否有效（基本验证）
   */
  isValid(): boolean {
    return !!(this.dsl.template && this.dsl.pages && this.dsl.sections)
  }
}

export default ThemeRuntime
