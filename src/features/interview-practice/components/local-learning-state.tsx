"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const LEARNED_STORAGE_KEY = "interview-practice:v1:learned";
export const BOOKMARK_STORAGE_KEY = "interview-practice:v1:bookmarks";
export const PINNED_CATEGORIES_STORAGE_KEY =
  "interview-practice:v1:pinned-categories";
const LOCAL_LEARNING_STATE_EVENT = "interview-practice:local-learning-state";

type LocalLearningSnapshot = {
  bookmarkedIds: Set<number>;
  isReady: boolean;
  learnedIds: Set<number>;
};

const serverSnapshot: LocalLearningSnapshot = {
  bookmarkedIds: new Set(),
  isReady: false,
  learnedIds: new Set(),
};

let cachedLearnedValue: string | null = null;
let cachedBookmarkValue: string | null = null;
let cachedSnapshot: LocalLearningSnapshot | null = null;

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
    queueMicrotask(() => {
      window.dispatchEvent(new Event(LOCAL_LEARNING_STATE_EVENT));
    });
  } catch {
    return;
  }
}

function readLocalLearningState() {
  return {
    bookmarkedIds: readNumberSet(BOOKMARK_STORAGE_KEY),
    isReady: typeof window !== "undefined",
    learnedIds: readNumberSet(LEARNED_STORAGE_KEY),
  };
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
    queueMicrotask(() => {
      window.dispatchEvent(new Event(LOCAL_LEARNING_STATE_EVENT));
    });
  } catch {
    return;
  }
}

function subscribeToLocalLearningState(onStoreChange: () => void) {
  window.addEventListener(LOCAL_LEARNING_STATE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(LOCAL_LEARNING_STATE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getLocalLearningSnapshot() {
  const learnedValue = typeof window !== "undefined" ? window.localStorage.getItem(LEARNED_STORAGE_KEY) : null;
  const bookmarkValue = typeof window !== "undefined" ? window.localStorage.getItem(BOOKMARK_STORAGE_KEY) : null;

  if (
    cachedSnapshot &&
    cachedLearnedValue === learnedValue &&
    cachedBookmarkValue === bookmarkValue
  ) {
    return cachedSnapshot;
  }

  cachedLearnedValue = learnedValue;
  cachedBookmarkValue = bookmarkValue;
  cachedSnapshot = readLocalLearningState();

  return cachedSnapshot;
}

export function useLocalLearningState() {
  const { bookmarkedIds, isReady, learnedIds } = useSyncExternalStore(
    subscribeToLocalLearningState,
    getLocalLearningSnapshot,
    () => serverSnapshot
  );

  const toggleLearned = useCallback((id: number) => {
    const nextIds = new Set(readNumberSet(LEARNED_STORAGE_KEY));

    if (nextIds.has(id)) {
      nextIds.delete(id);
    } else {
      nextIds.add(id);
    }

    writeNumberSet(LEARNED_STORAGE_KEY, nextIds);
  }, []);

  const toggleBookmark = useCallback((id: number) => {
    const nextIds = new Set(readNumberSet(BOOKMARK_STORAGE_KEY));

    if (nextIds.has(id)) {
      nextIds.delete(id);
    } else {
      nextIds.add(id);
    }

    writeNumberSet(BOOKMARK_STORAGE_KEY, nextIds);
  }, []);

  return useMemo(
    () => ({
      bookmarkedIds,
      isReady,
      learnedIds,
      toggleBookmark,
      toggleLearned,
    }),
    [bookmarkedIds, isReady, learnedIds, toggleBookmark, toggleLearned]
  );
}
