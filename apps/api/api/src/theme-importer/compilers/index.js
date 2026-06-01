/**
 * Registry, Template & Token Compilers
 * Converts detected components and tokens into ModaUI format
 */

function compileRegistry(components, tokens) {
  return {
    components: components.map(comp => ({
      name: comp.name,
      category: comp.category,
      schema: generateSchemaForComponent(comp.name),
      bindingSchema: generateBindingSchema(comp.category),
      uiHints: generateUIHints(comp.name)
    }))
  }
}

function compileTemplate(parsedTheme, detected, themeName) {
  return {
    name: themeName || 'Imported Theme',
    description: `Imported from ${parsedTheme.pages.length} pages and ${parsedTheme.sections.length} sections`,
    sections: detected.components.map((comp, idx) => ({
      id: `section-${idx}`,
      name: comp.name,
      type: comp.name,
      icon: getIconForComponent(comp.name)
    }))
  }
}

function compileTokens(extractedTokens, detected) {
  return {
    spacing: normalizeSpacingTokens(extractedTokens.spacing),
    radius: normalizeRadiusTokens(extractedTokens.radius),
    colors: normalizeColorTokens(extractedTokens.colors),
    typography: extractedTokens.typography || {}
  }
}

function generateSchemaForComponent(componentName) {
  const schemas = {
    Hero: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        image: { type: 'string' },
        cta: { type: 'string' }
      }
    },
    ProductGrid: {
      type: 'object',
      properties: {
        columns: { type: 'number', default: 3 },
        limit: { type: 'number', default: 12 }
      }
    },
    ProductCard: {
      type: 'object',
      properties: {
        showPrice: { type: 'boolean', default: true },
        showRating: { type: 'boolean', default: true }
      }
    },
    Gallery: {
      type: 'object',
      properties: {
        autoplay: { type: 'boolean' },
        showThumbnails: { type: 'boolean' }
      }
    },
    Footer: {
      type: 'object',
      properties: {
        columns: { type: 'number', default: 4 }
      }
    }
  }
  return schemas[componentName] || { type: 'object', properties: {} }
}

function generateBindingSchema(category) {
  if (category === 'section') {
    return {
      type: 'object',
      properties: {
        collectionId: { type: 'string' },
        limit: { type: 'number' }
      }
    }
  }
  return { type: 'object', properties: {} }
}

function generateUIHints(componentName) {
  const hints = {
    Hero: { image: { type: 'image', label: 'Hero Image' }, title: { type: 'text', label: 'Title' } },
    ProductGrid: { columns: { type: 'slider', min: 1, max: 6, label: 'Columns' } },
    Gallery: { autoplay: { type: 'toggle', label: 'Auto Play' } }
  }
  return hints[componentName] || {}
}

function getIconForComponent(componentName) {
  return '📦' // Default icon
}

function normalizeSpacingTokens(spacing) {
  const normalized = {}
  for (const [key, value] of Object.entries(spacing)) {
    normalized[key] = value.toString().replace(/[^\d.]/g, '') + 'px'
  }
  return normalized
}

function normalizeRadiusTokens(radius) {
  const normalized = {}
  for (const [key, value] of Object.entries(radius)) {
    normalized[key] = value.toString().replace(/[^\d.]/g, '') + 'px'
  }
  return normalized
}

function normalizeColorTokens(colors) {
  const normalized = {}
  for (const [key, value] of Object.entries(colors)) {
    // Basic color normalization (could be expanded with color parsing)
    normalized[key] = value.toString().trim()
  }
  return normalized
}

module.exports = {
  compileRegistry,
  compileTemplate,
  compileTokens
}
