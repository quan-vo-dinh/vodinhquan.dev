import { describe, expect, it } from "vitest";

import { getCloudinaryImageDeliveryUrl } from "./cloudinary-delivery";

describe("Cloudinary Moment image delivery", () => {
  it("adds an optimized width-limited delivery transformation", () => {
    expect(
      getCloudinaryImageDeliveryUrl(
        "https://res.cloudinary.com/demo/image/upload/v123/moments/photo.webp",
        1200
      )
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1200/v123/moments/photo.webp"
    );
  });

  it("leaves non-Cloudinary and malformed URLs unchanged", () => {
    expect(getCloudinaryImageDeliveryUrl("/photo.webp", 1200)).toBe(
      "/photo.webp"
    );
    expect(
      getCloudinaryImageDeliveryUrl("https://example.com/photo.webp", 1200)
    ).toBe("https://example.com/photo.webp");
  });
});
