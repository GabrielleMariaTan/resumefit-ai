import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '../client';
import type { RequirementWithEvidence, TailoredBullet } from '../types';

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are a resume rewriting specialist for career switchers.

Your job: given job requirements and supporting evidence from the candidate's original resume, rewrite each evidence span as a polished, professional resume bullet that speaks the target job's vocabulary.

Rules:
- Use the target industry's language and terminology to reframe the candidate's real experience
- Stay strictly factually bounded by the sourceSpans provided — do not invent numbers, titles, scope, or accomplishments not present in the evidence
- Every bullet must include a sourceSpans field containing the specific resume text it was grounded in
- If you cannot write a bullet that is honestly grounded in the provided evidence, omit it entirely — never fabricate
- Output valid JSON only, no prose, no markdown fences

Output format:
{
  "bullets": [
    {
      "id": "bullet_1",
      "rewrittenText": "<polished bullet using target job vocabulary>",
      "linkedRequirementIds": ["<requirementId this bullet addresses>"],
      "sourceSpans": ["<exact or very close paraphrase of the resume evidence this is grounded in>"]
    }
  ]
}`;

export async function generateRewrite(
  requirements: RequirementWithEvidence[],
): Promise<TailoredBullet[]> {
  // Code-level enforcement: filter before the API call so the model never
  // even sees requirements it shouldn't generate bullets for.
  const supported = requirements.filter(
    (r) => r.evidenceStrength !== 'none' && r.sourceSpans.length > 0,
  );

  if (supported.length === 0) return [];

  const raw = await callWithRetry(supported);
  return parseAndValidate(raw);
}

async function callWithRetry(supported: RequirementWithEvidence[]): Promise<string> {
  const userMessage = buildUserMessage(supported);

  const first = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = extractText(first.content);

  try {
    JSON.parse(text);
    return text;
  } catch {
    const retry = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system:
        SYSTEM_PROMPT +
        '\n\nIMPORTANT: Your previous response was not valid JSON. Output ONLY the JSON object. No markdown, no code fences, no explanation.',
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: text },
        { role: 'user', content: 'That response was not valid JSON. Please output only the JSON object.' },
      ],
    });
    return extractText(retry.content);
  }
}

function buildUserMessage(supported: RequirementWithEvidence[]): string {
  return [
    'REQUIREMENTS WITH SUPPORTING EVIDENCE:',
    JSON.stringify(
      supported.map((r) => ({
        id: r.id,
        requirementText: r.requirementText,
        evidenceStrength: r.evidenceStrength,
        sourceSpans: r.sourceSpans,
      })),
      null,
      2,
    ),
  ].join('\n');
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  const block = content.find((b) => b.type === 'text');
  return block?.type === 'text' ? block.text.trim() : '';
}

function parseAndValidate(raw: string): TailoredBullet[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Rewrite generation: AI returned invalid JSON after retry');
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as Record<string, unknown>).bullets)
  ) {
    throw new Error('Rewrite generation: AI response missing "bullets" array');
  }

  const bullets = (data as { bullets: unknown[] }).bullets;
  const result: TailoredBullet[] = [];

  for (let i = 0; i < bullets.length; i++) {
    const item = bullets[i];
    if (typeof item !== 'object' || item === null) continue;

    const b = item as Record<string, unknown>;

    const rewrittenText = typeof b.rewrittenText === 'string' ? b.rewrittenText.trim() : '';
    const linkedRequirementIds = Array.isArray(b.linkedRequirementIds)
      ? b.linkedRequirementIds.filter((id): id is string => typeof id === 'string')
      : [];
    const sourceSpans = Array.isArray(b.sourceSpans)
      ? b.sourceSpans.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [];

    // Hard constraint: a bullet with no rewrittenText or no sourceSpans is silently dropped.
    // Empty sourceSpans means the bullet can't be traced — fail safe by omitting it.
    if (!rewrittenText || sourceSpans.length === 0) continue;

    result.push({
      id: typeof b.id === 'string' && b.id ? b.id : `bullet_${i + 1}`,
      rewrittenText,
      linkedRequirementIds,
      sourceSpans,
    });
  }

  return result;
}
