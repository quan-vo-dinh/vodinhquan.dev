import { bundledLanguages } from "shiki/bundle/web";

const LANGUAGE_ALIASES: Record<string, string> = {
  coffeescript: "coffee",
  dockerfile: "bash",
  golang: "bash",
  js: "javascript",
  md: "markdown",
  mdx: "markdown",
  objc: "c",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  shellscript: "bash",
  ts: "typescript",
  yml: "yaml",
  zsh: "bash",
};

const UNSUPPORTED_LANGUAGE_FALLBACKS: Record<string, string> = {
  dart: "javascript",
  django: "python",
  erb: "html",
  go: "bash",
  gradle: "bash",
  kotlin: "java",
  lua: "javascript",
  properties: "bash",
  ruby: "javascript",
  swift: "javascript",
};

function isBundledLanguage(lang: string): boolean {
  return lang in bundledLanguages;
}

export function normalizeShikiLanguage(lang: string | undefined): string {
  const raw = lang?.trim().toLowerCase().split(/\s+/)[0];
  if (!raw) return "plaintext";

  const aliased = LANGUAGE_ALIASES[raw] ?? raw;
  if (isBundledLanguage(aliased)) return aliased;

  const fallback = UNSUPPORTED_LANGUAGE_FALLBACKS[aliased];
  if (fallback && isBundledLanguage(fallback)) return fallback;

  return "plaintext";
}
