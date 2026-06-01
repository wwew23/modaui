const fs = require('fs')
const path = require('path')
const assistant = require('../template-assistant/service.js')
const history = require('./history')


function applyPatches(runtimeTemplate, patches) {
  const prev = JSON.parse(JSON.stringify(runtimeTemplate))
  for (const p of patches) {
    if (p.sectionId === 'global') {
      runtimeTemplate.root.props = Object.assign({}, runtimeTemplate.root.props, p.changes.props || {})
      if (p.changes.style) runtimeTemplate.tokens = Object.assign({}, runtimeTemplate.tokens, p.changes.style || {})
    } else {
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
  return prev
}

async function executePlan(plan, runtimeTemplate, templateKey, opts = {}) {
  const ROOT = process.cwd()
  const outDir = path.join(ROOT, 'apps', 'api', 'templates', templateKey || `setup-${Date.now()}`)
  fs.mkdirSync(outDir, { recursive: true })

  const logs = []

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i]
    logs.push({ step: step.id, instruction: step.instruction, status: 'running', patches: null, error: null })
    try {
      const patches = await assistant.generatePatch(templateKey, step.instruction, { store: runtimeTemplate, stepIndex: i })
      logs[logs.length-1].patches = patches
      const prev = applyPatches(runtimeTemplate, patches)
      const snapPath = path.join(outDir, `snapshot-step-${i}-${step.id}.json`)
      fs.writeFileSync(snapPath, JSON.stringify(runtimeTemplate, null, 2))
      // append to history
      try {
        history.appendEntry(templateKey, { type: 'step', stepId: step.id, instruction: step.instruction, patches, snapshot: snapPath })
        // write inferred memory (simple heuristic: if instruction mentions style words)
        if (step.instruction && /女装|高级|冷淡|luxury|apple|珠宝/i.test(step.instruction)) {
          history.writeMemory(templateKey, { brandTone: 'luxury', lastSetup: step.instruction })
        }
      } catch (e) {
        // not fatal, log
        console.error('history append failed', e)
      }
      logs[logs.length-1].status = 'done'
      logs[logs.length-1].snapshot = snapPath
    } catch (err) {
      logs[logs.length-1].status = 'error'
      logs[logs.length-1].error = String(err)
      break
    }
  }

  const finalPath = path.join(outDir, 'setup-result.json')
  fs.writeFileSync(finalPath, JSON.stringify({ template: runtimeTemplate, logs }, null, 2))

  return { outDir, finalPath, logs }
}

module.exports = { executePlan }
