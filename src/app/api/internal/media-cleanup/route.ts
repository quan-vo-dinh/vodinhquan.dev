import { NextResponse, type NextRequest } from "next/server";

import { getMediaCleanupEndpointEnv } from "@/lib/env";

import { isAuthorizedMediaCleanupRequest } from "@/features/moments/lib/media-cleanup-auth";
import { processPendingMediaCleanupJobs } from "@/features/moments/lib/media-cleanup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let mediaCleanupSecret: string;

  try {
    mediaCleanupSecret = getMediaCleanupEndpointEnv().mediaCleanupSecret;
  } catch {
    return NextResponse.json(
      { error: "Media cleanup worker is not configured." },
      { status: 503 }
    );
  }

  if (
    !isAuthorizedMediaCleanupRequest(
      request.headers.get("authorization"),
      mediaCleanupSecret
    )
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    return NextResponse.json(await processPendingMediaCleanupJobs());
  } catch (error) {
    console.error("Media cleanup worker failed:", error);
    return NextResponse.json(
      { error: "Media cleanup worker failed." },
      { status: 500 }
    );
  }
}
