import type { Metadata } from "next";

import { MomentsIndexPage } from "@/features/moments/components/moments-index-page";
import { loadMomentFeedState } from "@/features/moments/lib/moment-feed-state";
import { getPublishedMomentPage } from "@/features/moments/lib/moment-repository";
import { getServerI18n } from "@/i18n/server";

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

export default async function MomentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cursor = Array.isArray(params.cursor) ? params.cursor[0] : params.cursor;
  const feed = await loadMomentFeedState(() => getPublishedMomentPage(cursor ?? null));

  return (
    <MomentsIndexPage
      moments={feed.moments}
      nextCursor={feed.nextCursor}
      status={feed.status}
    />
  );
}
