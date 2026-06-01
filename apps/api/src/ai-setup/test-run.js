const path = require('path')
const fs = require('fs')
const planner = require('./planner')
const engine = require('./engine')

function tryReadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch (e) { return null }
}

async function run() {
  const sampleKey = 'test-theme'
  const publishedPath = path.join(process.cwd(), 'apps', 'api', 'templates', sampleKey, 'published.json')
  const published = tryReadJson(publishedPath)
  if (!published) {
    console.log('Published sample not found; run apps/api/src/theme-importer/test-run.js first')
    return
  }

  const plan = planner.planFromPrompt('女装 高级冷淡风')
  console.log('Planner produced steps:', plan.steps.map(s => s.id))

  const res = await engine.executePlan(plan, published, sampleKey)
  console.log('Setup flow completed. Result written to', res.finalPath)
  console.log('Logs:')
  console.log(JSON.stringify(res.logs, null, 2))
}

run()
