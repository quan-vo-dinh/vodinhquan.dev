import { describe, expect, it } from "vitest";

import { insertEmojiAtSelection } from "./emoji-insertion";

describe("insertEmojiAtSelection", () => {
  it("inserts an emoji at the current caret position", () => {
    expect(insertEmojiAtSelection("Saigon rain", "🌧️", 7, 7)).toEqual({
      caret: 10,
      value: "Saigon 🌧️rain",
    });
  });

  it("replaces the selected text with an emoji", () => {
    expect(insertEmojiAtSelection("Saigon rain", "🌧️", 7, 11)).toEqual({
      caret: 10,
      value: "Saigon 🌧️",
    });
  });

  it("appends the emoji when the selection is unavailable", () => {
    expect(insertEmojiAtSelection("Saigon", "🌆", null, null)).toEqual({
      caret: 8,
      value: "Saigon🌆",
    });
  });
});
