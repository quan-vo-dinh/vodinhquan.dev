"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import {
  setPinnedCategories as persistPinnedCategories,
  setQuestionBookmarked,
  setQuestionIgnored,
  setQuestionLearned,
  syncLocalLearningState,
  type LearningStateActionResult,
} from "../actions/learning-state-actions";
import {
  isLatestMutation,
  toggleNumberSet,
  type LearningProgressSnapshot,
} from "../lib/learning-progress";
import type { InterviewLearningStateSnapshot } from "../lib/learning-state-types";
import {
  BOOKMARK_STORAGE_KEY,
  IGNORED_STORAGE_KEY,
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
  ignoredIds: Set<number>;
  pinnedCategories: string[];
  isAuthenticated: boolean;
  isPending: boolean;
  isReady: boolean;
  isRemoteAvailable: boolean;
  persistenceError: string | null;
  hasLocalProgressToSync: boolean;
  syncSuccess: boolean;
  toggleBookmark: (id: number) => void;
  toggleLearned: (id: number) => void;
  toggleIgnored: (id: number) => void;
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

function hasStoredBrowserProgress() {
  return (
    readLocalNumberArray(LEARNED_STORAGE_KEY).length > 0 ||
    readLocalNumberArray(BOOKMARK_STORAGE_KEY).length > 0 ||
    readLocalNumberArray(IGNORED_STORAGE_KEY).length > 0 ||
    readLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY).length > 0
  );
}

export function InterviewLearningStateProvider({
  children,
  initialState,
}: InterviewLearningStateProviderProps) {
  const isRemoteAvailable = initialState.remoteStatus === "available";
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(isRemoteAvailable);
  const [learnedIds, setLearnedIds] = useState(() =>
    toSet(initialState.learnedIds)
  );
  const [bookmarkedIds, setBookmarkedIds] = useState(() =>
    toSet(initialState.bookmarkedIds)
  );
  const [ignoredIds, setIgnoredIds] = useState(() =>
    toSet(initialState.ignoredIds ?? [])
  );
  const [pinnedCategories, setPinnedCategoriesState] = useState(
    initialState.pinnedCategories
  );
  const [hasLocalProgressToSync, setHasLocalProgressToSync] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(
    initialState.remoteStatus === "unavailable"
      ? "remote-progress-unavailable"
      : null
  );

  const learnedIdsRef = useRef(learnedIds);
  const bookmarkedIdsRef = useRef(bookmarkedIds);
  const ignoredIdsRef = useRef(ignoredIds);
  const pinnedCategoriesRef = useRef(pinnedCategories);
  const confirmedRemoteSnapshotRef = useRef<LearningProgressSnapshot>({
    learnedIds: initialState.learnedIds,
    bookmarkedIds: initialState.bookmarkedIds,
    ignoredIds: initialState.ignoredIds ?? [],
    pinnedCategories: initialState.pinnedCategories,
  });
  const mutationVersionRef = useRef(0);
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());

  const applySnapshot = useCallback((snapshot: LearningProgressSnapshot) => {
    const nextLearnedIds = toSet(snapshot.learnedIds);
    const nextBookmarkedIds = toSet(snapshot.bookmarkedIds);
    const nextIgnoredIds = toSet(snapshot.ignoredIds ?? []);

    learnedIdsRef.current = nextLearnedIds;
    bookmarkedIdsRef.current = nextBookmarkedIds;
    ignoredIdsRef.current = nextIgnoredIds;
    pinnedCategoriesRef.current = snapshot.pinnedCategories;

    setLearnedIds(nextLearnedIds);
    setBookmarkedIds(nextBookmarkedIds);
    setIgnoredIds(nextIgnoredIds);
    setPinnedCategoriesState(snapshot.pinnedCategories);
  }, []);

  useEffect(() => {
    if (isRemoteAvailable) {
      // localStorage is an external store and must be inspected after SSR hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasLocalProgressToSync(hasStoredBrowserProgress());
      setIsReady(true);
      return;
    }

    const localIgnored = readLocalNumberArray(IGNORED_STORAGE_KEY);
    applySnapshot({
      learnedIds: readLocalNumberArray(LEARNED_STORAGE_KEY),
      bookmarkedIds: readLocalNumberArray(BOOKMARK_STORAGE_KEY),
      ignoredIds: localIgnored,
      pinnedCategories: readLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY),
    });
    setIsReady(true);
  }, [applySnapshot, isRemoteAvailable]);

  const enqueueRemoteMutation = useCallback(
    (
      command: () => Promise<LearningStateActionResult>,
      onLatestSuccess?: () => void
    ) => {
      const mutationVersion = mutationVersionRef.current + 1;
      mutationVersionRef.current = mutationVersion;

      const resultPromise = mutationQueueRef.current.then(command);
      mutationQueueRef.current = resultPromise.then(
        () => undefined,
        () => undefined
      );

      startTransition(async () => {
        let result: LearningStateActionResult;

        try {
          result = await resultPromise;
        } catch {
          result = {
            ok: false,
            reason: "unexpected-persistence-error",
            snapshot: null,
          };
        }

        if (result.snapshot) {
          confirmedRemoteSnapshotRef.current = result.snapshot;
        }

        if (!isLatestMutation(mutationVersionRef.current, mutationVersion)) {
          return;
        }

        if (result.snapshot) {
          applySnapshot(result.snapshot);
        } else if (!result.ok) {
          applySnapshot(confirmedRemoteSnapshotRef.current);
        }

        if (result.ok) {
          setPersistenceError(null);
          onLatestSuccess?.();
        } else {
          setPersistenceError(result.reason);
        }
      });
    },
    [applySnapshot]
  );

  const toggleLearned = useCallback(
    (id: number) => {
      const { enabled, next } = toggleNumberSet(learnedIdsRef.current, id);
      learnedIdsRef.current = next;
      setLearnedIds(next);

      if (!isRemoteAvailable) {
        writeLocalNumberArray(LEARNED_STORAGE_KEY, Array.from(next));
        return;
      }

      enqueueRemoteMutation(() =>
        setQuestionLearned({ questionId: id, enabled })
      );
    },
    [enqueueRemoteMutation, isRemoteAvailable]
  );

  const toggleBookmark = useCallback(
    (id: number) => {
      const { enabled, next } = toggleNumberSet(bookmarkedIdsRef.current, id);
      bookmarkedIdsRef.current = next;
      setBookmarkedIds(next);

      if (!isRemoteAvailable) {
        writeLocalNumberArray(BOOKMARK_STORAGE_KEY, Array.from(next));
        return;
      }

      enqueueRemoteMutation(() =>
        setQuestionBookmarked({ questionId: id, enabled })
      );
    },
    [enqueueRemoteMutation, isRemoteAvailable]
  );

  const toggleIgnored = useCallback(
    (id: number) => {
      const { enabled, next } = toggleNumberSet(ignoredIdsRef.current, id);
      ignoredIdsRef.current = next;
      setIgnoredIds(next);

      if (!isRemoteAvailable) {
        writeLocalNumberArray(IGNORED_STORAGE_KEY, Array.from(next));
        return;
      }

      enqueueRemoteMutation(() =>
        setQuestionIgnored({ questionId: id, enabled })
      );
    },
    [enqueueRemoteMutation, isRemoteAvailable]
  );

  const togglePinCategory = useCallback(
    (category: string) => {
      const current = pinnedCategoriesRef.current;
      const next = current.includes(category)
        ? current.filter((name) => name !== category)
        : [...current, category];

      pinnedCategoriesRef.current = next;
      setPinnedCategoriesState(next);

      if (!isRemoteAvailable) {
        writeLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY, next);
        return;
      }

      enqueueRemoteMutation(() => persistPinnedCategories(next));
    },
    [enqueueRemoteMutation, isRemoteAvailable]
  );

  const syncBrowserProgress = useCallback(() => {
    if (!isRemoteAvailable) {
      return;
    }

    enqueueRemoteMutation(
      () =>
        syncLocalLearningState({
          learnedIds: readLocalNumberArray(LEARNED_STORAGE_KEY),
          bookmarkedIds: readLocalNumberArray(BOOKMARK_STORAGE_KEY),
          ignoredIds: readLocalNumberArray(IGNORED_STORAGE_KEY),
          pinnedCategories: readLocalStringArray(
            PINNED_CATEGORIES_STORAGE_KEY
          ),
        }),
      () => {
        writeLocalNumberArray(LEARNED_STORAGE_KEY, []);
        writeLocalNumberArray(BOOKMARK_STORAGE_KEY, []);
        writeLocalNumberArray(IGNORED_STORAGE_KEY, []);
        writeLocalStringArray(PINNED_CATEGORIES_STORAGE_KEY, []);
        setHasLocalProgressToSync(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 5000);
      }
    );
  }, [enqueueRemoteMutation, isRemoteAvailable]);

  const value = useMemo(
    () => ({
      bookmarkedIds,
      hasLocalProgressToSync,
      ignoredIds,
      isAuthenticated: initialState.isAuthenticated,
      isPending,
      isReady,
      isRemoteAvailable,
      learnedIds,
      persistenceError,
      pinnedCategories,
      syncBrowserProgress,
      syncSuccess,
      toggleBookmark,
      toggleIgnored,
      toggleLearned,
      togglePinCategory,
    }),
    [
      bookmarkedIds,
      hasLocalProgressToSync,
      ignoredIds,
      initialState.isAuthenticated,
      isPending,
      isReady,
      isRemoteAvailable,
      learnedIds,
      persistenceError,
      pinnedCategories,
      syncBrowserProgress,
      syncSuccess,
      toggleBookmark,
      toggleIgnored,
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
