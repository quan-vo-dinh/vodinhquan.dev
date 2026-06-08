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
        "prose prose-sm sm:prose-base max-w-none text-zinc-800 dark:text-zinc-200 dark:prose-invert w-full min-w-0",
        "prose-pre:max-w-full prose-pre:overflow-x-auto",
        "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 sm:prose-p:my-3",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:font-mono prose-code:text-[0.82em] prose-code:break-words prose-code:whitespace-pre-wrap sm:prose-code:px-1.5 sm:prose-code:text-sm",
        "prose-pre:p-0 prose-pre:m-0 prose-pre:border-none prose-pre:bg-transparent",
        "prose-headings:text-foreground prose-strong:text-foreground",
        "prose-blockquote:my-3 prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/40 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-foreground",
        "prose-blockquote:prose-code:bg-background/80",
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ node, ...props }) => <CodeBlock {...props} />,
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
