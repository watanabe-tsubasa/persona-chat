// File: lib/__tests__/llm_json.test.ts
// Role: Tests for LLM JSON utilities: fence stripping and safe parsing
import { describe, expect, it } from "vitest";
import {
  ExamplesLLMSchema,
  PersonaLLMSchema,
  safeParseJson,
  stripCodeFences,
} from "../llm/json";

describe("llm/json utils", () => {
  it("strips code fences", () => {
    const s = '```json\n{\n  "a": 1\n}\n```';
    const out = stripCodeFences(s);
    expect(out.trim().startsWith("{")).toBe(true);
  });

  it("safely parses valid persona JSON", () => {
    const text = JSON.stringify({ persona_prompt: "x", style_rules: ["y"] });
    const parsed = safeParseJson(text, PersonaLLMSchema, {
      persona_prompt: "f",
      style_rules: [],
    });
    expect(parsed.persona_prompt).toBe("x");
    expect(parsed.style_rules?.[0]).toBe("y");
  });

  it("falls back for invalid JSON", () => {
    const parsed = safeParseJson("not-json", ExamplesLLMSchema, {
      examples: [],
    });
    expect(parsed.examples).toEqual([]);
  });
});
