import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@/lib/ai';
import { supabaseServer } from '@/lib/supabase-server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 🔍 デバッグログ
    console.log("=== /api/chat request body ===");
    console.dir(body, { depth: null });
    console.log("==============================");

    const { personaId, messages } = body;

    if (!Array.isArray(messages)) {
      console.error("❌ messages が配列ではありません", messages);
      return new Response(JSON.stringify({ error: 'messages is required' }), { status: 400 });
    }

    // personaId が無ければデフォルト人格を使う
    let system = "あなたは親切なアシスタントです。";
    let fixedPairs: any[] = [];

    if (personaId) {
      const supabase = supabaseServer();
      const { data: persona, error } = await supabase
        .from('personas')
        .select('persona_prompt, examples')
        .eq('id', personaId)
        .single();

      if (!error && persona) {
        system = persona.persona_prompt;
        if (persona.examples) {
          const blocks = (persona.examples as string).split(/\n\n+/);
          for (const b of blocks) {
            const m = b.match(/user:\s*([\s\S]*?)\nassistant:\s*([\s\S]*)$/);
            if (m) {
              fixedPairs.push({ role: 'user', content: m[1] });
              fixedPairs.push({ role: 'assistant', content: m[2] });
            }
          }
        }
      } else {
        console.error("⚠️ personaId はあるが Supabase から取得できません", error);
      }
    }

    // parts を string に変換
    const clipped = messages.slice(-6).map((m: any) => {
      const textParts = m.parts
        ?.map((p: any) => (p.type === 'text' ? p.text : ''))
        .join('') ?? '';
      return { role: m.role, content: textParts };
    });

    console.log("=== /api/chat merged messages ===");
    console.dir([...fixedPairs, ...clipped], { depth: null });
    console.log("=================================");

    const result = await streamText({
      model: openai('gpt-4o'),
      system,
      messages: [...fixedPairs, ...clipped],
    });

    // useChat 用レスポンス
    return result.toUIMessageStreamResponse();
  } catch (e: any) {
    console.error("❌ /api/chat failed", e);
    return new Response(JSON.stringify({ error: 'chat failed' }), { status: 500 });
  }
}
