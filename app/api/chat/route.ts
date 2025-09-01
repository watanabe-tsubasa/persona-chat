// File: app/api/chat/route.ts
// Role: Chat endpoint (Edge). Validates input, fetches persona, streams AI response
import { streamText } from "ai";
import type { NextRequest } from "next/server";
import { personaRepository } from "@/domains/personas/repositories/personaRepository";
import { openai } from "@/lib/ai";
import { LLM_MODELS } from "@/lib/llm/models";
import { logger } from "@/lib/logger";
import { ChatRequestSchema } from "@/lib/schemas/chat";
import { clipMessages } from "@/lib/utils/messages";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ChatRequestSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "invalid body" },
        }),
        { status: 400 },
      );
    }
    const body = parsed.data;

    logger.debug("/api/chat body", body);

    const { personaId, messages } = body;

    // personaId が無ければデフォルト人格を使う
    let system = "あなたは親切なアシスタントです。";
    const fixedPairs: { role: "user" | "assistant"; content: string }[] = [];

    if (personaId) {
      const persona = await personaRepository.getById(personaId);
      if (persona) {
        system = persona.persona_prompt;
        if (persona.examples) {
          const blocks = persona.examples.split(/\n\n+/);
          for (const b of blocks) {
            const m = b.match(/user:\s*([\s\S]*?)\nassistant:\s*([\s\S]*)$/);
            if (m) {
              fixedPairs.push({ role: "user", content: m[1] });
              fixedPairs.push({ role: "assistant", content: m[2] });
            }
          }
        }
      } else {
        logger.warn("personaId provided but not found");
      }
    }

    // parts を string に変換
    const clipped = clipMessages(messages, 6);
    logger.debug("/api/chat merged messages", [...fixedPairs, ...clipped]);

    const result = streamText({
      model: openai(LLM_MODELS.chatAssistant),
      system,
      messages: [...fixedPairs, ...clipped],
    });

    // useChat 用レスポンス
    return result.toUIMessageStreamResponse();
  } catch (e: unknown) {
    logger.error("/api/chat failed", e);
    return new Response(
      JSON.stringify({ error: { code: "INTERNAL", message: "chat failed" } }),
      { status: 500 },
    );
  }
}
