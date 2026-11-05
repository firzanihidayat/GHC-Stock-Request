import { createClient } from '@supabase/supabase-js';

export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Missing Supabase server environment variables');
  // Only called by server-side Vercel functions. NEVER import into frontend.
  return createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false}});
}
export function json(data, status=200) {
  return new Response(JSON.stringify(data), {status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
}
