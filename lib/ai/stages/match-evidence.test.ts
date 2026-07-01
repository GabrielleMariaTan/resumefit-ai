import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { anthropic } from '../client';
import { matchEvidence, tokenOverlap, filterUngroundedSpans } from './match-evidence';

const mockCreate = vi.mocked(anthropic.messages.create);

function apiResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

const RESUME = 'Managed a classroom of 30 students and prepared weekly lesson plans. Organized school events with a team of 5 teachers.';

const REQUIREMENTS = [
  { id: 'req_1', requirementText: 'Team leadership experience' },
  { id: 'req_2', requirementText: 'Event planning skills' },
];

// --- Guardrail unit tests (no API call needed) ---

describe('tokenOverlap', () => {
  it('returns 1 for a span whose words are all present in the reference text', () => {
    expect(tokenOverlap('managed classroom students', RESUME)).toBe(1);
  });

  it('returns 0 for a span whose words are entirely absent from the reference text', () => {
    expect(tokenOverlap('cross-functional engineering sprints', RESUME)).toBe(0);
  });

  it('returns 0 for an empty span', () => {
    expect(tokenOverlap('', RESUME)).toBe(0);
  });
});

describe('filterUngroundedSpans', () => {
  it('keeps spans with sufficient overlap with the resume', () => {
    const spans = ['managed classroom lesson plans'];
    expect(filterUngroundedSpans(spans, RESUME)).toEqual(spans);
  });

  it('removes spans whose words are not present in the resume', () => {
    const spans = ['led cross-functional product sprints across engineering teams'];
    expect(filterUngroundedSpans(spans, RESUME)).toHaveLength(0);
  });

  it('filters selectively when some spans are grounded and others are not', () => {
    const grounded = 'managed classroom students';
    const fabricated = 'architected microservices deployment pipelines';
    const result = filterUngroundedSpans([grounded, fabricated], RESUME);
    expect(result).toEqual([grounded]);
  });
});

// --- Integration tests for matchEvidence (API mocked) ---

describe('matchEvidence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns grounded sourceSpans and correct evidenceStrength when the model cites real resume text', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          matches: [
            {
              requirementId: 'req_1',
              evidenceStrength: 'strong',
              sourceSpans: ['Managed a classroom of 30 students'],
            },
            {
              requirementId: 'req_2',
              evidenceStrength: 'partial',
              sourceSpans: ['Organized school events with a team of 5 teachers'],
            },
          ],
        }),
      ) as never,
    );

    const result = await matchEvidence(REQUIREMENTS, RESUME);

    expect(result).toHaveLength(2);
    expect(result[0].evidenceStrength).toBe('strong');
    expect(result[0].sourceSpans).toHaveLength(1);
    expect(result[1].evidenceStrength).toBe('partial');
    expect(result[1].sourceSpans).toHaveLength(1);
  });

  it('strips fabricated sourceSpans and demotes evidenceStrength to "none" — the no-fabrication guardrail', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          matches: [
            {
              requirementId: 'req_1',
              evidenceStrength: 'partial',
              // This text does NOT appear in RESUME — model fabricated it
              sourceSpans: ['Led cross-functional engineering sprints and managed direct reports'],
            },
            {
              requirementId: 'req_2',
              evidenceStrength: 'none',
              sourceSpans: [],
            },
          ],
        }),
      ) as never,
    );

    const result = await matchEvidence(REQUIREMENTS, RESUME);

    // Fabricated span must be stripped and strength demoted
    expect(result[0].sourceSpans).toHaveLength(0);
    expect(result[0].evidenceStrength).toBe('none');

    // Honest "none" result passes through unchanged
    expect(result[1].sourceSpans).toHaveLength(0);
    expect(result[1].evidenceStrength).toBe('none');
  });

  it('defaults missing requirements to evidenceStrength "none" when the model omits them', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          // Model only returned a match for req_1, omitted req_2
          matches: [
            { requirementId: 'req_1', evidenceStrength: 'none', sourceSpans: [] },
          ],
        }),
      ) as never,
    );

    const result = await matchEvidence(REQUIREMENTS, RESUME);

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe('req_2');
    expect(result[1].evidenceStrength).toBe('none');
    expect(result[1].sourceSpans).toHaveLength(0);
  });

  it('returns an empty array immediately when given no requirements', async () => {
    const result = await matchEvidence([], RESUME);
    expect(result).toHaveLength(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
