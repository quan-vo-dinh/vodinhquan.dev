import { NextResponse, type NextRequest } from "next/server";

import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import {
  createMomentUploadSignature,
  momentUploadSignatureInputSchema,
} from "@/features/moments/lib/cloudinary-signature";
import { getCloudinaryEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const owner = await getOwnerAuthUser();

  if (!owner) {
    return NextResponse.json(
      { error: "Owner authentication required." },
      { status: 401 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = momentUploadSignatureInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload signature payload." },
      { status: 400 }
    );
  }

  const response = NextResponse.json(
    createMomentUploadSignature(parsed.data, getCloudinaryEnv())
  );
  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}
