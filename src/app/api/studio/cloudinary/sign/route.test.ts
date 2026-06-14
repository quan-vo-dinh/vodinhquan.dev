import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import { createMomentUploadSignature } from "@/features/moments/lib/cloudinary-signature";

import { POST } from "./route";

vi.mock("@/features/auth/lib/get-owner-auth-user", () => ({
  getOwnerAuthUser: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getCloudinaryEnv: vi.fn(() => ({
    cloudinaryApiKey: "api-key",
    cloudinaryApiSecret: "api-secret",
    cloudinaryCloudName: "cloud-name",
    cloudinaryMomentsFolder: "moments",
  })),
}));

vi.mock("@/features/moments/lib/cloudinary-signature", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/moments/lib/cloudinary-signature")>();

  return {
    ...actual,
    createMomentUploadSignature: vi.fn(() => ({
      apiKey: "api-key",
      cloudName: "cloud-name",
      params: {
        folder: "moments",
        tags: "moments,owner-studio",
        timestamp: 1781395200,
      },
      signature: "signed",
    })),
  };
});

function createJsonRequest(body: unknown) {
  return new NextRequest("https://vodinhquan.dev/api/studio/cloudinary/sign", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

describe("Cloudinary signature route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects anonymous requests", async () => {
    vi.mocked(getOwnerAuthUser).mockResolvedValue(null);

    const response = await POST(createJsonRequest({}));

    expect(response.status).toBe(401);
  });

  it("rejects arbitrary upload folders", async () => {
    vi.mocked(getOwnerAuthUser).mockResolvedValue({
      id: "owner-id",
      user_metadata: {},
    } as Awaited<ReturnType<typeof getOwnerAuthUser>>);

    const response = await POST(createJsonRequest({ folder: "unsafe" }));

    expect(response.status).toBe(400);
    expect(createMomentUploadSignature).not.toHaveBeenCalled();
  });

  it("returns signed upload params for the owner", async () => {
    vi.mocked(getOwnerAuthUser).mockResolvedValue({
      id: "owner-id",
      user_metadata: {},
    } as Awaited<ReturnType<typeof getOwnerAuthUser>>);

    const response = await POST(createJsonRequest({}));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      apiKey: "api-key",
      cloudName: "cloud-name",
      signature: "signed",
    });
  });
});
