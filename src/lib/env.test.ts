import { describe, expect, it } from "vitest";

import { parseCloudinaryEnv, parseServerEnv } from "./env";

describe("environment parsing", () => {
  const baseEnv = {
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "supabase-key",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  };

  it("defaults the site owner to the configured GitHub login", () => {
    expect(parseServerEnv(baseEnv).siteOwnerGitHubUsername).toBe(
      "quan-vo-dinh"
    );
  });

  it("keeps the Interview owner alias aligned with the site owner", () => {
    expect(
      parseServerEnv({
        ...baseEnv,
        SITE_OWNER_GITHUB_USERNAME: "quan-vo-dinh",
        INTERVIEW_OWNER_GITHUB_USERNAME: "legacy-owner",
      }).interviewOwnerGitHubUsername
    ).toBe("quan-vo-dinh");
  });

  it("parses Cloudinary URL credentials without exposing them as public env", () => {
    const env = parseCloudinaryEnv({
      CLOUDINARY_URL: "cloudinary://api-key:api-secret@cloud-name",
    });

    expect(env).toMatchObject({
      cloudinaryApiKey: "api-key",
      cloudinaryApiSecret: "api-secret",
      cloudinaryCloudName: "cloud-name",
      cloudinaryMomentsFolder: "moments",
    });
    expect(env).not.toHaveProperty("cloudinaryMomentsUploadPreset");
  });
});
