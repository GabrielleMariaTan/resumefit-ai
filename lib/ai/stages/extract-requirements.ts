import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '../client';
import type { ExtractedRequirement } from '../types';

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are a structured requirement extractor for job postings.

CRITICAL OUTPUT RULE: Your entire response must be a single raw JSON object and nothing else.
- Do NOT use markdown code fences (\`\`\`json or \`\`\` or any variation)
- Do NOT write any explanation, preamble, or trailing text
- Start your response with { and end with }

Extraction rules:
- Extract every discrete, atomic requirement from the job posting
- Each item must be a single, atomic claim — split compound requirements into separate items
- Only extract requirements explicitly stated in the posting — do not infer, assume, or add requirements not present in the text

Required JSON format:
{
  "requirements": [
    { "id": "req_1", "requirementText": "<exact or close paraphrase of the stated requirement>" },
    { "id": "req_2", "requirementText": "..." }
  ]
}`;

export async function extractRequirements(
  jobPostingText: string,
): Promise<ExtractedRequirement[]> {
  const raw = await callWithRetry(jobPostingText);
  return parseAndValidate(raw);
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

async function callWithRetry(jobPostingText: string): Promise<string> {
  const first = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: jobPostingText }],
  });

  const text = extractText(first.content);

  try {
    JSON.parse(stripFences(text));
    return text;
  } catch {
    // First response wasn't valid JSON — retry with a stricter reminder
    const retry = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        SYSTEM_PROMPT +
        '\n\nIMPORTANT: Your previous response was not valid JSON. Output ONLY the JSON object. No markdown, no code fences, no explanation.',
      messages: [
        { role: 'user', content: jobPostingText },
        { role: 'assistant', content: text },
        {
          role: 'user',
          content: 'That response was not valid JSON. Please output only the JSON object.',
        },
      ],
    });
    return extractText(retry.content);
  }
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  const block = content.find((b) => b.type === 'text');
  return block?.type === 'text' ? block.text.trim() : '';
}

function parseAndValidate(raw: string): ExtractedRequirement[] {
  let data: unknown;
  try {
    data = JSON.parse(stripFences(raw));
  } catch {
    throw new Error('Requirement extraction: AI returned invalid JSON after retry');
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as Record<string, unknown>).requirements)
  ) {
    throw new Error('Requirement extraction: AI response missing "requirements" array');
  }

  const items = (data as { requirements: unknown[] }).requirements;

  return items.map((item, index) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Record<string, unknown>).requirementText !== 'string'
    ) {
      throw new Error(
        `Requirement extraction: item at index ${index} missing "requirementText" string`,
      );
    }

    const r = item as Record<string, unknown>;
    return {
      id: typeof r.id === 'string' && r.id ? r.id : `req_${index + 1}`,
      requirementText: (r.requirementText as string).trim(),
    };
  });
}
