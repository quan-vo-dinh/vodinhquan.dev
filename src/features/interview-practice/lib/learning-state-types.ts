import type { LearningProgressSnapshot } from "./learning-progress";

export type InterviewLearningStateSnapshot = LearningProgressSnapshot & {
  isAuthenticated: boolean;
  remoteStatus: "available" | "unavailable" | "not-applicable";
};

export type InterviewLearningStateSets = {
  learnedIds: Set<number>;
  bookmarkedIds: Set<number>;
  pinnedCategories: string[];
  isAuthenticated: boolean;
  isRemoteAvailable: boolean;
  isReady: boolean;
};
