import { Request, Response } from 'express';
import { generatePatch } from './service';

// Simple HTTP handler to integrate into apps/api routes.
export default async function templateAssistantHandler(req: Request, res: Response) {
  try {
    const { templateId, instruction } = req.body;
    if (!instruction) return res.status(400).json({ error: 'instruction required' });
    const patch = await generatePatch(String(templateId || 'luxury-fashion'), String(instruction));
    return res.json({ ok: true, patch });
  } catch (err: any) {
    console.error('templateAssistant error', err);
    return res.status(500).json({ error: err?.message || 'internal' });
  }
}
