import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FocusCards } from "@/components/ui/focus-cards";

import { MomentDataUnavailable } from "./moment-data-unavailable";
import type { MomentSummaryView } from "../types";
import type { MomentFeedState } from "../lib/moment-feed-state";

const BLUR_FADE_DELAY = 0.04;

export function MomentsIndexPage({
  moments,
  status,
}: {
  moments: MomentSummaryView[];
  status: MomentFeedState["status"];
}) {
  return (
    <section id="moments" className="flex flex-col gap-10">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Moments
            </h1>
            <Badge variant="secondary">{moments.length} sets</Badge>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            A small visual diary of trips, street frames, and quiet scenes.
            Photo-first, lightly captioned, and curated by hand.
          </p>
        </div>
      </BlurFade>

      {status === "unavailable" ? (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <MomentDataUnavailable />
        </BlurFade>
      ) : moments.length === 0 ? (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <Card className="mx-auto w-full max-w-2xl border border-dashed">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle>No moments published yet</CardTitle>
              <CardDescription>
                The gallery is ready. Published photo sets will appear here.
              </CardDescription>
            </CardHeader>
          </Card>
        </BlurFade>
      ) : (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <FocusCards
            className={moments.length === 1 ? "mx-auto max-w-2xl" : undefined}
            cards={moments.map((moment) => ({
              alt: moment.cover?.alt ?? moment.title,
              href: `/moments/${moment.slug}`,
              metadata: [
                moment.location,
                moment.occurredAt,
                `${moment.photoCount} photos`,
              ]
                .filter(Boolean)
                .join(" · "),
              src: moment.cover?.secureUrl,
              title: moment.title,
            }))}
          />
        </BlurFade>
      )}
    </section>
  );
}
