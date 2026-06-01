/**
 * Theme File Parsers
 * Supports: Shopify (Liquid), HTML, JSX/TSX, Next.js, Tailwind
 */

const { parseShopifyTheme } = require('./shopify')
const { parseHTMLTheme } = require('./html')
const { parseReactTheme } = require('./react')
const { findFiles } = require('../utils')

async function parseThemeFiles(files, themeType) {
  console.log(`[Parser] Parsing theme type: ${themeType}`)

  switch (themeType.toLowerCase()) {
    case 'shopify':
      return parseShopifyTheme(files)
    case 'html':
      return parseHTMLTheme(files)
    case 'jsx':
    case 'tsx':
    case 'react':
    case 'nextjs':
      return parseReactTheme(files)
    case 'tailwind':
      return parseReactTheme(files) // Tailwind is usually React/HTML
    default:
      throw new Error(`Unsupported theme type: ${themeType}`)
  }
}

module.exports = {
  parseThemeFiles
}
