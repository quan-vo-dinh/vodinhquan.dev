import { describe, expect, it } from "vitest";

import { mapMomentSummary } from "./moment-mapper";

describe("moment mapper", () => {
  it("uses the configured cover asset before falling back to the first asset", () => {
    const summary = mapMomentSummary(
      {
        cover_asset_id: "asset-2",
        description: null,
        id: "moment-1",
        location: "Ho Chi Minh City",
        occurred_at: "2026-06-14",
        published_at: "2026-06-14T00:00:00.000Z",
        slug: "street-frames",
        title: "Street Frames",
      },
      [
        {
          alt: "First",
          caption: null,
          height: 800,
          id: "asset-1",
          secure_url: "https://res.cloudinary.com/demo/image/upload/first.jpg",
          width: 1200,
        },
        {
          alt: "Cover",
          caption: null,
          height: 800,
          id: "asset-2",
          secure_url: "https://res.cloudinary.com/demo/image/upload/cover.jpg",
          width: 1200,
        },
      ]
    );

    expect(summary.cover?.id).toBe("asset-2");
    expect(summary.photoCount).toBe(2);
  });
});
