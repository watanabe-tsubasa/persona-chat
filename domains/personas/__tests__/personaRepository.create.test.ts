// File: domains/personas/__tests__/personaRepository.create.test.ts
// Role: Ensures personaRepository.create throws on insert failure
import { describe, expect, it, vi } from "vitest";

const singleMock = vi.fn();
const insertMock = vi.fn(() => ({
  select: vi.fn(() => ({ single: singleMock })),
}));
const fromMock = vi.fn(() => ({ insert: insertMock }));
vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: () => ({ from: fromMock }),
}));

describe("personaRepository.create", () => {
  it("throws when supabase returns error", async () => {
    singleMock.mockResolvedValueOnce({
      data: null,
      error: new Error("db error"),
    });
    const { personaRepository } = await import(
      "../repositories/personaRepository"
    );
    await expect(
      personaRepository.create({
        userId: "u",
        name: "n",
        personaPrompt: "p",
        examples: "e",
      }),
    ).rejects.toThrowError();
  });
});
