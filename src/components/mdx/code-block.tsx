"use client";

import { useState, useRef, useEffect, type ComponentProps } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useI18n } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";
import { normalizeShikiLanguage } from "@/lib/normalize-shiki-language";

type CodeBlockProps = ComponentProps<"pre">;

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-([a-z0-9-]+)/i);
  return match ? match[1] : "plaintext";
}

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const { dictionary } = useI18n();
  const [copyStatus, setCopyStatus] = useState<"error" | "idle" | "success">(
    "idle"
  );
  const [{ html, className, title }, setRenderState] = useState<{
    html: string;
    className: string;
    title: string | null;
  }>({ html: "", className: "", title: null });
  const [sourceCode, setSourceCode] = useState("");
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    const codeEl = pre?.querySelector("code");
    if (!pre || !codeEl) return;

    const codeText = codeEl.textContent || "";
    const lang = normalizeShikiLanguage(extractLanguage(codeEl.className));
    const nextTitle = codeEl.getAttribute("data-title");
    const nextClassName = codeEl.className || "";
    setSourceCode(codeText);

    const highlight = async () => {
      const { codeToHtml } = await import("shiki/bundle/web");
      const html = await codeToHtml(codeText, {
        lang,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
        defaultColor: false,
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      setRenderState({
        html: doc.querySelector("code")?.innerHTML ?? "",
        className: nextClassName,
        title: nextTitle,
      });
    };

    highlight().catch((error) => {
      console.error("Failed to highlight code:", error);
      setRenderState({ html: "", className: nextClassName, title: nextTitle });
    });
  }, [children]);

  const handleCopy = async () => {
    const code =
      sourceCode || preRef.current?.querySelector("code")?.textContent || "";

    if (!code) {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  return (
    <div className="not-prose group relative w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background">
      {title && (
        <div className="border-b border-border bg-muted/50 px-3 py-2.5 pr-14 text-xs font-medium text-foreground">
          {title}
        </div>
      )}

      <Button
        type="button"
        onClick={handleCopy}
        variant="outline"
        size="icon"
        className={cn(
          "absolute right-3 z-10 size-8 cursor-pointer rounded-md border border-border bg-background/90 text-primary opacity-100 shadow-none transition-opacity hover:bg-muted lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100",
          title ? "top-11" : "top-3"
        )}
        aria-label={dictionary.mdx.copyCode}
      >
        {copyStatus === "success" ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <Copy
            className={cn(
              "size-4",
              copyStatus === "error" && "text-destructive"
            )}
          />
        )}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyStatus === "success"
          ? dictionary.mdx.copied
          : copyStatus === "error"
            ? dictionary.mdx.copyFailed
            : ""}
      </span>

      <pre
        ref={preRef}
        {...props}
        className={cn(
          "m-0! w-full max-w-full overflow-x-auto bg-transparent! p-0! text-left font-mono! text-[13px]! leading-relaxed! [&>code]:block [&>code]:min-w-max [&>code]:border-0! [&>code]:bg-transparent! [&>code]:p-4 [&>code]:pr-14 [&>code]:whitespace-pre",
          props.className
        )}
      >
        {html && (
          <code
            className={cn("shiki", className)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {!html && children}
      </pre>
    </div>
  );
}
