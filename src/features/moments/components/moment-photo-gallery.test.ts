import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const gallerySource = readFileSync(
  fileURLToPath(new URL("./moment-photo-gallery.tsx", import.meta.url)),
  "utf8"
);

describe("MomentPhotoGallery lightbox", () => {
  it("renders the full-size viewer at the document body viewport boundary", () => {
    expect(gallerySource).toContain('createPortal(');
    expect(gallerySource).toContain("document.body");
    expect(gallerySource).toContain("h-dvh w-screen");
    expect(gallerySource).not.toContain("max-w-6xl");
  });
});
