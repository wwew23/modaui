import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get('key') || 'test-theme'
    const root = process.cwd()
    const historyPath = path.join(root, 'apps', 'api', 'templates', key, 'history.json')
    const memoryPath = path.join(root, 'apps', 'api', 'templates', key, 'memory.json')
    const setupPath = path.join(root, 'apps', 'api', 'templates', key, 'setup-result.json')

    const history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf-8')) : []
    const memory = fs.existsSync(memoryPath) ? JSON.parse(fs.readFileSync(memoryPath, 'utf-8')) : {}
    const setup = fs.existsSync(setupPath) ? JSON.parse(fs.readFileSync(setupPath, 'utf-8')) : null

    return NextResponse.json({ ok: true, key, history, memory, setup })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
