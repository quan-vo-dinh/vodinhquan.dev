"use client";

import { useState, useRef, useEffect, type ComponentProps } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { codeToHtml } from "shiki/bundle/web";
import { cn } from "@/lib/utils";
import { normalizeShikiLanguage } from "@/lib/normalize-shiki-language";

type CodeBlockProps = ComponentProps<"pre">;

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-([a-z0-9-]+)/i);
  return match ? match[1] : "plaintext";
}

export function CodeBlock({ children, ...props }: CodeBlockProps) {
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

    void codeToHtml(codeText, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        setRenderState({
          html: doc.querySelector("code")?.innerHTML ?? "",
          className: nextClassName,
          title: nextTitle,
        });
      })
      .catch((error) => {
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
    <div className="group relative rounded-xl overflow-hidden border border-border w-full max-w-full min-w-0">
      <pre
        ref={preRef}
        {...props}
        className={cn("p-0! m-0! overflow-x-auto w-full", props.className)}
      >
        {title && (
          <div className="p-3 text-xs font-medium border-b border-border rounded-t-xl bg-muted/50 text-foreground">
            {title}
          </div>
        )}

        <Button
          onClick={handleCopy}
          variant="outline"
          size="icon"
          className={cn("absolute size-8 text-primary cursor-pointer right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity rounded-md border border-border shadow-none", title ? "top-13" : "top-3", props.className)}
          aria-label="Copy code"
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
            ? "Code copied."
            : copyStatus === "error"
              ? "Unable to copy code."
              : ""}
        </span>
        {html && (
          <div className="p-3">
            <code
              className={`shiki ${className}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}

        {!html && (
          <div className="p-4">
            {children}
          </div>
        )}
      </pre >
    </div >
  );
}
