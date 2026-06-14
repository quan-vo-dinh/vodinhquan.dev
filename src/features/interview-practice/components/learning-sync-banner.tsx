"use client";

import { CloudOff, CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useInterviewLearningState } from "./interview-learning-state-provider";

export function LearningSyncBanner() {
  const {
    hasLocalProgressToSync,
    isAuthenticated,
    isPending,
    isRemoteAvailable,
    persistenceError,
    syncBrowserProgress,
  } = useInterviewLearningState();

  if (!isAuthenticated) {
    return null;
  }

  if (!isRemoteAvailable) {
    return (
      <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
        <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">
            Account progress is temporarily unavailable
          </p>
          <p className="text-xs opacity-80">
            Changes are being saved in this browser and can be synced when the
            remote store is available again.
          </p>
        </div>
      </div>
    );
  }

  if (!hasLocalProgressToSync && !persistenceError) {
    return null;
  }

  if (persistenceError && !hasLocalProgressToSync) {
    return (
      <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">Progress could not be saved</p>
          <p className="text-xs opacity-80">
            The last confirmed account state was restored. Please try the
            action again.
          </p>
        </div>
      </div>
    );
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
