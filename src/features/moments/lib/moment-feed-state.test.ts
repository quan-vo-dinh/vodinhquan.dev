import { describe, expect, it, vi } from "vitest";

import {
  loadMomentDetailState,
  loadMomentFeedState,
  loadOwnerMomentFeedState,
} from "./moment-feed-state";
import { MomentRepositoryError } from "./moment-repository-error";

describe("Moment feed state", () => {
  it("returns an unavailable state when the data source cannot be reached", async () => {
    const loadMoments = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    await expect(loadMomentFeedState(loadMoments)).resolves.toEqual({
      moments: [],
      status: "unavailable",
    });
  });

  it("returns loaded moments when the data source is available", async () => {
    const moments = [
      {
        cover: null,
        description: null,
        location: null,
        occurredAt: null,
        photoCount: 0,
        publishedAt: null,
        slug: "street-frames",
        title: "Street Frames",
      },
    ];

    await expect(
      loadMomentFeedState(async () => moments)
    ).resolves.toEqual({
      moments,
      status: "ready",
    });
  });

  it("distinguishes an unavailable detail source from a missing moment", async () => {
    await expect(
      loadMomentDetailState(async () => {
        throw new TypeError("fetch failed");
      })
    ).resolves.toEqual({
      moment: null,
      status: "unavailable",
    });

    await expect(
      loadMomentDetailState(async () => null)
    ).resolves.toEqual({
      moment: null,
      status: "not-found",
    });
  });

  it("reports when the owner Studio schema has not been migrated", async () => {
    const loadMoments = vi.fn().mockRejectedValue(
      new MomentRepositoryError(
        "Could not find the table 'public.moments' in the schema cache",
        "PGRST205"
      )
    );

    await expect(loadOwnerMomentFeedState(loadMoments)).resolves.toEqual({
      moments: [],
      status: "setup-required",
    });
  });

  it("keeps unrelated owner Studio failures separate from setup errors", async () => {
    const loadMoments = vi
      .fn()
      .mockRejectedValue(new MomentRepositoryError("Permission denied", "42501"));

    await expect(loadOwnerMomentFeedState(loadMoments)).resolves.toEqual({
      moments: [],
      status: "unavailable",
    });
  });
});
