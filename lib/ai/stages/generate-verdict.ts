import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '../client';
import type { RequirementWithEvidence, OverallVerdict, VerdictSummary } from '../types';

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are an experienced recruiter assessing a candidate's fit for a role.

Given a list of job requirements and how well the candidate's resume evidences each one, provide an honest verdict on whether this candidate would likely advance in the hiring process.

Rules:
- summary must be exactly one of: "likely_to_advance", "likely_screened_out", "mixed"
  - "likely_to_advance": most key requirements have strong or partial evidence
  - "likely_screened_out": most key requirements have no evidence
  - "mixed": a significant split between evidenced and unevidenced requirements
- reasoning must be 2-4 sentences, written in a recruiter's voice
- Reference specific requirements by their content — not just "some requirements" or generic phrases
- Do not give a numeric score
- Output valid JSON only, no prose, no markdown fences

Output format:
{
  "summary": "likely_to_advance" | "likely_screened_out" | "mixed",
  "reasoning": "<2-4 sentence recruiter-style explanation referencing specific requirements>"
}`;

const VALID_SUMMARIES: VerdictSummary[] = ['likely_to_advance', 'likely_screened_out', 'mixed'];

export async function generateVerdict(
  requirements: RequirementWithEvidence[],
): Promise<OverallVerdict> {
  if (requirements.length === 0) {
    return {
      summary: 'likely_screened_out',
      reasoning: 'No requirements could be extracted from the job posting, so no match assessment is possible.',
    };
  }

  const raw = await callWithRetry(requirements);
  return parseAndValidate(raw);
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

async function callWithRetry(requirements: RequirementWithEvidence[]): Promise<string> {
  const userMessage = buildUserMessage(requirements);

  const first = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
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
      max_tokens: 512,
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

function buildUserMessage(requirements: RequirementWithEvidence[]): string {
  return [
    'REQUIREMENTS AND EVIDENCE SUMMARY:',
    JSON.stringify(
      requirements.map((r) => ({
        requirementText: r.requirementText,
        evidenceStrength: r.evidenceStrength,
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

function parseAndValidate(raw: string): OverallVerdict {
  let data: unknown;
  try {
    data = JSON.parse(stripFences(raw));
  } catch {
    throw new Error('Verdict generation: AI returned invalid JSON after retry');
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Verdict generation: AI response is not an object');
  }

  const d = data as Record<string, unknown>;

  const summary: VerdictSummary = VALID_SUMMARIES.includes(d.summary as VerdictSummary)
    ? (d.summary as VerdictSummary)
    : 'mixed';

  const reasoning =
    typeof d.reasoning === 'string' && d.reasoning.trim()
      ? d.reasoning.trim()
      : 'The candidate has mixed evidence across the listed requirements.';

  return { summary, reasoning };
}
