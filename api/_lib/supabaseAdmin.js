// Server-side Supabase client using the SERVICE ROLE key, which bypasses
// Row Level Security entirely. This must NEVER be imported into anything
// that ships to the browser - it isn't, everything in api/_lib/ only
// runs server-side, same as the rest of this folder - and the service
// role key must NEVER be prefixed with VITE_ (that prefix is what tells
// Vite to bundle a value into client-side code, which would leak it).
//
// Required env vars (Vercel Project Settings, and .env.local for
// `vercel dev`):
//   VITE_SUPABASE_URL (or SUPABASE_URL) - the project URL isn't secret,
//     so it's fine that this is the same VITE_-prefixed variable the
//     browser-side anon client already reads via import.meta.env.
//   SUPABASE_SERVICE_ROLE_KEY - deliberately NOT VITE_-prefixed. This one
//     must stay server-only.

import { createClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';

// supabase-js's createClient() eagerly constructs a Realtime (WebSocket)
// sub-client internally, even though this admin client only ever does
// plain REST calls (insert/select/update) and never opens a realtime
// subscription. On Node versions before 22 there's no native global
// WebSocket for it to find, and that construction throws immediately:
// "Node.js detected but native WebSocket not found." Polyfilling the
// global before createClient() runs satisfies that internal check -
// nothing in this file actually needs real WebSocket functionality.
// Requires: npm install ws
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket;
}

let client;

export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('VITE_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY is not set on the server');
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}