// File: lib/__tests__/schemas.test.ts
// Role: Validates Zod schemas for API bodies and DB rows
import { describe, expect, it } from "vitest";
import { ChatRequestSchema } from "../schemas/chat";
import {
  CreatePersonaRequestSchema,
  PersonaRowSchema,
} from "../schemas/persona";

describe("schemas", () => {
  it("rejects invalid /api/chat body", () => {
    const res = ChatRequestSchema.safeParse({ personaId: "", messages: {} });
    expect(res.success).toBe(false);
  });

  it("rejects too long logs in /api/personas", () => {
    const res = CreatePersonaRequestSchema.safeParse({
      userId: "u",
      name: "n",
      logs: "a".repeat(120_001),
    });
    expect(res.success).toBe(false);
  });

  it("accepts valid PersonaRow", () => {
    const row = {
      id: "1",
      user_id: "u",
      name: "n",
      persona_prompt: "p",
      examples: null,
    };
    const res = PersonaRowSchema.safeParse(row);
    expect(res.success).toBe(true);
  });
});
