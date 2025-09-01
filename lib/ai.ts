// File: lib/ai.ts
// Role: OpenAI client factory using AI SDK, reads validated env
import { createOpenAI } from "@ai-sdk/openai";
import { openAIEnv } from "./env-openai.server";

export const openai = createOpenAI({
  apiKey: openAIEnv.OPENAI_API_KEY,
});
