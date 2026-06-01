/**
 * React/Next.js/JSX Theme Parser
 * Extracts React components, styles, structure
 */

const { findFiles, extractCSSValues } = require('../utils')

function parseReactTheme(files) {
  const result = {
    pages: [],
    sections: [],
    styles: [],
    components: [],
    assets: {}
  }

  // Find React/JSX component files
  const componentFiles = findFiles(files, [/\.(jsx?|tsx?)$/i])
  result.components = componentFiles.map(({ path, content }) => ({
    id: path.split('/').pop().replace(/\.(jsx?|tsx?)$/, ''),
    path,
    type: 'jsx',
    content
  }))

  // Find pages (Next.js pattern: pages/ or app/ directories)
  const pageFiles = findFiles(files, [/pages\/.*\.(jsx?|tsx?)$/i, /app\/.*\/(page|layout)\.(jsx?|tsx?)$/i])
  result.pages = pageFiles.map(({ path, content }) => ({
    id: path.split('/').pop().replace(/\.(jsx?|tsx?)$/, ''),
    path,
    type: 'jsx',
    content
  }))

  // Extract CSS Modules and global styles
  const cssFiles = findFiles(files, [/\.module\.css$/i, /globals?\.css$/i, /styles\/.*\.css$/i])
  result.styles = cssFiles.map(({ path, content }) => ({
    path,
    content,
    values: extractCSSValues(content)
  }))

  // Parse for Tailwind config if present
  const tailwindConfigFile = componentFiles.find(f => f.path.includes('tailwind.config'))
  if (tailwindConfigFile) {
    result.tailwindConfig = tailwindConfigFile.content
  }

  return result
}

module.exports = {
  parseReactTheme
}
