"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "../ui/button";
import { useI18n } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

type CodeCopyButtonProps = {
  hasTitle: boolean;
  sourceCode: string;
};

export function CodeCopyButton({
  hasTitle,
  sourceCode,
}: CodeCopyButtonProps) {
  const { dictionary } = useI18n();
  const [copyStatus, setCopyStatus] = useState<"error" | "idle" | "success">(
    "idle"
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }

    window.setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleCopy}
        variant="outline"
        size="icon"
        className={cn(
          "absolute right-3 z-10 size-8 cursor-pointer rounded-md border border-border bg-background/90 text-primary opacity-100 shadow-none transition-opacity hover:bg-muted lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100",
          hasTitle ? "top-11" : "top-3"
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
    </>
  );
}
