import type { Metadata } from "next";

import { MomentsIndexPage } from "@/features/moments/components/moments-index-page";
import { loadMomentFeedState } from "@/features/moments/lib/moment-feed-state";
import { getPublishedMomentSummaries } from "@/features/moments/lib/moment-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moments",
  description:
    "A personal photo diary of trips, street frames, and quiet scenes.",
  openGraph: {
    title: "Moments",
    description:
      "A personal photo diary of trips, street frames, and quiet scenes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moments",
    description:
      "A personal photo diary of trips, street frames, and quiet scenes.",
  },
};

export default async function MomentsPage() {
  const feed = await loadMomentFeedState(getPublishedMomentSummaries);

  return <MomentsIndexPage moments={feed.moments} status={feed.status} />;
}
