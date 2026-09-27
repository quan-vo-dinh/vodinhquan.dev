import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { verifyMomentCloudinaryUpload } from "./cloudinary-media";

const cloudinaryEnv = {
  cloudinaryApiKey: "api-key",
  cloudinaryApiSecret: "api-secret",
  cloudinaryCloudName: "cloud-name",
  cloudinaryMomentsFolder: "moments",
};

const upload = {
  asset_id: "asset-id",
  bytes: 1000,
  format: "webp",
  height: 800,
  public_id: "moments/upload-id",
  resource_type: "image" as const,
  secure_url: "https://res.cloudinary.com/cloud-name/image/upload/moments/upload-id.webp",
  width: 1200,
};

describe("Cloudinary Moment upload verification", () => {
  it("uses the provider resource instead of browser-submitted metadata", async () => {
    await expect(
      verifyMomentCloudinaryUpload(
        { ...upload, bytes: 1, width: 1 },
        {
          env: cloudinaryEnv,
          readResource: async () => ({ ...upload, type: "upload" }),
        }
      )
    ).resolves.toMatchObject({ bytes: 1000, width: 1200 });
  });

  it("rejects assets outside the owner-controlled folder", async () => {
    await expect(
      verifyMomentCloudinaryUpload(upload, {
        env: cloudinaryEnv,
        readResource: async () => ({
          ...upload,
          public_id: "unrelated/upload-id",
          type: "upload",
        }),
      })
    ).rejects.toThrow("outside the Moments folder");
  });

  it("rejects a provider response that exceeds the byte limit", async () => {
    await expect(
      verifyMomentCloudinaryUpload(upload, {
        env: cloudinaryEnv,
        readResource: async () => ({
          ...upload,
          bytes: 10 * 1024 * 1024 + 1,
          type: "upload",
        }),
      })
    ).rejects.toThrow("byte limit");
  });
});
