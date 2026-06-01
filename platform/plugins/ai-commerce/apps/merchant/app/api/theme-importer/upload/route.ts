import { NextRequest, NextResponse } from 'next/server'
import { generateThemeFromZip } from '../../../../../../apps/api/src/theme-importer/service'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, fileBase64, url, autoFix } = body
    if (!fileBase64 && !url) return NextResponse.json({ error: 'fileBase64 or url is required' }, { status: 400 })

    const tmp = '/tmp'
    await fs.promises.mkdir(tmp, { recursive: true })
    const zipPath = path.join(tmp, `upload-${Date.now()}.zip`)

    if (fileBase64) {
      const buf = Buffer.from(fileBase64, 'base64')
      await fs.promises.writeFile(zipPath, buf)
    } else if (url) {
      // download
      const res = await fetch(url)
      if (!res.ok) return NextResponse.json({ error: 'Failed to download url' }, { status: 400 })
      const arrayBuf = await res.arrayBuffer()
      await fs.promises.writeFile(zipPath, Buffer.from(arrayBuf))
    }

    const result = await generateThemeFromZip(zipPath, name)
    // If autofix requested and only warnings, attempt fixes
    if (autoFix && result && result.validation && result.validation.valid === true && result.validation.warnings && result.validation.warnings.length > 0) {
      try {
        const { autoFixTemplate, validateTemplate } = await import('../../../../../../apps/api/src/theme-importer/validator')
        const { fixedTemplate, fixes } = autoFixTemplate(result.template)
        const recheck = validateTemplate(fixedTemplate)
        if (recheck.valid) {
          return NextResponse.json({ ok: true, template: fixedTemplate, key: result.key, fixes })
        } else {
          return NextResponse.json({ ok: false, key: result.key, errors: recheck.errors, fixes }, { status: 400 })
        }
      } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || 'autofix failed' }, { status: 500 })
      }
    }

    if (result.validation && result.validation.valid === false) {
      return NextResponse.json({ ok: false, key: result.key, errors: result.validation.errors, template: result.template }, { status: 400 })
    }
    // success, may include warnings
    return NextResponse.json({ ok: true, template: result.template, key: result.key, warnings: result.validation?.warnings || [] })
  } catch (err: any) {
    console.error('theme-importer upload error', err)
    return NextResponse.json({ error: err?.message || 'import failed' }, { status: 500 })
  }
}
