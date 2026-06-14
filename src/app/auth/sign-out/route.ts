import { NextResponse, type NextRequest } from "next/server";

import { resolveAuthOrigin } from "@/features/auth/lib/auth-redirect";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { appOrigin, isDevelopment } = getServerEnv();
  const origin = resolveAuthOrigin({
    configuredOrigin: appOrigin,
    isDevelopment,
    requestUrl: request.url,
  });

  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(`${origin}/interview`, {
    status: 303,
  });
}
