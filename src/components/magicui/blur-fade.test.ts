import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BlurFade from "./blur-fade";

describe("BlurFade", () => {
  it("keeps server-rendered content visible without client hydration", () => {
    const html = renderToStaticMarkup(
      createElement(
        BlurFade,
        null,
        createElement("p", null, "Always visible")
      )
    );

    expect(html).toContain("Always visible");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("filter:blur(6px)");
  });
});
