import { describe, expect, it } from "vitest";

import {
  MOMENT_UPLOAD_MAX_BYTES,
  getMomentUploadFileError,
  isAllowedMomentUploadFormat,
} from "./moment-upload-policy";

describe("Moment upload policy", () => {
  it("accepts supported image files under the byte limit", () => {
    expect(
      getMomentUploadFileError({
        size: MOMENT_UPLOAD_MAX_BYTES,
        type: "image/webp",
      })
    ).toBeNull();
  });

  it("rejects unsupported file types and oversized files", () => {
    expect(
      getMomentUploadFileError({ size: 10, type: "image/gif" })
    ).toBe("unsupported-file-type");
    expect(
      getMomentUploadFileError({
        size: MOMENT_UPLOAD_MAX_BYTES + 1,
        type: "image/jpeg",
      })
    ).toBe("file-too-large");
  });

  it("normalizes provider format checks", () => {
    expect(isAllowedMomentUploadFormat("JPG")).toBe(true);
    expect(isAllowedMomentUploadFormat("gif")).toBe(false);
  });
});
