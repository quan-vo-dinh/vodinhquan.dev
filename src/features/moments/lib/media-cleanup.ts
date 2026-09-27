import "server-only";

import { after } from "next/server";

import { createSupabaseCleanupClient } from "@/lib/supabase/admin";

import { destroyMomentCloudinaryAsset } from "./cloudinary-media";

const MAX_CLEANUP_ATTEMPTS = 6;
const MAX_CLEANUP_BATCH_SIZE = 10;

export function getMediaCleanupRetryAt(
  attemptCount: number,
  now = new Date()
) {
  const delaySeconds = Math.min(60 * 60 * 24, 60 * 2 ** Math.max(0, attemptCount - 1));

  return new Date(now.getTime() + delaySeconds * 1000).toISOString();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown media cleanup error.";
}

function isSuccessfulCloudinaryDestroy(response: unknown) {
  if (!response || typeof response !== "object" || !("result" in response)) {
    return false;
  }

  return response.result === "ok" || response.result === "not found";
}

export async function processPendingMediaCleanupJobs(
  limit = MAX_CLEANUP_BATCH_SIZE
) {
  const supabase = createSupabaseCleanupClient();
  const { data: jobs, error } = await supabase.rpc("claim_media_cleanup_jobs", {
    p_limit: Math.min(Math.max(1, limit), MAX_CLEANUP_BATCH_SIZE),
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = {
    claimed: jobs?.length ?? 0,
    completed: 0,
    failed: 0,
    retried: 0,
  };

  for (const job of jobs ?? []) {
    try {
      const destroyResult = await destroyMomentCloudinaryAsset(
        job.public_id,
        job.resource_type
      );

      if (!isSuccessfulCloudinaryDestroy(destroyResult)) {
        throw new Error("Cloudinary did not confirm asset deletion.");
      }

      const completion = await supabase.rpc("complete_media_cleanup_job", {
        p_job_id: job.id,
      });

      if (completion.error) {
        throw new Error(completion.error.message);
      }

      result.completed += 1;
    } catch (error) {
      const terminal = job.attempt_count >= MAX_CLEANUP_ATTEMPTS;
      const failure = await supabase.rpc("fail_media_cleanup_job", {
        p_error: getErrorMessage(error),
        p_job_id: job.id,
        p_retry_at: getMediaCleanupRetryAt(job.attempt_count),
        p_terminal: terminal,
      });

      if (failure.error) {
        console.error("Unable to update the media cleanup job:", failure.error);
      }

      if (terminal) {
        result.failed += 1;
      } else {
        result.retried += 1;
      }
    }
  }

  return result;
}

export function schedulePendingMediaCleanup() {
  after(async () => {
    try {
      await processPendingMediaCleanupJobs();
    } catch (error) {
      console.error("Unable to process pending media cleanup jobs:", error);
    }
  });
}
