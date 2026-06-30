import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

import { anthropic } from '../client';
import { extractRequirements } from './extract-requirements';

const mockCreate = vi.mocked(anthropic.messages.create);

function apiResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

describe('extractRequirements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a structured list of requirements for a valid job posting', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          requirements: [
            { id: 'req_1', requirementText: '3+ years of React experience' },
            { id: 'req_2', requirementText: 'Proficiency with TypeScript' },
          ],
        }),
      ) as never,
    );

    const result = await extractRequirements(
      'We seek a frontend engineer with 3+ years of React and TypeScript skills.',
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'req_1', requirementText: '3+ years of React experience' });
    expect(result[1]).toEqual({ id: 'req_2', requirementText: 'Proficiency with TypeScript' });
  });

  it('auto-generates ids when the AI omits them', async () => {
    mockCreate.mockResolvedValueOnce(
      apiResponse(
        JSON.stringify({
          requirements: [{ requirementText: 'Python experience' }],
        }),
      ) as never,
    );

    const result = await extractRequirements('Python developer role.');

    expect(result[0].id).toBe('req_1');
    expect(result[0].requirementText).toBe('Python experience');
  });

  it('retries once and throws when the AI returns invalid JSON on both attempts', async () => {
    mockCreate.mockResolvedValue(apiResponse('not json at all') as never);

    await expect(extractRequirements('Some job posting.')).rejects.toThrow(
      'Requirement extraction: AI returned invalid JSON after retry',
    );
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
