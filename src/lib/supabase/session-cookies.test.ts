import { describe, expect, it } from "vitest";

import {
  isStaleSupabaseRefreshTokenError,
  isSupabaseAuthCookieName,
} from "./session-cookies";

describe("Supabase session cookie helpers", () => {
  it("matches Supabase auth token cookie chunks", () => {
    expect(isSupabaseAuthCookieName("sb-project-ref-auth-token")).toBe(true);
    expect(isSupabaseAuthCookieName("sb-project-ref-auth-token.0")).toBe(true);
    expect(isSupabaseAuthCookieName("sb-project-ref-auth-token.1")).toBe(true);
    expect(isSupabaseAuthCookieName("theme")).toBe(false);
  });

  it("recognizes stale refresh token auth errors", () => {
    expect(
      isStaleSupabaseRefreshTokenError({
        message: "Invalid Refresh Token: Refresh Token Not Found",
      })
    ).toBe(true);
    expect(isStaleSupabaseRefreshTokenError({ message: "Permission denied" }))
      .toBe(false);
    expect(isStaleSupabaseRefreshTokenError(null)).toBe(false);
  });
});
