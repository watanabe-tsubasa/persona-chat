// File: app/api/getpersona/route.ts
// Role: Persona retrieval endpoint (Edge). Fetches persona by id
import type { NextRequest } from "next/server";
import { personaRepository } from "@/domains/personas/repositories/personaRepository";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "missing id" }), {
        status: 400,
      });
    }

    const data = await personaRepository.getById(id);
    if (!data) {
      console.error("Failed to fetch persona");
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
      });
    }

    return Response.json({ persona: data });
  } catch (e: unknown) {
    console.error("GET /api/getpersona failed", e);
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500,
    });
  }
}
