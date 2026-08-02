import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/mdx/code-block";
import { cn } from "@/lib/utils";

import { formatInterviewAnswer } from "../lib/format-interview-answer";

type InterviewMarkdownProps = {
  children: string;
  className?: string;
};

export function InterviewMarkdown({
  children,
  className,
}: InterviewMarkdownProps) {
  const content = formatInterviewAnswer(children);

  return (
    <div
      className={cn(
        "prose prose-base sm:prose-sm max-w-full text-zinc-900 dark:text-zinc-100 dark:prose-invert w-full min-w-0 overflow-hidden leading-relaxed sm:leading-normal",
        "prose-pre:max-w-full prose-pre:overflow-x-auto",
        "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 sm:prose-p:my-3",
        "prose-pre:p-0 prose-pre:m-0 prose-pre:border-none prose-pre:bg-transparent",
        "prose-headings:text-foreground prose-strong:text-foreground",
        "prose-blockquote:my-3 prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/40 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-foreground",
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ node, ...props }) => <CodeBlock {...props} />,
          // Inline code: render as span to completely bypass .prose :not(pre) > code background box in globals.css
          code: ({ node, className: codeClass, children: codeChildren, ...props }) => {
            // Block code (inside fenced ``` blocks) has a language- className — pass through
            if (codeClass) {
              return <code className={codeClass} {...props}>{codeChildren}</code>;
            }
            // Inline code: render as span without box/border/padding, styled in distinct sky blue
            return (
              <span className="font-mono font-semibold text-sky-600 dark:text-sky-400 text-[0.88em] mx-0.5">
                {codeChildren}
              </span>
            );
          },
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-4 border border-border rounded-xl">
              <table {...props} className="w-full text-sm my-0" />
            </div>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="rounded-r-lg border border-border/50"
            />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
