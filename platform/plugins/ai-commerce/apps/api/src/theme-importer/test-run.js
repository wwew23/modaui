const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')

async function run() {
  const tempDir = path.join('/tmp', `modaui-test-theme-${Date.now()}`)
  fs.mkdirSync(tempDir, { recursive: true })

  // create sample Shopify-like sections
  const sectionsDir = path.join(tempDir, 'sections')
  fs.mkdirSync(sectionsDir, { recursive: true })

  const heroContent = `<!-- Hero -->\n{% schema %}{"name":"Hero","settings":[{"type":"text","id":"title","default":"Welcome"},{"type":"color","id":"bg","default":"#ff0000"}]}{% endschema %}\n<div class=\"hero\">{{ settings.title }}</div>`
  fs.writeFileSync(path.join(sectionsDir, 'hero.liquid'), heroContent)

  const productGridContent = `{% schema %}{"name":"Product Grid","settings":[{"type":"text","id":"title","default":"Products"}]}{% endschema %}\n<div class=\"products\">..</div>`
  fs.writeFileSync(path.join(sectionsDir, 'product-grid.liquid'), productGridContent)

  // broken liquid
  const brokenContent = `{% schema %}{"name":"Broken Section","settings":[{"type":"text","id":"title","default":"Broken"}]{% endschema %}\n<div>oops</div>`
  fs.writeFileSync(path.join(sectionsDir, 'broken.liquid'), brokenContent)

  // create assets
  const assetsDir = path.join(tempDir, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })
  fs.writeFileSync(path.join(assetsDir, 'style.css'), '.hero{padding:24px;max-width:1200px;color:#ff0000}')

  // zip
  const zip = new AdmZip()
  function addFolderToZip(folder, base) {
    const files = fs.readdirSync(folder)
    for (const f of files) {
      const full = path.join(folder, f)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) addFolderToZip(full, path.join(base, f))
      else zip.addFile(path.join(base, f), fs.readFileSync(full))
    }
  }
  addFolderToZip(tempDir, '')
  const zipPath = path.join('/tmp', `modaui-test-${Date.now()}.zip`)
  zip.writeZip(zipPath)
  console.log('Created test zip at', zipPath)

  // call importer service
  const importer = require('./service')
  try {
    const result = await importer.generateThemeFromZip(zipPath, 'test-theme')
    console.log('Import result key:', result.key)
    console.log('Detected sections:', result.detectedSections.map(s => ({filename:s.filename, type:s.type})))
    console.log('Tokens:', result.tokens)
    console.log('Validation:', result.validation)

    if (result.validation && result.validation.valid === false) {
      console.log('Validation failed with errors:')
      console.log(JSON.stringify(result.validation.errors, null, 2))
    }

    // simulate editor hydration
    let runtimeTemplate = result.template
    console.log('Runtime template root title:', runtimeTemplate.root.props.title)

    // apply AI patch using template-assistant rule-based fallback
    const assistant = require(path.join(__dirname, '..', 'template-assistant', 'service.js'))
    const patches = await assistant.generatePatch(result.key, '更像 Apple，留白更多', { store: runtimeTemplate })
    console.log('Generated patches:', patches)

    // apply patches (simple merge)
    const prev = JSON.parse(JSON.stringify(runtimeTemplate))
    for (const p of patches) {
      if (p.sectionId === 'global') {
        runtimeTemplate.root.props = Object.assign({}, runtimeTemplate.root.props, p.changes.props || {})
        runtimeTemplate.tokens = Object.assign({}, runtimeTemplate.tokens, p.changes.style || {})
      } else {
        // try numeric index
        const idx = Number(p.sectionId)
        if (!isNaN(idx) && runtimeTemplate.content[idx]) {
          runtimeTemplate.content[idx].props = Object.assign({}, runtimeTemplate.content[idx].props, p.changes.props || {})
          runtimeTemplate.content[idx].props.style = Object.assign({}, runtimeTemplate.content[idx].props.style || {}, p.changes.style || {})
        } else {
          const found = runtimeTemplate.content.find(c => c.type === p.sectionId)
          if (found) {
            found.props = Object.assign({}, found.props, p.changes.props || {})
            found.props.style = Object.assign({}, found.props.style || {}, p.changes.style || {})
          }
        }
      }
    }
    console.log('Applied patches. New root title:', runtimeTemplate.root.props.title)

    // undo
    runtimeTemplate = prev
    console.log('Undo applied. Restored root title:', runtimeTemplate.root.props.title)

    // save draft
    const outPath = path.join('/tmp', `${result.key}-draft.json`)
    fs.writeFileSync(outPath, JSON.stringify(runtimeTemplate, null, 2))
    console.log('Saved draft to', outPath)

    // publish (simulate by copying to apps/api/templates/<key>/published.json)
    const publishPath = path.join(result.outDir, 'published.json')
    fs.writeFileSync(publishPath, JSON.stringify(runtimeTemplate, null, 2))
    console.log('Published to', publishPath)

    console.log('End-to-end test completed successfully')
  } catch (err) {
    console.error('Import pipeline error:', err)
    process.exit(2)
  }
}

run()
