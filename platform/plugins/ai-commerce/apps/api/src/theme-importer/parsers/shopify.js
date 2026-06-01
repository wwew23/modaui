/**
 * Shopify Liquid Theme Parser
 * Extracts sections, templates, assets (CSS, JS, images)
 */

const { findFiles, extractCSSValues } = require('../utils')

function parseShopifyTheme(files) {
  const result = {
    pages: [],
    sections: [],
    styles: [],
    components: [],
    assets: {}
  }

  // Find Liquid section files
  const sectionFiles = findFiles(files, [/\.shopify\/themes\/.*?\/sections\/.+\.liquid$/i, /sections\/.+\.liquid$/i])
  result.sections = sectionFiles.map(({ path, content }) => ({
    id: path.split('/').pop().replace('.liquid', ''),
    path,
    type: 'liquid',
    content
  }))

  // Find template files (pages)
  const templateFiles = findFiles(files, [/\.shopify\/themes\/.*?\/templates\/.+\.liquid$/i, /templates\/.+\.liquid$/i])
  result.pages = templateFiles.map(({ path, content }) => ({
    id: path.split('/').pop().replace('.liquid', ''),
    path,
    type: 'liquid',
    content
  }))

  // Extract CSS from assets
  const cssFiles = findFiles(files, [/\.css$/i])
  result.styles = cssFiles.map(({ path, content }) => ({
    path,
    content,
    values: extractCSSValues(content)
  }))

  // Collect assets (images, fonts, etc.)
  const assetFiles = findFiles(files, [/assets\/(.*\.(jpg|jpeg|png|gif|svg|woff|woff2|ttf))$/i])
  assetFiles.forEach(({ path }) => {
    result.assets[path] = true
  })

  return result
}

module.exports = {
  parseShopifyTheme
}
