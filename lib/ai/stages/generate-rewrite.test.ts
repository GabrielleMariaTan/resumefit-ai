import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { anthropic } from '../client';
import { generateRewrite } from './generate-rewrite';
import type { RequirementWithEvidence } from '../types';

const mockCreate = vi.mocked(anthropic.messages.create);

function apiResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

const STRONG: RequirementWithEvidence = {
  id: 'req_1',
  requirementText: 'Team leadership experience',
  evidenceStrength: 'strong',
  sourceSpans: ['Managed a classroom of 30 students and 3 teaching assistants'],
};

const PARTIAL: RequirementWithEvidence = {
  id: 'req_2',
  requirementText: 'Project coordination skills',
  evidenceStrength: 'partial',
  sourceSpans: ['Coordinated weekly school events across 4 departments'],
};

const NONE: RequirementWithEvidence = {
  id: 'req_3',
  requirementText: 'Python programming',
  evidenceStrength: 'none',
  sourceSpans: [],
};

describe('generateRewrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Critical spec test ────────────────────────────────────────────────────
  it('never generates a bullet for a requirement with evidenceStrength "none" — enforced before the API call', async () => {
    const result = await generateRewrite([NONE]);

    expect(result).toHaveLength(0);
    // The API must never be called — this is code-level enforcement, not prompt-level
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('skips none-evidence requirements in a mixed list without calling the API for them', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          bullets: [
            {
              id: 'bullet_1',
              rewrittenText: 'Led a team of 30 learners and 3 instructional staff across curriculum delivery',
              linkedRequirementIds: ['req_1'],
              sourceSpans: ['Managed a classroom of 30 students and 3 teaching assistants'],
            },
          ],
        }),
      ) as never,
    );

    const result = await generateRewrite([STRONG, NONE]);

    // Only the supported requirement produced a bullet
    expect(result).toHaveLength(1);
    expect(result[0].linkedRequirementIds).toContain('req_1');

    // API was called exactly once (for the one supported requirement)
    expect(mockCreate).toHaveBeenCalledTimes(1);

    // The none-requirement's id must not appear in any bullet
    const allLinkedIds = result.flatMap((b) => b.linkedRequirementIds);
    expect(allLinkedIds).not.toContain('req_3');
  });

  // ── Valid generation ──────────────────────────────────────────────────────
  it('returns well-formed bullets for strong and partial evidence requirements', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          bullets: [
            {
              id: 'bullet_1',
              rewrittenText: 'Led a team of 30 learners and 3 instructional staff',
              linkedRequirementIds: ['req_1'],
              sourceSpans: ['Managed a classroom of 30 students and 3 teaching assistants'],
            },
            {
              id: 'bullet_2',
              rewrittenText: 'Coordinated cross-functional projects across 4 departments',
              linkedRequirementIds: ['req_2'],
              sourceSpans: ['Coordinated weekly school events across 4 departments'],
            },
          ],
        }),
      ) as never,
    );

    const result = await generateRewrite([STRONG, PARTIAL]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'bullet_1',
      rewrittenText: 'Led a team of 30 learners and 3 instructional staff',
      linkedRequirementIds: ['req_1'],
    });
    expect(result[0].sourceSpans).toHaveLength(1);
    expect(result[1].sourceSpans).toHaveLength(1);
  });

  // ── Fail-safe: drop bullets the model returns without sourceSpans ─────────
  it('drops any bullet the model returns without sourceSpans', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          bullets: [
            {
              id: 'bullet_1',
              rewrittenText: 'Led a cross-functional team',
              linkedRequirementIds: ['req_1'],
              sourceSpans: [], // empty — can't be traced, must be dropped
            },
            {
              id: 'bullet_2',
              rewrittenText: 'Coordinated cross-functional projects',
              linkedRequirementIds: ['req_2'],
              sourceSpans: ['Coordinated weekly school events across 4 departments'],
            },
          ],
        }),
      ) as never,
    );

    const result = await generateRewrite([STRONG, PARTIAL]);

    // bullet_1 dropped (empty sourceSpans), bullet_2 kept
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bullet_2');
  });

  it('returns an empty array immediately when all requirements have no evidence', async () => {
    const result = await generateRewrite([NONE, { ...NONE, id: 'req_4' }]);

    expect(result).toHaveLength(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
