import { describe, expect, it } from "vitest";

import {
  buildMomentUploadSignatureParams,
  createMomentUploadSignature,
  momentUploadSignatureInputSchema,
} from "./cloudinary-signature";

const cloudinaryEnv = {
  cloudinaryApiKey: "api-key",
  cloudinaryApiSecret: "api-secret",
  cloudinaryCloudName: "cloud-name",
  cloudinaryMomentsFolder: "moments",
};

describe("Cloudinary moment upload signatures", () => {
  it("forces owner-controlled upload params", () => {
    const params = buildMomentUploadSignatureParams(
      { publicId: "street/saigon-001" },
      cloudinaryEnv,
      new Date("2026-06-14T00:00:00.000Z")
    );

    expect(params).toEqual({
      folder: "moments",
      public_id: "street/saigon-001",
      tags: "moments,owner-studio",
      timestamp: 1781395200,
    });
    expect(params).not.toHaveProperty("upload_preset");
  });

  it("rejects arbitrary folders from the client payload", () => {
    expect(
      momentUploadSignatureInputSchema.safeParse({
        folder: "other-user",
      }).success
    ).toBe(false);
  });

  it("returns signed params without returning the API secret", () => {
    const signature = createMomentUploadSignature(
      { context: "alt=Street photo" },
      cloudinaryEnv,
      new Date("2026-06-14T00:00:00.000Z"),
      () => "signed"
    );

    expect(signature).toEqual({
      apiKey: "api-key",
      cloudName: "cloud-name",
      params: {
        context: "alt=Street photo",
        folder: "moments",
        tags: "moments,owner-studio",
        timestamp: 1781395200,
      },
      signature: "signed",
    });
    expect(JSON.stringify(signature)).not.toContain("api-secret");
    expect(signature.params).not.toHaveProperty("upload_preset");
  });
});
