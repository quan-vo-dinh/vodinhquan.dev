"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import {
  setPinnedCategories as persistPinnedCategories,
  setQuestionBookmarked,
  setQuestionLearned,
  syncLocalLearningState,
} from "../actions/learning-state-actions";
import type { InterviewLearningStateSnapshot } from "../lib/learning-state-types";
import {
  BOOKMARK_STORAGE_KEY,
  LEARNED_STORAGE_KEY,
  PINNED_CATEGORIES_STORAGE_KEY,
  readLocalNumberArray,
  readLocalStringArray,
  writeLocalNumberArray,
  writeLocalStringArray,
} from "./local-learning-state";

type InterviewLearningStateContextValue = {
  bookmarkedIds: Set<number>;
  learnedIds: Set<number>;
  pinnedCategories: string[];
  isAuthenticated: boolean;
  isPending: boolean;
  isReady: boolean;
  hasLocalProgressToSync: boolean;
  toggleBookmark: (id: number) => void;
  toggleLearned: (id: number) => void;
  togglePinCategory: (category: string) => void;
  syncBrowserProgress: () => void;
};

const InterviewLearningStateContext =
  createContext<InterviewLearningStateContextValue | null>(null);

type InterviewLearningStateProviderProps = {
  children: ReactNode;
  initialState: InterviewLearningStateSnapshot;
};

function toSet(ids: number[]) {
  return new Set(ids);
}

export function InterviewLearningStateProvider({
  children,
  initialState,
}: InterviewLearningStateProviderProps) {
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(initialState.isAuthenticated);
  const [learnedIds, setLearnedIds] = useState(() => toSet(initialState.learnedIds));
  const [bookmarkedIds, setBookmarkedIds] = useState(() =>
    toSet(initialState.bookmarkedIds)
  );
  const [pinnedCategories, setPinnedCategoriesState] = useState(
    initialState.pinnedCategories
  );
  const [hasLocalProgressToSync, setHasLocalProgressToSync] = useState(false);

  useEffect(() => {
    if (initialState.isAuthenticated) {
      const hasProgress =
        readLocalNumberArray(LEARNED_STORAGE_KEY).length > 0 ||
        readLocalNumberArray(BOOKMARK_STORAGE_KEY).length > 0 ||
        readLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY).length > 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasLocalProgressToSync(hasProgress);
    } else {
      const localLearned = readLocalNumberArray(LEARNED_STORAGE_KEY);
      const localBookmarked = readLocalNumberArray(BOOKMARK_STORAGE_KEY);
      const localPinned = readLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY);

      setLearnedIds(new Set(localLearned));
      setBookmarkedIds(new Set(localBookmarked));
      setPinnedCategoriesState(localPinned);
    }
    setIsReady(true);
  }, [initialState.isAuthenticated]);

  const persistLocalLearned = useCallback((nextIds: Set<number>) => {
    writeLocalNumberArray(LEARNED_STORAGE_KEY, Array.from(nextIds));
  }, []);

  const persistLocalBookmarks = useCallback((nextIds: Set<number>) => {
    writeLocalNumberArray(BOOKMARK_STORAGE_KEY, Array.from(nextIds));
  }, []);

  const toggleLearned = useCallback(
    (id: number) => {
      setLearnedIds((current) => {
        const next = new Set(current);
        const enabled = !next.has(id);

        if (enabled) {
          next.add(id);
        } else {
          next.delete(id);
        }

        if (initialState.isAuthenticated) {
          startTransition(() => {
            void setQuestionLearned({ questionId: id, enabled });
          });
        } else {
          persistLocalLearned(next);
        }

        return next;
      });
    },
    [initialState.isAuthenticated, persistLocalLearned]
  );

  const toggleBookmark = useCallback(
    (id: number) => {
      setBookmarkedIds((current) => {
        const next = new Set(current);
        const enabled = !next.has(id);

        if (enabled) {
          next.add(id);
        } else {
          next.delete(id);
        }

        if (initialState.isAuthenticated) {
          startTransition(() => {
            void setQuestionBookmarked({ questionId: id, enabled });
          });
        } else {
          persistLocalBookmarks(next);
        }

        return next;
      });
    },
    [initialState.isAuthenticated, persistLocalBookmarks]
  );

  const togglePinCategory = useCallback(
    (category: string) => {
      setPinnedCategoriesState((current) => {
        const next = current.includes(category)
          ? current.filter((name) => name !== category)
          : [...current, category];

        if (initialState.isAuthenticated) {
          startTransition(() => {
            void persistPinnedCategories(next);
          });
        } else {
          writeLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY, next);
        }

        return next;
      });
    },
    [initialState.isAuthenticated]
  );

  const syncBrowserProgress = useCallback(() => {
    const localLearnedIds = readLocalNumberArray(LEARNED_STORAGE_KEY);
    const localBookmarkedIds = readLocalNumberArray(BOOKMARK_STORAGE_KEY);
    const localPinnedCategories = readLocalStringArray(
      PINNED_CATEGORIES_STORAGE_KEY
    );

    startTransition(() => {
      void syncLocalLearningState({
        learnedIds: localLearnedIds,
        bookmarkedIds: localBookmarkedIds,
        pinnedCategories: localPinnedCategories,
      }).then((result) => {
        if (!result.ok) {
          return;
        }

        setLearnedIds((current) => new Set([...current, ...localLearnedIds]));
        setBookmarkedIds(
          (current) => new Set([...current, ...localBookmarkedIds])
        );
        setPinnedCategoriesState((current) =>
          Array.from(new Set([...current, ...localPinnedCategories]))
        );
        writeLocalNumberArray(LEARNED_STORAGE_KEY, []);
        writeLocalNumberArray(BOOKMARK_STORAGE_KEY, []);
        writeLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY, []);
        setHasLocalProgressToSync(false);
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      bookmarkedIds,
      hasLocalProgressToSync,
      isAuthenticated: initialState.isAuthenticated,
      isPending,
      isReady,
      learnedIds,
      pinnedCategories,
      syncBrowserProgress,
      toggleBookmark,
      toggleLearned,
      togglePinCategory,
    }),
    [
      bookmarkedIds,
      hasLocalProgressToSync,
      initialState.isAuthenticated,
      isPending,
      isReady,
      learnedIds,
      pinnedCategories,
      syncBrowserProgress,
      toggleBookmark,
      toggleLearned,
      togglePinCategory,
    ]
  );

  return (
    <InterviewLearningStateContext.Provider value={value}>
      {children}
    </InterviewLearningStateContext.Provider>
  );
}

export function useInterviewLearningState() {
  const value = useContext(InterviewLearningStateContext);

  if (!value) {
    throw new Error(
      "useInterviewLearningState must be used within InterviewLearningStateProvider"
    );
  }

  return value;
}
