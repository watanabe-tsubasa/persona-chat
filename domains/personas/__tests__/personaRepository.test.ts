// File: domains/personas/__tests__/personaRepository.test.ts
// Role: Tests personaRepository getById happy-path and null on error
import { beforeEach, describe, expect, it, vi } from "vitest";

const chain = {
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const fromMock = vi.fn(() => ({ select: vi.fn(() => chain) }));
vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: () => ({ from: fromMock }),
}));

describe("personaRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed row when select succeeds", async () => {
    chain.single.mockResolvedValueOnce({
      data: {
        id: "1",
        user_id: "u",
        name: "n",
        persona_prompt: "p",
        examples: null,
      },
      error: null,
    });
    const { personaRepository } = await import(
      "../repositories/personaRepository"
    );
    const res = await personaRepository.getById("1");
    expect(res?.id).toBe("1");
  });

  it("returns null when select fails", async () => {
    chain.single.mockResolvedValueOnce({ data: null, error: new Error("x") });
    const { personaRepository } = await import(
      "../repositories/personaRepository"
    );
    const res = await personaRepository.getById("404");
    expect(res).toBeNull();
  });
});
