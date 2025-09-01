// File: domains/personas/services/personaService.ts
// Role: Persona use-cases: generate prompt/examples from logs and persist
import {
  generateFixedExamples,
  generatePersonaPromptFromLogs,
} from "@/lib/persona";
import { personaRepository } from "../repositories/personaRepository";

export const personaService = {
  async createFromLogs(input: { userId: string; name: string; logs: string }) {
    const { personaPrompt } = await generatePersonaPromptFromLogs(input.logs);
    const { examplesText } = await generateFixedExamples(personaPrompt);

    const created = await personaRepository.create({
      userId: input.userId,
      name: input.name,
      personaPrompt,
      examples: examplesText,
    });

    return {
      id: created.id,
      personaPrompt,
      examplesText,
    };
  },
};
