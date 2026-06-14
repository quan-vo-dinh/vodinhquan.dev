export const LEARNED_STORAGE_KEY = "interview-practice:v1:learned";
export const BOOKMARK_STORAGE_KEY = "interview-practice:v1:bookmarks";
export const PINNED_CATEGORIES_STORAGE_KEY =
  "interview-practice:v1:pinned-categories";

export function readLocalNumberArray(key: string) {
  return Array.from(readNumberSet(key));
}

export function writeLocalNumberArray(key: string, ids: number[]) {
  writeNumberSet(key, new Set(ids));
}

export function readLocalStringArray(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeLocalStringArray(key: string, values: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    return;
  }
}

function readNumberSet(key: string) {
  if (typeof window === "undefined") {
    return new Set<number>();
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) {
      return new Set<number>();
    }

    return new Set(
      parsedValue.filter((value): value is number => typeof value === "number")
    );
  } catch {
    return new Set<number>();
  }
}

function writeNumberSet(key: string, value: Set<number>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(value)));
  } catch {
    return;
  }
}
