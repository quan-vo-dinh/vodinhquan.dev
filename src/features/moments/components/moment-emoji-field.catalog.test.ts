import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const emojiFieldSource = readFileSync(
  fileURLToPath(new URL("./moment-emoji-field.tsx", import.meta.url)),
  "utf8",
);

describe("MomentEmojiField catalog", () => {
  it("uses the searchable virtualized Frimousse catalog", () => {
    expect(emojiFieldSource).toContain('from "frimousse"');
    expect(emojiFieldSource).toContain("<EmojiPicker.Search");
    expect(emojiFieldSource).toContain("<EmojiPicker.Loading");
    expect(emojiFieldSource).toContain("<EmojiPicker.Empty");
    expect(emojiFieldSource).toContain("<EmojiPicker.List");
    expect(emojiFieldSource).not.toContain("MOMENT_EMOJI_GROUPS");
  });
});
