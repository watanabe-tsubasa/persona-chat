// File: domains/personas/repositories/personaRepository.ts
// Role: Persona data access via Supabase; shapes validated with Zod
import { type PersonaRow, PersonaRowSchema } from "@/lib/schemas/persona";
import { supabaseServer } from "@/lib/supabase-server";

export const personaRepository = {
  async getById(id: string): Promise<PersonaRow | null> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("personas")
      .select("id, user_id, name, persona_prompt, examples")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    const parsed = PersonaRowSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  },

  async create(input: {
    userId: string;
    name: string;
    personaPrompt: string;
    examples: string;
  }): Promise<PersonaRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("personas")
      .insert({
        user_id: input.userId,
        name: input.name,
        persona_prompt: input.personaPrompt,
        examples: input.examples,
      })
      .select("id, user_id, name, persona_prompt, examples")
      .single();
    if (error || !data) throw error ?? new Error("Insert failed");
    const parsed = PersonaRowSchema.parse(data);
    return parsed;
  },
};
