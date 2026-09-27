const LANGUAGE_ALIASES: Record<string, string> = {
  coffeescript: "coffee",
  dockerfile: "bash",
  golang: "go",
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
  dart: "typescript",
  django: "python",
  erb: "html",
  gradle: "groovy",
  kotlin: "java",
  properties: "ini",
};

export function normalizeShikiLanguage(lang: string | undefined): string {
  const raw = lang?.trim().toLowerCase().split(/\s+/)[0];
  if (!raw) return "plaintext";

  const aliased = LANGUAGE_ALIASES[raw] ?? raw;
  return UNSUPPORTED_LANGUAGE_FALLBACKS[aliased] ?? aliased;
}
