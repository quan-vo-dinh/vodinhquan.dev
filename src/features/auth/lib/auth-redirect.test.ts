import { describe, expect, it } from "vitest";

import { resolveAuthOrigin, safeNextPath } from "./auth-redirect";

describe("safeNextPath", () => {
  it.each([
    [null, "/studio"],
    ["https://evil.example", "/studio"],
    ["//evil.example/path", "/studio"],
    ["/studio/moments", "/studio/moments"],
  ])("normalizes %s to %s", (value, expected) => {
    expect(safeNextPath(value)).toBe(expected);
  });
});

describe("resolveAuthOrigin", () => {
  it("uses the request origin only during local development", () => {
    expect(
      resolveAuthOrigin({
        configuredOrigin: "https://vodinhquan.dev",
        isDevelopment: true,
        requestUrl: "http://localhost:3000/auth/callback",
      })
    ).toBe("http://localhost:3000");
  });

  it("uses the configured canonical origin in production", () => {
    expect(
      resolveAuthOrigin({
        configuredOrigin: "https://vodinhquan.dev",
        isDevelopment: false,
        requestUrl: "https://attacker.example/auth/callback",
      })
    ).toBe("https://vodinhquan.dev");
  });
});
