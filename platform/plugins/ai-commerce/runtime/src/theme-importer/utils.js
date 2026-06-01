const AdmZip = require('adm-zip')

/**
 * Extract ZIP buffer into file map
 * @param {Buffer} zipBuffer
 * @returns {Promise<Object>} - { filePath: fileContent, ... }
 */
async function unzipTheme(zipBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(zipBuffer)
      const files = {}
      
      zip.getEntries().forEach(entry => {
        if (!entry.isDirectory) {
          const filePath = entry.entryName.replace(/\\/g, '/')
          files[filePath] = entry.getData().toString('utf8')
        }
      })
      
      resolve(files)
    } catch (err) {
      reject(new Error(`Failed to extract ZIP: ${err.message}`))
    }
  })
}

/**
 * Find files matching pattern
 */
function findFiles(files, patterns) {
  const results = []
  for (const [path, content] of Object.entries(files)) {
    if (patterns.some(p => path.match(p))) {
      results.push({ path, content })
    }
  }
  return results
}

/**
 * Extract CSS values (colors, spacing, etc.)
 */
function extractCSSValues(cssContent) {
  const values = {
    colors: {},
    spacing: {},
    radius: {},
    shadows: {}
  }

  // Extract CSS variables --color-*, --spacing-*, etc.
  const varPattern = /--([a-z-]+):\s*([^;]+);/gi
  let match
  while ((match = varPattern.exec(cssContent)) !== null) {
    const [, name, value] = match
    if (name.startsWith('color')) values.colors[name.replace('color-', '')] = value.trim()
    if (name.startsWith('spacing')) values.spacing[name.replace('spacing-', '')] = value.trim()
    if (name.startsWith('radius')) values.radius[name.replace('radius-', '')] = value.trim()
    if (name.startsWith('shadow')) values.shadows[name.replace('shadow-', '')] = value.trim()
  }

  return values
}

module.exports = {
  unzipTheme,
  findFiles,
  extractCSSValues
}
