export type InterviewLearningStateSnapshot = {
  learnedIds: number[];
  bookmarkedIds: number[];
  pinnedCategories: string[];
  isAuthenticated: boolean;
};

export type InterviewLearningStateSets = {
  learnedIds: Set<number>;
  bookmarkedIds: Set<number>;
  pinnedCategories: string[];
  isAuthenticated: boolean;
  isReady: boolean;
};
