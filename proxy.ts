import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

const HIDDEN_ROUTE_PREFIX = "/blog";

function isHiddenBlogRoute(pathname: string) {
  return pathname === HIDDEN_ROUTE_PREFIX || pathname.startsWith(`${HIDDEN_ROUTE_PREFIX}/`);
}

export async function proxy(request: NextRequest) {
  if (isHiddenBlogRoute(request.nextUrl.pathname)) {
    return new Response(null, { status: 404 });
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/api/studio/:path*",
    "/auth/:path*",
    "/blog",
    "/blog/:path*",
    "/interview/:path*",
    "/studio/:path*",
  ],
};
