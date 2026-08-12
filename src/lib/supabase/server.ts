import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import { getServerEnv } from "@/lib/env";

import { STALE_SUPABASE_SESSION_HEADER } from "./session-cookies";
import type { Database } from "./types";

export const createSupabaseServerClient = cache(async () => {
  const cookieStore = await cookies();
  const { supabasePublishableKey, supabaseUrl } = getServerEnv();

  return createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies.
            // The request proxy handles refresh persistence.
          }
        },
      },
    }
  );
});

export const getCachedAuthUser = cache(async () => {
  const requestHeaders = await headers();

  if (requestHeaders.get(STALE_SUPABASE_SESSION_HEADER) === "1") {
    return { data: { user: null }, error: null };
  }

  const supabase = await createSupabaseServerClient();
  return supabase.auth.getUser();
});
