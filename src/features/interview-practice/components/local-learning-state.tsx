"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const LEARNED_STORAGE_KEY = "interview-practice:v1:learned";
const BOOKMARK_STORAGE_KEY = "interview-practice:v1:bookmarks";

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

export function useLocalLearningState() {
  const [isReady, setIsReady] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLearnedIds(readNumberSet(LEARNED_STORAGE_KEY));
    setBookmarkedIds(readNumberSet(BOOKMARK_STORAGE_KEY));
    setIsReady(true);
  }, []);

  const toggleLearned = useCallback((id: number) => {
    setLearnedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      writeNumberSet(LEARNED_STORAGE_KEY, nextIds);
      return nextIds;
    });
  }, []);

  const toggleBookmark = useCallback((id: number) => {
    setBookmarkedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      writeNumberSet(BOOKMARK_STORAGE_KEY, nextIds);
      return nextIds;
    });
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
