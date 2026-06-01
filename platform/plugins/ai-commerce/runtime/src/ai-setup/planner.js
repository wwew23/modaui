// Simple rule-based planner that turns a high-level prompt into actionable setup steps

function planFromPrompt(prompt) {
  const p = (prompt || '').toLowerCase()
  const steps = []

  // Basic industry detection
  if (p.includes('女装') || p.includes('fashion') || p.includes('clothes')) {
    steps.push({ id: 'theme', instruction: '选择一个适合女装的极简主题，调性为高级冷淡风' })
    steps.push({ id: 'branding', instruction: '生成品牌配色、主色、点缀色与 Logo 建议' })
    steps.push({ id: 'collections', instruction: '创建 2-3 个 collection: 热门商品、推荐、上新' })
    steps.push({ id: 'homepage', instruction: '生成首页结构：Hero (大图), FeatureSection, ProductGrid, Testimonials, Footer' })
    steps.push({ id: 'products', instruction: '生成产品展示风格与 CTA 层级' })
    steps.push({ id: 'navigation', instruction: '生成主导航和页脚导航结构' })
    steps.push({ id: 'publish', instruction: '检查并准备发布' })
    return { prompt, steps }
  }

  // fallback generic ecommerce plan
  steps.push({ id: 'theme', instruction: '选择通用电商主题并设置基础 tokens' })
  steps.push({ id: 'branding', instruction: '生成品牌配色与字体建议' })
  steps.push({ id: 'collections', instruction: '创建 collections (示例：all-products, featured)' })
  steps.push({ id: 'homepage', instruction: '生成首页基本区块：Hero, CTA, ProductGrid' })
  steps.push({ id: 'publish', instruction: '准备发布' })
  return { prompt, steps }
}

module.exports = { planFromPrompt }
