import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";

import type { Database } from "./types";

export function createSupabasePublicServerClient() {
  const { supabasePublishableKey, supabaseUrl } = getServerEnv();

  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
