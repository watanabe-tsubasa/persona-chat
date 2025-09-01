import type { NextRequest } from "next/server";
import {
  generateFixedExamples,
  generatePersonaPromptFromLogs,
} from "@/lib/persona";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, logs } = await req.json();
    if (!userId || !name || !logs) {
      return new Response(JSON.stringify({ error: "missing params" }), {
        status: 400,
      });
    }

    const { personaPrompt } = await generatePersonaPromptFromLogs(logs);
    const { examplesText } = await generateFixedExamples(personaPrompt);

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("personas")
      .insert({
        user_id: userId,
        name,
        persona_prompt: personaPrompt,
        examples: examplesText,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({
      personaId: data.id,
      personaPrompt,
      examples: examplesText,
    });
  } catch (e: unknown) {
    console.error(e);
    return new Response(JSON.stringify({ error: "failed to create persona" }), {
      status: 500,
    });
  }
}
