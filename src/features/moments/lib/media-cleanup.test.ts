import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isAuthorizedMediaCleanupRequest } from "./media-cleanup-auth";
import { getMediaCleanupRetryAt } from "./media-cleanup";

describe("Moment media cleanup", () => {
  it("uses a bounded exponential retry delay", () => {
    const now = new Date("2026-09-25T00:00:00.000Z");

    expect(getMediaCleanupRetryAt(1, now)).toBe("2026-09-25T00:01:00.000Z");
    expect(getMediaCleanupRetryAt(20, now)).toBe("2026-09-26T00:00:00.000Z");
  });

  it("requires the cleanup endpoint bearer secret", () => {
    const secret = "a".repeat(32);

    expect(isAuthorizedMediaCleanupRequest(`Bearer ${secret}`, secret)).toBe(
      true
    );
    expect(isAuthorizedMediaCleanupRequest("Bearer wrong", secret)).toBe(false);
    expect(isAuthorizedMediaCleanupRequest(null, secret)).toBe(false);
  });
});
