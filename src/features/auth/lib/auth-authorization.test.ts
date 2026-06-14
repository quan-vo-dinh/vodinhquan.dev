import { describe, expect, it } from "vitest";

import {
  getGitHubUsername,
  isInterviewOwner,
  isSiteOwner,
} from "./auth-authorization";

describe("GitHub owner authorization", () => {
  it("reads the provider username from supported metadata keys", () => {
    expect(getGitHubUsername({ user_name: "vodinhquan" })).toBe("vodinhquan");
    expect(getGitHubUsername({ preferred_username: "vodinhquan" })).toBe(
      "vodinhquan"
    );
  });

  it("matches the configured owner case-insensitively", () => {
    expect(
      isSiteOwner({ user_name: "Quan-Vo-Dinh" }, "quan-vo-dinh")
    ).toBe(true);
    expect(
      isSiteOwner({ user_name: "someone-else" }, "quan-vo-dinh")
    ).toBe(false);
  });

  it("keeps the Interview owner alias wired to the site owner check", () => {
    expect(
      isInterviewOwner({ preferred_username: "QUAN-VO-DINH" }, "quan-vo-dinh")
    ).toBe(true);
  });
});
