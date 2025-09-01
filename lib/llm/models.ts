// File: lib/llm/models.ts
// Role: Centralized model names and default parameters for LLM calls

export const LLM_MODELS = {
  personaGenerate: "gpt-5",
  chatAssistant: "gpt-5-chat-latest",
} as const;

export const LLM_DEFAULTS = {
  personaTemperature: 0.2,
  examplesTemperature: 0.4,
} as const;
