import { NextResponse, type NextRequest } from "next/server";

import { resolveAuthOrigin, safeNextPath } from "@/features/auth/lib/auth-redirect";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { appOrigin, isDevelopment } = getServerEnv();
  const origin = resolveAuthOrigin({
    configuredOrigin: appOrigin,
    isDevelopment,
    requestUrl: request.url,
  });

  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    const res = NextResponse.redirect(`${origin}/auth/auth-code-error`);
    res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res;
  }

  const res = NextResponse.redirect(data.url);
  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return res;
}
