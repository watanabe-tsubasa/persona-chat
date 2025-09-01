// File: domains/personas/__tests__/personaService.test.ts
// Role: Tests personaService createFromLogs with mocked dependencies
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/persona", () => ({
  generatePersonaPromptFromLogs: vi.fn(async () => ({ personaPrompt: "P" })),
  generateFixedExamples: vi.fn(async () => ({
    examplesText: "user: A\nassistant: B",
  })),
}));

const createMock = vi.fn(async () => ({
  id: "123",
  user_id: "demo",
  name: "n",
  persona_prompt: "P",
  examples: "user: A\nassistant: B",
}));

vi.mock("@/domains/personas/repositories/personaRepository", () => ({
  personaRepository: { create: (...args: unknown[]) => createMock(...args) },
}));

describe("personaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates persona from logs and returns ids and fields", async () => {
    const { personaService } = await import("../services/personaService");
    const res = await personaService.createFromLogs({
      userId: "demo",
      name: "n",
      logs: "L",
    });
    expect(res.id).toBe("123");
    expect(res.personaPrompt).toBe("P");
    expect(res.examplesText).toContain("user: A");
    expect(createMock).toHaveBeenCalledTimes(1);
  });
});
