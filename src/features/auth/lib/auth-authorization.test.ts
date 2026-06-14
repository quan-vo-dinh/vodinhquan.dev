import { describe, expect, it } from "vitest";

import {
  getGitHubUsername,
  isInterviewOwner,
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
      isInterviewOwner({ user_name: "VoDinhQuan" }, "vodinhquan")
    ).toBe(true);
    expect(
      isInterviewOwner({ user_name: "someone-else" }, "vodinhquan")
    ).toBe(false);
  });
});
