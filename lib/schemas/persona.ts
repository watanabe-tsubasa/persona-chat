// File: lib/schemas/persona.ts
// Role: Zod schemas/types for persona creation request and DB row shape
import { z } from "zod";

export const CreatePersonaRequestSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  logs: z.string().min(1).max(120_000),
});

export type CreatePersonaRequest = z.infer<typeof CreatePersonaRequestSchema>;

export const PersonaRowSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  name: z.string(),
  persona_prompt: z.string(),
  examples: z.string().nullable(),
});

export type PersonaRow = z.infer<typeof PersonaRowSchema>;
