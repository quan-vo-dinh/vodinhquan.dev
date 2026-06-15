import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  resolveLocale,
  serializeLocaleCookie,
} from "./locale";

describe("site locale", () => {
  it("uses Vietnamese when no supported locale is stored", () => {
    expect(DEFAULT_LOCALE).toBe("vi");
    expect(resolveLocale(undefined)).toBe("vi");
    expect(resolveLocale("fr")).toBe("vi");
  });

  it("accepts both supported website locales", () => {
    expect(resolveLocale("vi")).toBe("vi");
    expect(resolveLocale("en")).toBe("en");
  });

  it("persists the locale as a site-wide cookie", () => {
    expect(serializeLocaleCookie("en")).toContain(
      `${LOCALE_COOKIE_NAME}=en`,
    );
    expect(serializeLocaleCookie("en")).toContain("Path=/");
    expect(serializeLocaleCookie("en")).toContain("SameSite=Lax");
  });
});
