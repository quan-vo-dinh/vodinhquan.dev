import type { Metadata } from "next";

import { MomentsIndexPage } from "@/features/moments/components/moments-index-page";
import { loadMomentFeedState } from "@/features/moments/lib/moment-feed-state";
import { getPublishedMomentSummaries } from "@/features/moments/lib/moment-repository";
import { getServerI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: dictionary.moments.title,
    description: dictionary.moments.description,
    openGraph: {
      title: dictionary.moments.title,
      description: dictionary.moments.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.moments.title,
      description: dictionary.moments.description,
    },
  };
}

export default async function MomentsPage() {
  const feed = await loadMomentFeedState(getPublishedMomentSummaries);

  return <MomentsIndexPage moments={feed.moments} status={feed.status} />;
}
