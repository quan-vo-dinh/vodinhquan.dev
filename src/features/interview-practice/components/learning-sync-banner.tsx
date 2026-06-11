"use client";

import { CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useInterviewLearningState } from "./interview-learning-state-provider";

export function LearningSyncBanner() {
  const {
    hasLocalProgressToSync,
    isAuthenticated,
    isPending,
    syncBrowserProgress,
  } = useInterviewLearningState();

  if (!isAuthenticated || !hasLocalProgressToSync) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">Browser progress found</p>
        <p className="text-xs opacity-80">
          Sync the progress saved before sign-in into this GitHub account.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={syncBrowserProgress}
        disabled={isPending}
      >
        <CloudUpload className="mr-2 size-4" />
        {isPending ? "Syncing" : "Sync to account"}
      </Button>
    </div>
  );
}
