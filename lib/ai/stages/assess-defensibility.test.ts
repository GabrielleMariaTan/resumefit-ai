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
            },
            {
              bulletId: 'bullet_2',
              flag: 'be_ready_to_elaborate',
              likelyFollowUpQuestion:
                'What specific instructional design frameworks did you apply when coordinating those events?',
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
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR]);
    const validFlags = ['likely_defensible', 'be_ready_to_elaborate'];
    expect(validFlags).toContain(result[0].defensibility.flag);
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
            },
          ],
        }),
      ) as never,
    );

    const result = await assessDefensibility([CLOSE_MIRROR]);
    expect(result[0].defensibility.flag).toBe('be_ready_to_elaborate');
  });
});
