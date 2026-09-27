import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getMediaCleanupWorkerEnv, getServerEnv } from "@/lib/env";

import type { Database } from "./types";

export function createSupabaseCleanupClient() {
  const { supabaseUrl } = getServerEnv();
  const { supabaseServiceRoleKey } = getMediaCleanupWorkerEnv();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
