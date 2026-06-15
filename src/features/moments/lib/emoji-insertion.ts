export function insertEmojiAtSelection(
  value: string,
  emoji: string,
  selectionStart: number | null,
  selectionEnd: number | null,
) {
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? start;

  return {
    caret: start + emoji.length,
    value: `${value.slice(0, start)}${emoji}${value.slice(end)}`,
  };
}
