"use client";

import { useEffect, useState, type ComponentProps } from "react";

import { normalizeShikiLanguage } from "@/lib/normalize-shiki-language";
import { cn } from "@/lib/utils";

import { CodeCopyButton } from "./code-copy-button";
import { addPreClassName, getCodeBlockDetails } from "./code-block-utils";

type ClientCodeBlockProps = ComponentProps<"pre">;

export function ClientCodeBlock({
  children,
  ...props
}: ClientCodeBlockProps) {
  const { language, sourceCode, title } = getCodeBlockDetails(children);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  useEffect(() => {
    if (!sourceCode) {
      return;
    }

    let cancelled = false;

    async function highlight() {
      const { codeToHtml } = await import("shiki/bundle/web");
      const render = (lang: string) =>
        codeToHtml(sourceCode, {
          defaultColor: false,
          lang,
          themes: {
            dark: "github-dark",
            light: "github-light",
          },
        });

      try {
        const html = await render(normalizeShikiLanguage(language));
        if (!cancelled) {
          setHighlightedHtml(addPreClassName(html, props.className));
        }
      } catch {
        const html = await render("plaintext");
        if (!cancelled) {
          setHighlightedHtml(addPreClassName(html, props.className));
        }
      }
    }

    highlight().catch(() => {
      if (!cancelled) {
        setHighlightedHtml("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [language, props.className, sourceCode]);

  return (
    <div className="not-prose group relative w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background">
      {title ? (
        <div className="border-b border-border bg-muted/50 px-3 py-2.5 pr-14 text-xs font-medium text-foreground">
          {title}
        </div>
      ) : null}
      {sourceCode ? (
        <CodeCopyButton hasTitle={Boolean(title)} sourceCode={sourceCode} />
      ) : null}
      {highlightedHtml ? (
        <div
          className="w-full overflow-x-auto [&_pre]:m-0! [&_pre]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:text-left [&_pre]:font-mono! [&_pre]:text-[13px]! [&_pre]:leading-relaxed! [&_pre>code]:block [&_pre>code]:min-w-max [&_pre>code]:border-0! [&_pre>code]:bg-transparent! [&_pre>code]:p-4 [&_pre>code]:pr-14 [&_pre>code]:whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre
          {...props}
          className={cn(
            "m-0! w-full max-w-full overflow-x-auto bg-transparent! p-0! text-left font-mono! text-[13px]! leading-relaxed! [&>code]:block [&>code]:min-w-max [&>code]:border-0! [&>code]:bg-transparent! [&>code]:p-4 [&>code]:pr-14 [&>code]:whitespace-pre",
            props.className
          )}
        >
          {children}
        </pre>
      )}
    </div>
  );
}
