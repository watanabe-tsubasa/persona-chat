import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('lib/ai', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates OpenAI client with env api key', async () => {
    const createOpenAIMock = vi.fn(() => vi.fn());

    vi.mock('@ai-sdk/openai', () => ({
      createOpenAI: createOpenAIMock,
    }));

    process.env.OPENAI_API_KEY = 'test-key-123';

    const mod = await import('../ai');
    expect(typeof mod.openai).toBe('function');
    expect(createOpenAIMock).toHaveBeenCalledWith({ apiKey: 'test-key-123' });
  });
});

