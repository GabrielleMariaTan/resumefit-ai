import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { anthropic } from '../client';
import { generateVerdict } from './generate-verdict';
import type { RequirementWithEvidence } from '../types';

const mockCreate = vi.mocked(anthropic.messages.create);

function apiResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

const STRONG_REQ: RequirementWithEvidence = {
  id: 'req_1',
  requirementText: 'Team leadership experience',
  evidenceStrength: 'strong',
  sourceSpans: ['Managed a classroom of 30 students'],
};

const PARTIAL_REQ: RequirementWithEvidence = {
  id: 'req_2',
  requirementText: 'Project coordination skills',
  evidenceStrength: 'partial',
  sourceSpans: ['Coordinated school events'],
};

const NONE_REQ: RequirementWithEvidence = {
  id: 'req_3',
  requirementText: 'Python programming',
  evidenceStrength: 'none',
  sourceSpans: [],
};

describe('generateVerdict', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns likely_screened_out with a default message immediately when there are no requirements', async () => {
    const result = await generateVerdict([]);
    expect(result.summary).toBe('likely_screened_out');
    expect(result.reasoning).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns a valid likely_to_advance verdict when most requirements have evidence', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          summary: 'likely_to_advance',
          reasoning:
            'The candidate demonstrates strong team leadership through consistent classroom management of 30 students. Project coordination is partially evidenced through event oversight. The resume translates well to this role.',
        }),
      ) as never,
    );

    const result = await generateVerdict([STRONG_REQ, PARTIAL_REQ]);

    expect(result.summary).toBe('likely_to_advance');
    expect(result.reasoning).toBeTruthy();
    expect(result.reasoning.length).toBeGreaterThan(20);
  });

  it('returns a valid likely_screened_out verdict when most requirements have no evidence', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          summary: 'likely_screened_out',
          reasoning:
            'The candidate has no evident Python programming experience, which is a core requirement for this role. Without technical skills in data analysis or scripting, it is unlikely this application would advance past initial screening.',
        }),
      ) as never,
    );

    const result = await generateVerdict([NONE_REQ]);

    expect(result.summary).toBe('likely_screened_out');
    expect(result.reasoning).toBeTruthy();
  });

  it('returns a valid mixed verdict for split requirements', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          summary: 'mixed',
          reasoning:
            'The candidate has strong evidence of team leadership and partial evidence of project coordination, but no technical skills are demonstrated. Whether this advances depends on how heavily the hiring team weights the Python requirement.',
        }),
      ) as never,
    );

    const result = await generateVerdict([STRONG_REQ, PARTIAL_REQ, NONE_REQ]);

    expect(result.summary).toBe('mixed');
    expect(result.reasoning).toBeTruthy();
  });

  it('defaults an invalid summary to "mixed" rather than throwing', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          summary: 'probably_fine', // not a valid value
          reasoning: 'Some requirements are met.',
        }),
      ) as never,
    );

    const result = await generateVerdict([STRONG_REQ]);
    expect(result.summary).toBe('mixed');
    expect(result.reasoning).toBeTruthy();
  });

  it('summary is always one of the three valid values', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          summary: 'likely_to_advance',
          reasoning: 'Strong evidence across key requirements.',
        }),
      ) as never,
    );

    const result = await generateVerdict([STRONG_REQ]);
    const validSummaries = ['likely_to_advance', 'likely_screened_out', 'mixed'];
    expect(validSummaries).toContain(result.summary);
  });
});
