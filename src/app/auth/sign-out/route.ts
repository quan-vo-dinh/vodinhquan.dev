import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || requestUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || requestUrl.protocol.slice(0, -1);
  const origin = `${proto}://${host}`;

  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(`${origin}/interview`, {
    status: 303,
  });
}
