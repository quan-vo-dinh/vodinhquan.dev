import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/mdx/code-block";
import { cn } from "@/lib/utils";

type InterviewMarkdownProps = {
  children: string;
  className?: string;
};

export function InterviewMarkdown({
  children,
  className,
}: InterviewMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm sm:prose-base max-w-none text-zinc-800 dark:text-zinc-200 dark:prose-invert w-full min-w-0 overflow-hidden",
        "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 sm:prose-p:my-3",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:font-mono prose-code:text-[0.82em] prose-code:break-words prose-code:whitespace-pre-wrap sm:prose-code:px-1.5 sm:prose-code:text-sm",
        "prose-pre:p-0 prose-pre:m-0 prose-pre:border-none prose-pre:bg-transparent",
        "prose-headings:text-foreground prose-strong:text-foreground",
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ node, ...props }) => <CodeBlock {...props} />,
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
