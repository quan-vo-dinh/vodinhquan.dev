import type { Metadata } from "next";

import { requireOwner } from "@/features/auth/lib/require-owner";
import { StudioMomentList } from "@/features/moments/components/studio-moment-list";
import { loadOwnerMomentFeedState } from "@/features/moments/lib/moment-feed-state";
import { getOwnerMomentSummaries } from "@/features/moments/lib/moment-repository";
import { getServerI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: `${dictionary.moments.title} Studio`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function StudioMomentsPage() {
  await requireOwner("/studio/moments");
  const state = await loadOwnerMomentFeedState(getOwnerMomentSummaries);

  return <StudioMomentList moments={state.moments} status={state.status} />;
}
