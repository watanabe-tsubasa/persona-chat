// File: lib/env-openai.server.ts
// Role: Env validation for OpenAI credentials
import { z } from "zod";

const OpenAIEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
});

export const openAIEnv = OpenAIEnvSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});
