// File: domains/personas/__tests__/personaService.error.test.ts
// Role: Ensures personaService.createFromLogs propagates repository errors
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/persona", () => ({
  generatePersonaPromptFromLogs: vi.fn(async () => ({ personaPrompt: "P" })),
  generateFixedExamples: vi.fn(async () => ({ examplesText: "EX" })),
}));

vi.mock("@/domains/personas/repositories/personaRepository", () => ({
  personaRepository: {
    create: vi.fn(async () => {
      throw new Error("insert failed");
    }),
  },
}));

describe("personaService error path", () => {
  it("bubbles up when repository.create throws", async () => {
    const { personaService } = await import("../services/personaService");
    await expect(
      personaService.createFromLogs({ userId: "u", name: "n", logs: "L" }),
    ).rejects.toThrowError();
  });
});
