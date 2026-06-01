/**
 * AI-Driven Component & Design System Detection
 * Identifies common components (Hero, ProductGrid, Gallery, etc.)
 * Extracts colors, spacing, typography, container widths
 */

const componentPatterns = require('./patterns')

/**
 * Detect components based on patterns and names
 */
async function detectComponents(parsedTheme) {
  const detected = {
    components: [],
    uiHints: {}
  }

  const allContent = [
    ...parsedTheme.pages.map(p => p.content),
    ...parsedTheme.sections.map(s => s.content),
    ...parsedTheme.components.map(c => c.content)
  ].join('\n')

  // Check for common component patterns
  for (const [componentName, pattern] of Object.entries(componentPatterns)) {
    if (pattern.test(allContent)) {
      detected.components.push({
        name: componentName,
        category: getCategoryForComponent(componentName),
        pattern: pattern.source
      })
    }
  }

  // Add default components if none detected
  if (detected.components.length === 0) {
    detected.components = [
      { name: 'Hero', category: 'section' },
      { name: 'ProductGrid', category: 'section' },
      { name: 'Footer', category: 'section' }
    ]
  }

  return detected
}

function getCategoryForComponent(name) {
  const categories = {
    Hero: 'section',
    ProductGrid: 'section',
    ProductCard: 'component',
    Gallery: 'section',
    Testimonials: 'section',
    FAQ: 'section',
    Footer: 'section',
    Navbar: 'section',
    Button: 'component',
    Card: 'component',
    Image: 'component',
    Text: 'component'
  }
  return categories[name] || 'component'
}

/**
 * Extract design tokens from theme files
 */
async function extractDesignTokens(parsedTheme) {
  const tokens = {
    spacing: {},
    radius: {},
    colors: {},
    typography: {}
  }

  // Extract from CSS
  parsedTheme.styles.forEach(style => {
    if (style.values) {
      Object.assign(tokens.colors, style.values.colors || {})
      Object.assign(tokens.spacing, style.values.spacing || {})
      Object.assign(tokens.radius, style.values.radius || {})
    }
  })

  // Extract from React components (Tailwind sizes)
  const allContent = [
    ...parsedTheme.pages.map(p => p.content),
    ...parsedTheme.components.map(c => c.content)
  ].join('\n')

  // Extract Tailwind spacing (p-, m-, etc.)
  const tailwindSpacingPattern = /(?:p|m|gap)-(\d+|xs|sm|md|lg|xl|2xl)/g
  const spacingMatches = allContent.match(tailwindSpacingPattern) || []
  spacingMatches.forEach(match => {
    const size = match.split('-')[1]
    if (!tokens.spacing[size]) tokens.spacing[size] = size
  })

  // Extract colors from classes
  const colorPattern = /(?:bg|text|border)-(\w+)(?:-(\d+))?/g
  const colorMatches = allContent.match(colorPattern) || []
  colorMatches.forEach(match => {
    const parts = match.split('-')
    const color = parts.slice(1, -1).join('-')
    if (!tokens.colors[color]) tokens.colors[color] = color
  })

  // Default tokens if none found
  if (Object.keys(tokens.spacing).length === 0) {
    tokens.spacing = { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' }
  }
  if (Object.keys(tokens.colors).length === 0) {
    tokens.colors = { primary: '#0b5fff', secondary: '#0ea5a4', muted: '#6b7280' }
  }

  return tokens
}

module.exports = {
  detectComponents,
  extractDesignTokens
}
