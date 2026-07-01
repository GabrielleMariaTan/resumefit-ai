import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '../client';
import type { ExtractedRequirement, RequirementWithEvidence, EvidenceStrength } from '../types';

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are an evidence matching system for resume tailoring.

For each job requirement provided, examine the resume and determine whether it contains genuine evidence — including across vocabulary differences.

Rules:
- sourceSpans must be direct quotes or very close paraphrases of text that actually appears in the resume — never invent or embellish
- Vocabulary translation is allowed: "managed a classroom of 30 students" counts as evidence for "team leadership"; "oversaw daily scheduling" counts as evidence for "project coordination"
- evidenceStrength "strong": the resume explicitly and clearly demonstrates the requirement
- evidenceStrength "partial": the resume implies or tangentially demonstrates the requirement
- evidenceStrength "none": no real evidence exists — return an empty sourceSpans array
- When uncertain between "partial" and "none", choose "none" — never fabricate
- Output valid JSON only, no prose, no markdown fences

Output format:
{
  "matches": [
    {
      "requirementId": "<id from the requirements list>",
      "evidenceStrength": "strong" | "partial" | "none",
      "sourceSpans": ["<direct quote or very close paraphrase from the resume>"]
    }
  ]
}`;

const GROUNDING_THRESHOLD = 0.5;

export function tokenOverlap(span: string, referenceText: string): number {
  const contentWords = (text: string): string[] =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const spanWords = contentWords(span);
  if (spanWords.length === 0) return 0;

  const referenceSet = new Set(contentWords(referenceText));
  const matched = spanWords.filter((w) => referenceSet.has(w)).length;
  return matched / spanWords.length;
}

export function filterUngroundedSpans(spans: string[], resumeText: string): string[] {
  return spans.filter((span) => tokenOverlap(span, resumeText) >= GROUNDING_THRESHOLD);
}

export async function matchEvidence(
  requirements: ExtractedRequirement[],
  resumeText: string,
): Promise<RequirementWithEvidence[]> {
  if (requirements.length === 0) return [];

  const raw = await callWithRetry(requirements, resumeText);
  const parsed = parseAndValidate(raw, requirements);

  return parsed.map((match) => {
    const groundedSpans = filterUngroundedSpans(match.sourceSpans, resumeText);
    const effectiveStrength: EvidenceStrength =
      match.evidenceStrength !== 'none' && groundedSpans.length === 0
        ? 'none'
        : match.evidenceStrength;

    return {
      id: match.id,
      requirementText: match.requirementText,
      evidenceStrength: effectiveStrength,
      sourceSpans: effectiveStrength === 'none' ? [] : groundedSpans,
    };
  });
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

async function callWithRetry(
  requirements: ExtractedRequirement[],
  resumeText: string,
): Promise<string> {
  const userMessage = buildUserMessage(requirements, resumeText);

  const first = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = extractText(first.content);

  try {
    JSON.parse(stripFences(text));
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

function buildUserMessage(requirements: ExtractedRequirement[], resumeText: string): string {
  return [
    'RESUME TEXT:',
    resumeText,
    '',
    '---',
    '',
    'REQUIREMENTS TO MATCH (JSON):',
    JSON.stringify(
      requirements.map((r) => ({ id: r.id, requirementText: r.requirementText })),
      null,
      2,
    ),
  ].join('\n');
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  const block = content.find((b) => b.type === 'text');
  return block?.type === 'text' ? block.text.trim() : '';
}

function parseAndValidate(
  raw: string,
  requirements: ExtractedRequirement[],
): RequirementWithEvidence[] {
  let data: unknown;
  try {
    data = JSON.parse(stripFences(raw));
  } catch {
    throw new Error('Evidence matching: AI returned invalid JSON after retry');
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as Record<string, unknown>).matches)
  ) {
    throw new Error('Evidence matching: AI response missing "matches" array');
  }

  const matchesRaw = (data as { matches: unknown[] }).matches;

  const matchMap = new Map<string, { evidenceStrength: EvidenceStrength; sourceSpans: string[] }>();
  for (const item of matchesRaw) {
    if (typeof item !== 'object' || item === null) continue;
    const m = item as Record<string, unknown>;
    const id = typeof m.requirementId === 'string' ? m.requirementId : null;
    if (!id) continue;

    const evidenceStrength: EvidenceStrength = ['strong', 'partial', 'none'].includes(
      m.evidenceStrength as string,
    )
      ? (m.evidenceStrength as EvidenceStrength)
      : 'none';

    const sourceSpans = Array.isArray(m.sourceSpans)
      ? m.sourceSpans.filter((s): s is string => typeof s === 'string')
      : [];

    matchMap.set(id, { evidenceStrength, sourceSpans });
  }

  // Rebuild in original requirement order; default to "none" if the model omitted a requirement
  return requirements.map((req) => {
    const match = matchMap.get(req.id);
    return {
      id: req.id,
      requirementText: req.requirementText,
      evidenceStrength: match?.evidenceStrength ?? 'none',
      sourceSpans: match?.sourceSpans ?? [],
    };
  });
}
