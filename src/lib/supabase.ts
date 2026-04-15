import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client for use in Browser (Client Components)
// Uses @supabase/ssr to store auth tokens in cookies (not localStorage),
// so the proxy.ts can read them on the server side for auth checks.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Client for use in Server (Server Components / API Routes)
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);
