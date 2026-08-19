import { createClient } from '@supabase/supabase-js';

// Reverted to the legacy anon key (2026-08). The new publishable key format
// (sb_publishable_...) produced a reproducible 401 on this project's REST
// endpoint: supabase-js sends the same raw key in both `apikey` and
// `Authorization: Bearer` headers, and PostgREST attempts to parse the
// Authorization value as a JWT - which the new opaque key format is not,
// causing rejection before RLS is ever evaluated. Confirmed this wasn't a
// policy/grant/SDK-version issue (direct `set role anon; insert ...` in the
// SQL editor succeeded). The legacy anon key IS a real JWT, so PostgREST
// parses it natively with no ambiguity. Anon key remains fully supported
// until Supabase's stated end-of-2026 deprecation - safe to stay on for now.
// Revisit the publishable key once this is confirmed resolved platform-side.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add both to .env.local (and to Vercel\u2019s Environment Variables for prod).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);