import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, key, entryId } = body
    if (!action || !key) return NextResponse.json({ ok: false, error: 'action and key required' }, { status: 400 })
    const root = process.cwd()
    const historyPath = path.join(root, 'apps', 'api', 'templates', key, 'history.json')
    const publishedPath = path.join(root, 'apps', 'api', 'templates', key, 'published.json')

    const history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf-8')) : []

    if (action === 'undo') {
      // remove last entry
      const last = history.pop()
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
      return NextResponse.json({ ok: true, removed: last })
    }

    if (action === 'approve') {
      if (!entryId) return NextResponse.json({ ok: false, error: 'entryId required for approve' }, { status: 400 })
      const entry = history.find(e => e.id === entryId)
      if (!entry) return NextResponse.json({ ok: false, error: 'entry not found' }, { status: 404 })
      if (!entry.snapshot) return NextResponse.json({ ok: false, error: 'entry has no snapshot to restore' }, { status: 400 })
      const snap = fs.readFileSync(entry.snapshot, 'utf-8')
      fs.writeFileSync(publishedPath, snap)
      // append an approval record
      history.push({ id: (Date.now()).toString(), type: 'approval', entryId, timestamp: new Date().toISOString() })
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
      return NextResponse.json({ ok: true, published: publishedPath })
    }

    if (action === 'restore') {
      if (!entryId) return NextResponse.json({ ok: false, error: 'entryId required for restore' }, { status: 400 })
      const entry = history.find(e => e.id === entryId)
      if (!entry) return NextResponse.json({ ok: false, error: 'entry not found' }, { status: 404 })
      if (!entry.snapshot) return NextResponse.json({ ok: false, error: 'entry has no snapshot to restore' }, { status: 400 })
      const snap = fs.readFileSync(entry.snapshot, 'utf-8')
      fs.writeFileSync(publishedPath, snap)
      return NextResponse.json({ ok: true, restored: publishedPath })
    }

    return NextResponse.json({ ok: false, error: 'unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
