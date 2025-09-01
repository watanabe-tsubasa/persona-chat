// File: lib/llm/json.ts
// Role: LLM JSON handling (code-fence stripping, safe Zod parsing), LLM output schemas
import { type ZodSchema, z } from "zod";

export function stripCodeFences(text: string): string {
  let raw = text.trim();
  raw = raw
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return raw;
}

export function safeParseJson<T>(
  text: string,
  schema: ZodSchema<T>,
  fallback: T,
): T {
  try {
    const cleaned = stripCodeFences(text);
    const unknown = JSON.parse(cleaned);
    const parsed = schema.safeParse(unknown);
    if (parsed.success) return parsed.data;
  } catch {
    // ignore
  }
  return fallback;
}

export const PersonaLLMSchema = z.object({
  persona_prompt: z.string().optional(),
  style_rules: z.array(z.string()).optional(),
});

export const ExamplesLLMSchema = z.object({
  examples: z
    .array(
      z.object({
        user: z.string().optional(),
        assistant: z.string().optional(),
      }),
    )
    .optional(),
});
