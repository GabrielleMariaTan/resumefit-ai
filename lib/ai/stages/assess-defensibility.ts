import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '../client';
import type {
  TailoredBullet,
  TailoredBulletWithDefensibility,
  DefensibilityFlag,
} from '../types';

// Defensibility reasoning requires nuanced gap assessment — use a stronger model.
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are an interview defensibility assessor for tailored resume bullets.

For each rewritten resume bullet, assess whether the candidate would find it easy or hard to elaborate on in an interview. Base the assessment on how much the rewritten language differs from the source evidence it came from.

Flag "likely_defensible" when:
- The rewritten bullet closely mirrors the source span's content and phrasing
- The candidate could answer follow-up questions directly from their lived experience, with minimal bridging required

Flag "be_ready_to_elaborate" when:
- The rewritten bullet significantly reframes the source evidence using target-industry vocabulary
- A meaningful gap exists between what's written and the specific experience behind it
- A recruiter probing for specifics would expose a translation gap the candidate should prepare to bridge

For likelyFollowUpQuestion:
- Write a specific, realistic question a recruiter or hiring manager would actually ask in an interview
- The question should target the gap between the source evidence and the rewritten bullet
- Never use generic filler like "Tell me more", "Can you elaborate on that?", or "Walk me through it" as standalone questions — be specific to the content

Output valid JSON only, no prose, no markdown fences.

Output format:
{
  "assessments": [
    {
      "bulletId": "<id from input>",
      "flag": "likely_defensible" | "be_ready_to_elaborate",
      "likelyFollowUpQuestion": "<specific recruiter question>"
    }
  ]
}`;

const FALLBACK_DEFENSIBILITY = {
  flag: 'be_ready_to_elaborate' as DefensibilityFlag,
  likelyFollowUpQuestion:
    'Can you describe a specific situation where you applied this skill and what the outcome was?',
};

export async function assessDefensibility(
  bullets: TailoredBullet[],
): Promise<TailoredBulletWithDefensibility[]> {
  if (bullets.length === 0) return [];

  const raw = await callWithRetry(bullets);
  return parseAndMerge(raw, bullets);
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

async function callWithRetry(bullets: TailoredBullet[]): Promise<string> {
  const userMessage = buildUserMessage(bullets);

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

function buildUserMessage(bullets: TailoredBullet[]): string {
  return [
    'BULLETS TO ASSESS:',
    JSON.stringify(
      bullets.map((b) => ({
        bulletId: b.id,
        rewrittenText: b.rewrittenText,
        sourceSpans: b.sourceSpans,
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

function parseAndMerge(raw: string, bullets: TailoredBullet[]): TailoredBulletWithDefensibility[] {
  let data: unknown;
  try {
    data = JSON.parse(stripFences(raw));
  } catch {
    throw new Error('Defensibility assessment: AI returned invalid JSON after retry');
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as Record<string, unknown>).assessments)
  ) {
    throw new Error('Defensibility assessment: AI response missing "assessments" array');
  }

  const assessmentsRaw = (data as { assessments: unknown[] }).assessments;

  const assessmentMap = new Map<
    string,
    { flag: DefensibilityFlag; likelyFollowUpQuestion: string }
  >();

  for (const item of assessmentsRaw) {
    if (typeof item !== 'object' || item === null) continue;
    const a = item as Record<string, unknown>;

    const bulletId = typeof a.bulletId === 'string' ? a.bulletId : null;
    if (!bulletId) continue;

    const flag: DefensibilityFlag = ['likely_defensible', 'be_ready_to_elaborate'].includes(
      a.flag as string,
    )
      ? (a.flag as DefensibilityFlag)
      : 'be_ready_to_elaborate';

    const likelyFollowUpQuestion =
      typeof a.likelyFollowUpQuestion === 'string' && a.likelyFollowUpQuestion.trim()
        ? a.likelyFollowUpQuestion.trim()
        : FALLBACK_DEFENSIBILITY.likelyFollowUpQuestion;

    assessmentMap.set(bulletId, { flag, likelyFollowUpQuestion });
  }

  // Merge back in original bullet order; default to conservative fallback if the model omits a bullet.
  return bullets.map((bullet) => ({
    ...bullet,
    defensibility: assessmentMap.get(bullet.id) ?? FALLBACK_DEFENSIBILITY,
  }));
}
