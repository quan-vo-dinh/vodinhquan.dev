export function normalizeFlashcardIndex(index: number, questionCount: number) {
  if (questionCount <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), questionCount - 1);
}
