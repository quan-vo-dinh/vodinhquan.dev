import { describe, expect, it } from "vitest";

import { formatDate } from "./utils";

describe("formatDate", () => {
  it("formats dates for the active website locale", () => {
    expect(formatDate("2024-12-14", "vi")).toBe("14 tháng 12, 2024");
    expect(formatDate("2024-12-14", "en")).toBe("December 14, 2024");
  });
});
