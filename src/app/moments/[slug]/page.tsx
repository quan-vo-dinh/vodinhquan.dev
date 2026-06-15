import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DATA } from "@/data/resume";
import { MomentDataUnavailable } from "@/features/moments/components/moment-data-unavailable";
import { MomentDetailPage } from "@/features/moments/components/moment-detail-page";
import { loadMomentDetailState } from "@/features/moments/lib/moment-feed-state";
import { getPublishedMomentBySlug } from "@/features/moments/lib/moment-repository";
import { getServerI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { dictionary } = await getServerI18n();
  const { slug } = await params;
  const state = await loadMomentDetailState(() =>
    getPublishedMomentBySlug(slug)
  );

  if (state.status !== "ready") {
    return undefined;
  }

  const { moment } = state;
  const image = moment.cover?.secureUrl;

  return {
    title: moment.title,
    description: moment.description ?? dictionary.moments.description,
    openGraph: {
      title: moment.title,
      description: moment.description ?? dictionary.moments.description,
      type: "article",
      url: `${DATA.url}/moments/${slug}`,
      ...(image
        ? {
            images: [{ url: image }],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: moment.title,
      description: moment.description ?? dictionary.moments.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function MomentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = await loadMomentDetailState(() =>
    getPublishedMomentBySlug(slug)
  );

  if (state.status === "not-found") {
    notFound();
  }

  if (state.status === "unavailable") {
    return <MomentDataUnavailable />;
  }

  return <MomentDetailPage moment={state.moment} />;
}
