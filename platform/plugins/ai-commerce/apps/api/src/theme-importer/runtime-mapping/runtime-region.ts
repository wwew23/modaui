export const AI_REGION_START_PREFIX = 'MDAI_REGION_START:';
export const AI_REGION_END_PREFIX = 'MDAI_REGION_END:';

export type AiRegionId = string;

export type AiRegion = {
  id: AiRegionId;
  file: string;
  start: number; // offset
  end: number;   // offset
};

/**
 * 从源码中检测 AI 管理的区域
 */
export function detectAiRegions(filePath: string, source: string): AiRegion[] {
  const regions: AiRegion[] = [];

  const startRegex = /\{%\s*comment\s*%\}\s*([\s\S]*?)\s*\{%\s*endcomment\s*%\}/g;
  
  const matches: {
    type: 'start' | 'end';
    id: string;
    offset: number;
    length: number;
  }[] = [];

  let match: RegExpExecArray | null;
  while ((match = startRegex.exec(source))) {
    const raw = match[1].trim();
    const offset = match.index;
    const length = match[0].length;
    
    if (raw.startsWith(AI_REGION_START_PREFIX)) {
      const id = raw.substring(AI_REGION_START_PREFIX.length).trim();
      matches.push({ type: 'start', id, offset, length });
    } else if (raw.startsWith(AI_REGION_END_PREFIX)) {
      const id = raw.substring(AI_REGION_END_PREFIX.length).trim();
      matches.push({ type: 'end', id, offset, length });
    }
  }

  const stack: Record<string, { offset: number; length: number }[]> = {};

  for (const m of matches) {
    if (m.type === 'start') {
      stack[m.id] = stack[m.id] || [];
      stack[m.id].push({ offset: m.offset, length: m.length });
    } else {
      const arr = stack[m.id];
      if (!arr || arr.length === 0) {
        continue;
      }
      const startInfo = arr.pop()!;
      regions.push({
        id: m.id,
        file: filePath,
        start: startInfo.offset,
        end: m.offset + m.length
      });
    }
  }

  return regions;
}

/**
 * 给定 region id，生成 Liquid 注释包裹
 */
export function wrapWithAiRegion(id: AiRegionId, inner: string): string {
  return [
    '{% comment %}',
    `${AI_REGION_START_PREFIX}${id}`,
    '{% endcomment %}',
    '',
    inner,
    '',
    '{% comment %}',
    `${AI_REGION_END_PREFIX}${id}`,
    '{% endcomment %}'
  ].join('\n');
}
