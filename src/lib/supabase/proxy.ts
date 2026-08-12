import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getServerEnv } from "@/lib/env";

import {
  isStaleSupabaseRefreshTokenError,
  isSupabaseAuthCookieName,
  STALE_SUPABASE_SESSION_HEADER,
} from "./session-cookies";
import type { Database } from "./types";

export async function updateSupabaseSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
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

          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.getClaims();

  if (isStaleSupabaseRefreshTokenError(error)) {
    requestHeaders.set(STALE_SUPABASE_SESSION_HEADER, "1");
    supabaseResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });

    for (const cookie of request.cookies.getAll()) {
      if (isSupabaseAuthCookieName(cookie.name)) {
        request.cookies.delete(cookie.name);
        supabaseResponse.cookies.delete(cookie.name);
      }
    }
  }

  return supabaseResponse;
}
