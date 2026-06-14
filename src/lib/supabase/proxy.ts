import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getServerEnv } from "@/lib/env";

import {
  isStaleSupabaseRefreshTokenError,
  isSupabaseAuthCookieName,
} from "./session-cookies";
import type { Database } from "./types";

export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { supabasePublishableKey, supabaseUrl } = getServerEnv();

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.getUser();

  if (isStaleSupabaseRefreshTokenError(error)) {
    for (const cookie of request.cookies.getAll()) {
      if (isSupabaseAuthCookieName(cookie.name)) {
        request.cookies.delete(cookie.name);
        supabaseResponse.cookies.delete(cookie.name);
      }
    }
  }

  return supabaseResponse;
}
