import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { anthropic } from '../client';
import { assessDefensibility } from './assess-defensibility';
import type { TailoredBullet } from '../types';

const mockCreate = vi.mocked(anthropic.messages.create);

function apiResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

const CLOSE_MIRROR: TailoredBullet = {
  id: 'bullet_1',
  rewrittenText: 'Managed a classroom of 30 students and 3 teaching assistants',
  linkedRequirementIds: ['req_1'],
  sourceSpans: ['Managed a classroom of 30 students and 3 teaching assistants'],
};

const HEAVY_TRANSLATION: TailoredBullet = {
  id: 'bullet_2',
  rewrittenText: 'Led cross-functional instructional design initiatives across 4 departments',
  linkedRequirementIds: ['req_2'],
  sourceSpans: ['Coordinated weekly school events across 4 departments'],
};

describe('assessDefensibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array without calling the API when given no bullets', async () => {
    const result = await assessDefensibility([]);
    expect(result).toHaveLength(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('adds defensibility to every bullet and preserves all original bullet fields', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          assessments: [
            {
              bulletId: 'bullet_1',
              flag: 'likely_defensible',
              likelyFollowUpQuestion: 'How did you handle conflicts between students in your classroom?',
              suggestedAnswer: 'I managed a classroom of 30 students and 3 teaching assistants, so conflict resolution was a regular part of the role. I\'d typically address it early with a one-on-one conversation and loop in the TAs if needed.',
            },
            {
              bulletId: 'bullet_2',
              flag: 'be_ready_to_elaborate',
              likelyFollowUpQuestion:
                'What specific instructional design frameworks did you apply when coordinating those events?',
              suggestedAnswer: 'My coordination experience came from organising weekly school events across 4 departments. I managed logistics and communication between groups, though I\'d frame the frameworks I used in terms of what the role requires.',
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR, HEAVY_TRANSLATION]);

    expect(result).toHaveLength(2);

    // Original fields preserved
    expect(result[0].id).toBe('bullet_1');
    expect(result[0].rewrittenText).toBe(CLOSE_MIRROR.rewrittenText);
    expect(result[0].sourceSpans).toEqual(CLOSE_MIRROR.sourceSpans);

    // Defensibility added
    expect(result[0].defensibility.flag).toBe('likely_defensible');
    expect(result[0].defensibility.likelyFollowUpQuestion).toContain('classroom');

    expect(result[1].defensibility.flag).toBe('be_ready_to_elaborate');
    expect(result[1].defensibility.likelyFollowUpQuestion).toBeTruthy();
  });

  it('flag is always one of the two valid values', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          assessments: [
            {
              bulletId: 'bullet_1',
              flag: 'likely_defensible',
              likelyFollowUpQuestion: 'How did you measure student outcomes?',
              suggestedAnswer: 'I tracked outcomes through regular observation and feedback in my classroom of 30 students.',
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR]);
    const validFlags = ['likely_defensible', 'be_ready_to_elaborate'];
    expect(validFlags).toContain(result[0].defensibility.flag);
  });

  it('suggestedAnswer is present and non-empty for every bullet with evidence', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          assessments: [
            {
              bulletId: 'bullet_1',
              flag: 'likely_defensible',
              likelyFollowUpQuestion: 'How did you handle classroom conflicts?',
              suggestedAnswer: 'I managed a classroom of 30 students and 3 teaching assistants, so I dealt with interpersonal dynamics regularly. I\'d address issues early and directly, and involve the TAs when a situation needed a second perspective.',
            },
            {
              bulletId: 'bullet_2',
              flag: 'be_ready_to_elaborate',
              likelyFollowUpQuestion: 'Which instructional design frameworks did you apply?',
              suggestedAnswer: 'My background is in coordinating school events across 4 departments, which taught me a lot about cross-team communication. I\'d draw on that experience to explain how I approach structured collaboration.',
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR, HEAVY_TRANSLATION]);

    expect(result[0].defensibility.suggestedAnswer).toBeTruthy();
    expect(result[0].defensibility.suggestedAnswer.length).toBeGreaterThan(10);
    expect(result[1].defensibility.suggestedAnswer).toBeTruthy();
    expect(result[1].defensibility.suggestedAnswer.length).toBeGreaterThan(10);
  });

  it('suggestedAnswer references content from sourceSpans, not invented details', async () => {
    const sourceContent = 'Managed a classroom of 30 students and 3 teaching assistants';
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          assessments: [
            {
              bulletId: 'bullet_1',
              flag: 'likely_defensible',
              likelyFollowUpQuestion: 'How large was the team you managed?',
              suggestedAnswer: 'In my role I managed a classroom of 30 students and 3 teaching assistants. That experience gave me a good foundation in coordinating a group of people toward shared goals.',
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR]);
    const answer = result[0].defensibility.suggestedAnswer;

    // The answer should reference concrete details present in the sourceSpans
    const sourceParts = sourceContent.toLowerCase().split(' ').filter((w) => w.length > 4);
    const answerLower = answer.toLowerCase();
    const matchCount = sourceParts.filter((word) => answerLower.includes(word)).length;
    expect(matchCount).toBeGreaterThan(0);
  });

  it('defaults to "be_ready_to_elaborate" with a fallback question when the model omits a bullet', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          // Only assessed bullet_1, omitted bullet_2
          assessments: [
            {
              bulletId: 'bullet_1',
              flag: 'likely_defensible',
              likelyFollowUpQuestion: 'How did you handle conflicts between students?',
              suggestedAnswer: 'I handled conflicts by addressing them early in a private setting before they escalated.',
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR, HEAVY_TRANSLATION]);

    expect(result).toHaveLength(2);
    // bullet_2 got the conservative fallback
    expect(result[1].defensibility.flag).toBe('be_ready_to_elaborate');
    expect(result[1].defensibility.likelyFollowUpQuestion).toBeTruthy();
  });

  it('defaults invalid flag values to "be_ready_to_elaborate"', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          assessments: [
            {
              bulletId: 'bullet_1',
              flag: 'sounds_great', // invalid
              likelyFollowUpQuestion: 'How did you measure student outcomes?',
              suggestedAnswer: 'I tracked outcomes through regular observation.',
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR]);
    expect(result[0].defensibility.flag).toBe('be_ready_to_elaborate');
  });
});
