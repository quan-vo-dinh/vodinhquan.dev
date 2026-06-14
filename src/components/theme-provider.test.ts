import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "./theme-provider";

describe("ThemeProvider", () => {
  it("does not render an executable script inside the React tree", () => {
    const html = renderToStaticMarkup(
      createElement(
        ThemeProvider,
        { defaultTheme: "light" },
        createElement("p", null, "Visible content")
      )
    );

    expect(html).toContain("Visible content");
    expect(html).not.toContain("<script");
  });
});
