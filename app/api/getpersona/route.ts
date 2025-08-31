import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'missing id' }), { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('personas')
      .select('id, name, persona_prompt, examples')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch persona', error);
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
    }

    return Response.json({ persona: data });
  } catch (e: any) {
    console.error('GET /api/getpersona failed', e);
    return new Response(JSON.stringify({ error: 'internal error' }), { status: 500 });
  }
}

