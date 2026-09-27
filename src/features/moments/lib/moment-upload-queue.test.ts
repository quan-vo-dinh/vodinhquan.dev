import { describe, expect, it } from "vitest";

import { mapWithConcurrency, retryAsync } from "./moment-upload-queue";

describe("Moment upload queue", () => {
  it("does not exceed the requested concurrency", async () => {
    let active = 0;
    let peak = 0;

    const results = await mapWithConcurrency(
      [1, 2, 3, 4, 5],
      2,
      async (value) => {
        active += 1;
        peak = Math.max(peak, active);
        await Promise.resolve();
        active -= 1;
        return value * 2;
      }
    );

    expect(peak).toBeLessThanOrEqual(2);
    expect(results).toEqual([
      { status: "fulfilled", value: 2 },
      { status: "fulfilled", value: 4 },
      { status: "fulfilled", value: 6 },
      { status: "fulfilled", value: 8 },
      { status: "fulfilled", value: 10 },
    ]);
  });

  it("retries a failed operation before returning its value", async () => {
    let calls = 0;

    await expect(
      retryAsync(
        async () => {
          calls += 1;

          if (calls === 1) {
            throw new Error("temporary");
          }

          return "uploaded";
        },
        { wait: () => Promise.resolve() }
      )
    ).resolves.toBe("uploaded");

    expect(calls).toBe(2);
  });
});
