/**
 * Theme Importer System
 * Converts external themes (Shopify, Next.js, Tailwind, etc.) into ModaUI format
 * Pipeline: Upload -> Parse -> AI Detect -> Registry Compile -> Import
 */

const fs = require('fs')
const path = require('path')
const { unzipTheme } = require('./utils')
const { parseThemeFiles } = require('./parsers/index')
const { detectComponents, extractDesignTokens } = require('./detectors/index')
const { compileRegistry, compileTemplate, compileTokens } = require('./compilers/index')

/**
 * Main importer pipeline
 * @param {Object} options - { zipBuffer, themeType, themeName, storeId }
 * @returns {Object} - { registry, template, tokens, uiHints, assets, summary }
 */
async function importTheme(options) {
  const { zipBuffer, themeType, themeName, storeId } = options
  if (!zipBuffer) throw new Error('Theme ZIP buffer required')
  if (!themeType) throw new Error('Theme type required (shopify|nextjs|tailwind|html|jsx)')

  console.log(`[ThemeImporter] Starting import: type=${themeType}, name=${themeName}`)

  try {
    // Step 1: Extract and parse theme files
    const extractedFiles = await unzipTheme(zipBuffer)
    console.log(`[ThemeImporter] Extracted ${Object.keys(extractedFiles).length} files`)

    const parsedTheme = await parseThemeFiles(extractedFiles, themeType)
    console.log(`[ThemeImporter] Parsed theme structure:`, {
      pages: parsedTheme.pages.length,
      sections: parsedTheme.sections.length,
      styles: parsedTheme.styles.length,
      components: parsedTheme.components.length
    })

    // Step 2: AI-driven component detection and design system extraction
    const detected = await detectComponents(parsedTheme)
    const tokens = await extractDesignTokens(parsedTheme)
    console.log(`[ThemeImporter] Detected ${detected.components.length} components`)
    console.log(`[ThemeImporter] Extracted tokens:`, Object.keys(tokens))

    // Step 3: Compile into ModaUI format
    const registry = compileRegistry(detected.components, tokens)
    const template = compileTemplate(parsedTheme, detected, themeName)
    const compiledTokens = compileTokens(tokens, detected)
    const uiHints = detected.uiHints || {}

    const result = {
      registry,
      template,
      tokens: compiledTokens,
      uiHints,
      assets: parsedTheme.assets || {},
      summary: {
        type: themeType,
        name: themeName,
        storeId,
        componentsCount: detected.components.length,
        sectionsCount: parsedTheme.sections.length,
        tokenCategories: Object.keys(compiledTokens)
      }
    }

    console.log(`[ThemeImporter] Import complete. Summary:`, result.summary)
    return result
  } catch (err) {
    console.error('[ThemeImporter] Error:', err.message)
    throw err
  }
}

module.exports = {
  importTheme
}
