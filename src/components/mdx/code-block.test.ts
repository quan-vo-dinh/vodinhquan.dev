import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CodeBlock } from "./code-block";

vi.mock("@/i18n/locale-provider", () => ({
  useI18n: () => ({
    dictionary: {
      mdx: {
        copied: "Copied",
        copyCode: "Copy code",
        copyFailed: "Copy failed",
      },
    },
  }),
}));

describe("CodeBlock", () => {
  it("keeps controls outside the semantic pre and code elements", () => {
    const html = renderToStaticMarkup(
      createElement(
        CodeBlock,
        { className: "source-pre" },
        createElement(
          "code",
          { className: "language-ts" },
          "const answer: number = 42;"
        )
      )
    );

    const preMarkup = html.match(/<pre[\s\S]*?<\/pre>/)?.[0];
    const buttonTag = html.match(/<button[^>]*>/)?.[0];

    expect(preMarkup).toBeDefined();
    expect(preMarkup).toContain("<code");
    expect(preMarkup).not.toContain("<button");
    expect(preMarkup).not.toContain("<div");
    expect(preMarkup).toContain("source-pre");
    expect(buttonTag).not.toContain("source-pre");
    expect(html.indexOf("<button")).toBeLessThan(html.indexOf("<pre"));
  });
});
