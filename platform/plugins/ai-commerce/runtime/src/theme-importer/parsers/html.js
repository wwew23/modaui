/**
 * HTML Theme Parser
 * Extracts HTML components, styles, structure
 */

const { findFiles, extractCSSValues } = require('../utils')

function parseHTMLTheme(files) {
  const result = {
    pages: [],
    sections: [],
    styles: [],
    components: [],
    assets: {}
  }

  // Find HTML files as pages
  const htmlFiles = findFiles(files, [/\.html?$/i])
  result.pages = htmlFiles.map(({ path, content }) => ({
    id: path.split('/').pop().replace(/\.html?/, ''),
    path,
    type: 'html',
    content
  }))

  // Extract CSS
  const cssFiles = findFiles(files, [/\.css$/i])
  result.styles = cssFiles.map(({ path, content }) => ({
    path,
    content,
    values: extractCSSValues(content)
  }))

  // Parse HTML to detect components (div.section, section, article patterns)
  htmlFiles.forEach(({ content }) => {
    const sectionRegex = /(?:<section[^>]*>|<div[^>]*class=['"]*[^'"]*section[^'"]*['"]?[^>]*>)/gi
    let match
    while ((match = sectionRegex.exec(content)) !== null) {
      // Extract section pattern
      result.sections.push({
        id: `html-section-${result.sections.length}`,
        type: 'html-block',
        pattern: match[0]
      })
    }
  })

  return result
}

module.exports = {
  parseHTMLTheme
}
