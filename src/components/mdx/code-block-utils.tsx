import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

type CodeElementProps = ComponentProps<"code"> & {
  "data-language"?: string;
  "data-title"?: string;
};

type CodeElement = ReactElement<CodeElementProps>;

function textContent(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(textContent).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(value)) {
    return textContent(value.props.children);
  }

  return "";
}

function isCodeElement(child: ReactNode): child is CodeElement {
  if (!isValidElement<CodeElementProps>(child)) {
    return false;
  }

  if (child.type === "code") {
    return true;
  }

  const className = child.props.className;
  return (
    typeof child.props["data-language"] === "string" ||
    (typeof className === "string" && /(?:^|\s)language-[a-z0-9-]+/i.test(className))
  );
}

function findCodeElement(children: ReactNode): CodeElement | null {
  return Children.toArray(children).find(isCodeElement) ?? null;
}

function extractLanguage(className?: string): string {
  const match = className?.match(/language-([a-z0-9-]+)/i);
  return match?.[1] ?? "plaintext";
}

export function getCodeBlockDetails(children: ReactNode) {
  const code = findCodeElement(children);
  const className = code?.props.className ?? "";

  return {
    codeClassName: className,
    language:
      code?.props["data-language"] ?? extractLanguage(className),
    sourceCode: code ? textContent(code.props.children) : "",
    title: code?.props["data-title"] ?? null,
  };
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function addPreClassName(html: string, className?: string) {
  if (!className) {
    return html;
  }

  return html.replace(
    /<pre\b([^>]*?)class="([^"]*)"/,
    (_, beforeClassName: string, existingClassName: string) =>
      `<pre${beforeClassName}class="${escapeAttribute(
        `${existingClassName} ${className}`
      )}"`
  );
}
