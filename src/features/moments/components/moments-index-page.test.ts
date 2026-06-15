import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const momentsIndexSource = readFileSync(
  fileURLToPath(new URL("./moments-index-page.tsx", import.meta.url)),
  "utf8",
);

describe("MomentsIndexPage owner byline", () => {
  it("renders the authoritative owner identity in the page header", () => {
    expect(momentsIndexSource).toContain(
      'import { DATA } from "@/data/resume";',
    );
    expect(momentsIndexSource).toContain("dictionary.moments.curatedBy");
    expect(momentsIndexSource).toContain("DATA.name");
    expect(momentsIndexSource).toContain("DATA.avatarUrl");
    expect(momentsIndexSource).toContain("DATA.initials");
    expect(momentsIndexSource).toContain('<Avatar className="size-8');
  });
});
