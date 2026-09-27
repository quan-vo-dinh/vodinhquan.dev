import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import type { ComponentProps } from "react";

import { normalizeShikiLanguage } from "@/lib/normalize-shiki-language";

import { CodeCopyButton } from "./code-copy-button";
import { addPreClassName, getCodeBlockDetails } from "./code-block-utils";

type CodeBlockProps = ComponentProps<"pre">;

async function highlightCode(sourceCode: string, language: string) {
  const render = (lang: string) =>
    codeToHtml(sourceCode, {
      defaultColor: false,
      lang: lang as BundledLanguage,
      themes: {
        dark: "github-dark",
        light: "github-light",
      },
    });

  try {
    return await render(normalizeShikiLanguage(language));
  } catch {
    return render("plaintext");
  }
}

/**
 * Blog MDX is rendered on the server, so syntax highlighting stays out of the
 * browser bundle. The copy control is the only client boundary in this block.
 */
export async function CodeBlock({ children, ...props }: CodeBlockProps) {
  const { language, sourceCode, title } = getCodeBlockDetails(children);

  if (!sourceCode) {
    return <pre {...props}>{children}</pre>;
  }

  const highlightedHtml = addPreClassName(
    await highlightCode(sourceCode, language),
    props.className
  );

  return (
    <div className="not-prose group relative w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background">
      {title ? (
        <div className="border-b border-border bg-muted/50 px-3 py-2.5 pr-14 text-xs font-medium text-foreground">
          {title}
        </div>
      ) : null}
      <CodeCopyButton hasTitle={Boolean(title)} sourceCode={sourceCode} />
      <div
        className="w-full overflow-x-auto [&_pre]:m-0! [&_pre]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:text-left [&_pre]:font-mono! [&_pre]:text-[13px]! [&_pre]:leading-relaxed! [&_pre>code]:block [&_pre>code]:min-w-max [&_pre>code]:border-0! [&_pre>code]:bg-transparent! [&_pre>code]:p-4 [&_pre>code]:pr-14 [&_pre>code]:whitespace-pre"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
