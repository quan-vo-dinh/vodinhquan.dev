import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/interview";
  }

  if (value.startsWith("//")) {
    return "/interview";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || requestUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || requestUrl.protocol.slice(0, -1);
  const origin = `${proto}://${host}`;

  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const res = NextResponse.redirect(`${origin}${next}`);
      res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
      return res;
    }
  }

  const res = NextResponse.redirect(`${origin}/auth/auth-code-error`);
  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return res;
}
