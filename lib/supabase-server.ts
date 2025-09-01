import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  // service role を使うので必ずサーバ側でのみ利用
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(
    url,
    key,
    { auth: { persistSession: false }, global: { fetch } }, // Edge 対応
  );
}
