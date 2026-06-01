import { NextRequest, NextResponse } from 'next/server'
import { generatePatch } from '../../../../api/src/template-assistant/service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { templateId, instruction, context } = body
    if (!instruction) return NextResponse.json({ error: 'instruction is required' }, { status: 400 })

    const patches = await generatePatch(String(templateId || 'luxury-fashion'), String(instruction), context || {})
    return NextResponse.json({ patch: patches })
  } catch (err: any) {
    console.error('template-assistant route error', err)
    return NextResponse.json({ error: err?.message || 'internal' }, { status: 500 })
  }
}
