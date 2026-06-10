const SECTION_BREAK_MARKERS =
  /(?:^|[.!?]\s+|\s+)(?=(?:\*\*)?(?:Ví dụ thực tế|Practical example|Ứng dụng thực tế|Ứng dụng chính|Practical use(?: case)?|Khác biệt cốt lõi(?:\s+với)?|Core differences(?:\s+from)?|Lưu ý|Note|Pitfall|Mẹo nhớ|Memory tip)(?:\*\*)?:?)/gi;

const EXAMPLE_LINE_PATTERN =
  /^(?:\*\*)?(Ví dụ thực tế|Practical example|Ứng dụng thực tế|Practical use(?: case)?)(?:\*\*)?:\s*([\s\S]+)$/i;

const NOTE_LINE_PATTERN =
  /^(?:\*\*|_)?(Lưu ý|Mẹo nhớ|Note|Memory tip|Pitfall)(?:\*\*|_)?:\s*([\s\S]+)$/i;

function splitByFences(text: string): Array<{ fenced: boolean; content: string }> {
  const parts: Array<{ fenced: boolean; content: string }> = [];
  let index = 0;

  while (index < text.length) {
    if (text.startsWith("```", index)) {
      const fenceEnd = text.indexOf("```", index + 3);
      if (fenceEnd !== -1) {
        parts.push({
          fenced: true,
          content: text.slice(index, fenceEnd + 3),
        });
        index = fenceEnd + 3;
        continue;
      }
    }

    const nextFence = text.indexOf("```", index);
    const end = nextFence === -1 ? text.length : nextFence;
    parts.push({ fenced: false, content: text.slice(index, end) });
    index = end;
  }

  return parts.filter((part) => part.content.length > 0);
}

function looksLikeCode(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.includes("\n")) return true;
  if (trimmed.length > 48) return true;
  return /(?:^|[\s;])(?:const|let|var|function|import|export|require|await|async|class|return|def |SELECT|curl|npm |pnpm |docker )/i.test(
    trimmed
  );
}

function inferCodeLanguage(code: string): string {
  if (/^\s*def\s|print\(|import\s+\w+/m.test(code)) return "python";
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE)\s/im.test(code)) return "sql";
  if (/^\s*curl\s/m.test(code)) return "bash";
  if (/^\s*<\/?[a-z]/im.test(code)) return "html";
  return "javascript";
}

function normalizeLabel(label: string): string {
  return label.replace(/^\*\*|\*\*$/g, "").trim();
}

function prettifyCode(code: string): string {
  const trimmed = code.trim();
  if (!trimmed.includes("\n") && trimmed.includes(";") && trimmed.length > 60) {
    return trimmed.replace(/;\s*/g, ";\n").trim();
  }
  return trimmed;
}

function splitExplanationTail(remainder: string): {
  explanation: string;
  rest: string;
} {
  const trimmed = remainder.trim();
  if (!trimmed) {
    return { explanation: "", rest: "" };
  }

  const sentenceMatch = trimmed.match(/^([\s\S]+?[.!?])(\s+)([\s\S]+)$/);
  if (!sentenceMatch) {
    return { explanation: trimmed, rest: "" };
  }

  return {
    explanation: sentenceMatch[1].trim(),
    rest: sentenceMatch[3].trim(),
  };
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatExampleParagraph(paragraph: string): string {
  const match = paragraph.match(EXAMPLE_LINE_PATTERN);
  if (!match) return paragraph;

  const label = normalizeLabel(match[1]);
  const body = match[2].trim();
  const codeMatch = body.match(/^`([^`]+)`\s*(?:—|–|-)\s*([\s\S]*)$/);

  if (codeMatch && looksLikeCode(codeMatch[1])) {
    const language = inferCodeLanguage(codeMatch[1]);
    const { explanation, rest } = splitExplanationTail(codeMatch[2]);
    const parts = [
      `> **${label}**`,
      "",
      `\`\`\`${language}`,
      prettifyCode(codeMatch[1]),
      "```",
    ];

    if (explanation) {
      parts.push("", capitalizeFirst(explanation));
    }

    if (rest) {
      parts.push("", formatTextSegment(rest));
    }

    return parts.join("\n");
  }

  return `> **${label}**\n\n${body}`;
}

function formatNoteParagraph(paragraph: string): string {
  const match = paragraph.match(NOTE_LINE_PATTERN);
  if (!match) return paragraph;

  const label = normalizeLabel(match[1]);
  const body = match[2].trim();
  return `**${label}:** ${body}`;
}

function insertSectionBreaks(text: string): string {
  return text.replace(SECTION_BREAK_MARKERS, (match) => {
    if (/^[.!?]\s+$/.test(match) || match === " ") {
      return `${match.trimEnd()}\n\n`;
    }
    return "\n\n";
  });
}

function splitDenseParagraph(paragraph: string): string {
  const trimmed = paragraph.trim();
  if (!trimmed) return paragraph;
  if (trimmed.startsWith(">")) return trimmed;
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) return trimmed;
  if (/^\d+\.\s/.test(trimmed)) return trimmed;
  if (trimmed.length < 140) return trimmed;

  const sentences = trimmed.split(
    /(?<=[.!?])\s+(?=[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỴỶỸ`])/u
  );

  if (sentences.length <= 1) return trimmed;
  return sentences.map((sentence) => sentence.trim()).join("\n\n");
}

function formatTextSegment(text: string): string {
  const withBreaks = insertSectionBreaks(text.replace(/\r\n/g, "\n"));
  const paragraphs = withBreaks
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => {
      if (EXAMPLE_LINE_PATTERN.test(paragraph)) {
        return formatExampleParagraph(paragraph);
      }
      if (NOTE_LINE_PATTERN.test(paragraph)) {
        return formatNoteParagraph(paragraph);
      }
      return splitDenseParagraph(paragraph);
    })
    .join("\n\n");
}

function joinFormattedParts(parts: Array<{ fenced: boolean; content: string }>): string {
  const formattedParts = parts.map((part) =>
    part.fenced ? part.content : formatTextSegment(part.content)
  );

  let formatted = "";

  for (let i = 0; i < formattedParts.length; i++) {
    if (i > 0) {
      const previous = formattedParts[i - 1];
      const current = formattedParts[i];
      const needsBoundaryNewline =
        previous.endsWith("```") && current.length > 0 && !current.startsWith("\n");

      if (needsBoundaryNewline) {
        formatted += "\n";
      }
    }

    formatted += formattedParts[i];
  }

  return formatted;
}

export function formatInterviewAnswer(raw: string): string {
  if (!raw?.trim()) return raw;

  const formatted = joinFormattedParts(splitByFences(raw));

  return formatted.replace(/\n{3,}/g, "\n\n").trim();
}
