// File: lib/supabase-server.ts
// Role: Server-side Supabase client (service role), Edge-compatible
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env-supabase.server";

export function supabaseServer() {
  // service role を使うので必ずサーバ側でのみ利用
  const url = supabaseEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseEnv.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(
    url,
    key,
    { auth: { persistSession: false }, global: { fetch } }, // Edge 対応
  );
}
