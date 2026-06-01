// In-memory theme store per store_id (demo only)
const themes = new Map()
const published = new Map()

function saveTheme(store_id, themeObj) {
  themes.set(String(store_id), Object.assign({}, themeObj))
}

function getTheme(store_id) {
  return themes.get(String(store_id)) || null
}

function publishTheme(store_id) {
  const t = themes.get(String(store_id))
  if (!t) return null
  published.set(String(store_id), Object.assign({}, t))
  return published.get(String(store_id))
}

function getPublishedTheme(store_id) {
  return published.get(String(store_id)) || null
}

module.exports = { saveTheme, getTheme, publishTheme, getPublishedTheme }
