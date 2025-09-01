// File: app/api/personas/route.ts
// Role: Persona creation endpoint (Edge). Validates input, generates prompt/examples, persists
import type { NextRequest } from "next/server";
import { personaService } from "@/domains/personas/services/personaService";
import { logger } from "@/lib/logger";
import { CreatePersonaRequestSchema } from "@/lib/schemas/persona";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreatePersonaRequestSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "invalid body" },
        }),
        { status: 400 },
      );
    }
    const { userId, name, logs } = parsed.data;
    const created = await personaService.createFromLogs({ userId, name, logs });
    return Response.json({
      personaId: created.id,
      personaPrompt: created.personaPrompt,
      examples: created.examplesText,
    });
  } catch (e: unknown) {
    logger.error("POST /api/personas failed", e);
    return new Response(
      JSON.stringify({
        error: { code: "INTERNAL", message: "failed to create persona" },
      }),
      { status: 500 },
    );
  }
}
