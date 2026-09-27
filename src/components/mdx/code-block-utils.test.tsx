import { createElement, type ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { getCodeBlockDetails } from "./code-block-utils";

function MarkdownCode(_props: ComponentProps<"code">) {
  return null;
}

describe("getCodeBlockDetails", () => {
  it("recognizes a renderer-wrapped fenced code element", () => {
    const details = getCodeBlockDetails(
      createElement(
        MarkdownCode,
        { className: "language-css" },
        ".card { color: red; }"
      )
    );

    expect(details).toMatchObject({
      language: "css",
      sourceCode: ".card { color: red; }",
    });
  });
});
