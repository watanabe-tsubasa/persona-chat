import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  // service role を使うので必ずサーバ側でのみ利用
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false }, global: { fetch } } // Edge 対応
  );
}
