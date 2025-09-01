import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  createOpenAIMock: vi.fn(() => vi.fn()),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: hoisted.createOpenAIMock,
}));

describe("lib/ai", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates OpenAI client with env api key", async () => {
    process.env.OPENAI_API_KEY = "test-key-123";

    const mod = await import("../ai");
    expect(typeof mod.openai).toBe("function");
    expect(hoisted.createOpenAIMock).toHaveBeenCalledWith({
      apiKey: "test-key-123",
    });
  });
});
