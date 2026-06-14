import { NextResponse, type NextRequest } from "next/server";

import { isSiteOwner } from "@/features/auth/lib/auth-authorization";
import { resolveAuthOrigin, safeNextPath } from "@/features/auth/lib/auth-redirect";
import { checkDatabaseOwner } from "@/features/auth/lib/database-owner-authorization";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const {
    appOrigin,
    isDevelopment,
    siteOwnerGitHubUsername,
  } = getServerEnv();
  const origin = resolveAuthOrigin({
    configuredOrigin: appOrigin,
    isDevelopment,
    requestUrl: request.url,
  });

  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const isDatabaseOwner = await checkDatabaseOwner((functionName) =>
        supabase.rpc(functionName)
      );

      if (
        user &&
        isDatabaseOwner &&
        isSiteOwner(
          user.user_metadata,
          siteOwnerGitHubUsername
        )
      ) {
        const res = NextResponse.redirect(`${origin}${next}`);
        res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
        return res;
      }

      await supabase.auth.signOut();

      const unauthorizedResponse = NextResponse.redirect(
        `${origin}/auth/auth-code-error?reason=unauthorized`
      );
      unauthorizedResponse.headers.set(
        "Cache-Control",
        "no-store, max-age=0, must-revalidate"
      );
      return unauthorizedResponse;
    }
  }

  const res = NextResponse.redirect(`${origin}/auth/auth-code-error`);
  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return res;
}
