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

  try {
    const response = NextResponse.json(
      createMomentUploadSignature(parsed.data, getCloudinaryEnv())
    );
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("Cloudinary signature generation failed:", error);
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured on the server. Please check that CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME (or CLOUDINARY_URL) are set in your Vercel project environment variables.",
      },
      { status: 500 }
    );
  }
}
