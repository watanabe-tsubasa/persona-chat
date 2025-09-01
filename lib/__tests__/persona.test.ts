import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock lib/ai to avoid real client usage
vi.mock("../ai", () => ({
  openai: () => ({}),
}));

// Spy-capable mock for generateText from 'ai'
const generateTextMock = vi.fn();
vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));

describe("lib/persona", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("parses persona JSON (with code fences) and formats prompt", async () => {
    const json = {
      persona_prompt: "明るくフランクな関西弁で話す。",
      style_rules: ["絵文字は控えめ", "語尾は柔らかく"],
    };
    generateTextMock.mockResolvedValueOnce({
      text: `\`\`\`json\n${JSON.stringify(json)}\n\`\`\``,
    });

    const { generatePersonaPromptFromLogs } = await import("../persona");
    const res = await generatePersonaPromptFromLogs("some logs");

    expect(res.personaPrompt).toContain("明るくフランクな関西弁で話す。");
    expect(res.personaPrompt).toContain("# Style Rules");
    expect(res.personaPrompt).toContain("- 絵文字は控えめ");
    expect(res.personaPrompt).toContain("- 語尾は柔らかく");
  });

  it("falls back when JSON parsing fails", async () => {
    generateTextMock.mockResolvedValueOnce({ text: "not-json" });
    const { generatePersonaPromptFromLogs } = await import("../persona");
    const res = await generatePersonaPromptFromLogs("x");
    expect(res.personaPrompt).toContain("ユーザーの口調を模倣してください。");
  });

  it("truncates logs to 60k chars before sending", async () => {
    generateTextMock.mockImplementationOnce((_opts: unknown) => ({
      text: JSON.stringify({ persona_prompt: "a", style_rules: [] }),
    }));
    const long = "a".repeat(100_000);
    const { generatePersonaPromptFromLogs } = await import("../persona");
    await generatePersonaPromptFromLogs(long);
    // First call arg is the options object; check truncated prompt length
    const call = generateTextMock.mock.calls[0][0];
    expect(call.prompt.length).toBe(60_000);
  });

  it("formats up to 2 fixed examples", async () => {
    const payload = {
      examples: [
        { user: "Hi", assistant: "Hello" },
        { user: "How are you?", assistant: "Great!" },
        { user: "Third", assistant: "Skip" },
      ],
    };
    generateTextMock.mockResolvedValueOnce({ text: JSON.stringify(payload) });

    const { generateFixedExamples } = await import("../persona");
    const res = await generateFixedExamples("prompt");
    expect(res.examplesText).toContain("user: Hi\nassistant: Hello");
    expect(res.examplesText).toContain("user: How are you?\nassistant: Great!");
    expect(res.examplesText).not.toContain("Third");
  });

  it("returns empty examples on parse error", async () => {
    generateTextMock.mockResolvedValueOnce({ text: "oops" });
    const { generateFixedExamples } = await import("../persona");
    const res = await generateFixedExamples("prompt");
    expect(res.examplesText).toBe("");
  });
});
