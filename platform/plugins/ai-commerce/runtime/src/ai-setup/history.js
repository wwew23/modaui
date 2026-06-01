const fs = require('fs')
const path = require('path')

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function historyPath(root, key) {
  return path.join(root, 'apps', 'api', 'templates', key, 'history.json')
}

function memoryPath(root, key) {
  return path.join(root, 'apps', 'api', 'templates', key, 'memory.json')
}

function appendEntry(templateKey, entry) {
  const ROOT = process.cwd()
  const outDir = path.join(ROOT, 'apps', 'api', 'templates', templateKey)
  ensureDir(outDir)
  const p = historyPath(ROOT, templateKey)
  let arr = []
  try { arr = JSON.parse(fs.readFileSync(p, 'utf-8')) } catch (e) { arr = [] }
  entry.id = (Date.now()).toString()
  entry.timestamp = new Date().toISOString()
  arr.push(entry)
  fs.writeFileSync(p, JSON.stringify(arr, null, 2))
  return entry
}

function listEntries(templateKey) {
  const ROOT = process.cwd()
  const p = historyPath(ROOT, templateKey)
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch (e) { return [] }
}

function undoLast(templateKey) {
  const ROOT = process.cwd()
  const p = historyPath(ROOT, templateKey)
  let arr = []
  try { arr = JSON.parse(fs.readFileSync(p, 'utf-8')) } catch (e) { arr = [] }
  const last = arr.pop()
  fs.writeFileSync(p, JSON.stringify(arr, null, 2))
  // if last contains snapshot path, return it for restoration
  if (last && last.snapshot) return { snapshot: last.snapshot, removed: last }
  return { snapshot: null, removed: last }
}

function writeMemory(templateKey, mem) {
  const ROOT = process.cwd()
  const p = memoryPath(ROOT, templateKey)
  const outDir = path.join(ROOT, 'apps', 'api', 'templates', templateKey)
  ensureDir(outDir)
  let cur = {}
  try { cur = JSON.parse(fs.readFileSync(p, 'utf-8')) } catch (e) { cur = {} }
  const merged = Object.assign({}, cur, mem)
  fs.writeFileSync(p, JSON.stringify(merged, null, 2))
  return merged
}

function readMemory(templateKey) {
  const ROOT = process.cwd()
  const p = memoryPath(ROOT, templateKey)
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch (e) { return {} }
}

module.exports = { appendEntry, listEntries, undoLast, writeMemory, readMemory }
