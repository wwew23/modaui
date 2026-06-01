// In-memory theme store per store_id (demo only)
const REAL_DATA_ONLY = process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true'
const themes = new Map()
const published = new Map()

function ensureThemeStoreAllowed() {
  if (REAL_DATA_ONLY) {
    throw new Error('REAL_DATA_ONLY active — in-memory theme store is disabled')
  }
}

function saveTheme(store_id, themeObj) {
  ensureThemeStoreAllowed()
  themes.set(String(store_id), Object.assign({}, themeObj))
}

function getTheme(store_id) {
  if (REAL_DATA_ONLY) ensureThemeStoreAllowed()
  return themes.get(String(store_id)) || null
}

function publishTheme(store_id) {
  if (REAL_DATA_ONLY) ensureThemeStoreAllowed()
  const t = themes.get(String(store_id))
  if (!t) return null
  published.set(String(store_id), Object.assign({}, t))
  return published.get(String(store_id))
}

function getPublishedTheme(store_id) {
  if (REAL_DATA_ONLY) ensureThemeStoreAllowed()
  return published.get(String(store_id)) || null
}

module.exports = { saveTheme, getTheme, publishTheme, getPublishedTheme }
