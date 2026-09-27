import { describe, expect, it } from "vitest";

import {
  getGitHubUsername,
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
      isSiteOwner({ user_name: "Site-Owner" }, "site-owner")
    ).toBe(true);
    expect(
      isSiteOwner({ user_name: "someone-else" }, "site-owner")
    ).toBe(false);
  });
});
