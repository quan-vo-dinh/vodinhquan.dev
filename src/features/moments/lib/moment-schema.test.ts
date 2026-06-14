import { describe, expect, it } from "vitest";

import {
  cloudinaryUploadResultSchema,
  momentFormSchema,
} from "./moment-schema";

describe("moment schemas", () => {
  it("normalizes optional Moment form fields", () => {
    expect(
      momentFormSchema.parse({
        description: "",
        location: "  Ho Chi Minh City  ",
        occurredAt: "",
        noteMarkdown: "",
        slug: "",
        title: "Street Frames",
      })
    ).toEqual({
      description: null,
      location: "Ho Chi Minh City",
      noteMarkdown: null,
      occurredAt: null,
      slug: null,
      title: "Street Frames",
    });
  });

  it("rejects missing Cloudinary upload identifiers", () => {
    expect(
      cloudinaryUploadResultSchema.safeParse({
        secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      }).success
    ).toBe(false);
  });
});
