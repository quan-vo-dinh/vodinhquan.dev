import BlurFade from "@/components/magicui/blur-fade";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FocusCards } from "@/components/ui/focus-cards";
import { Button } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { getServerI18n } from "@/i18n/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { MomentDataUnavailable } from "./moment-data-unavailable";
import { formatPhotoCount } from "../lib/moment-copy";
import type { MomentFeedState } from "../lib/moment-feed-state";
import type { MomentSummaryView } from "../types";

const BLUR_FADE_DELAY = 0.04;

export async function MomentsIndexPage({
  moments,
  nextCursor,
  status,
}: {
  moments: MomentSummaryView[];
  nextCursor: string | null;
  status: MomentFeedState["status"];
}) {
  const { dictionary } = await getServerI18n();

  return (
    <section id="moments" className="flex flex-col gap-10">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {dictionary.moments.title}
              </h1>
              <Badge variant="secondary">
                {moments.length} {dictionary.moments.sets}
              </Badge>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {dictionary.moments.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start">
            <Avatar className="size-8 border shadow-sm">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback className="text-[0.625rem]">
                {DATA.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight sm:items-end">
              <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">
                {dictionary.moments.curatedBy}
              </span>
              <span className="text-xs font-medium">{DATA.name}</span>
            </div>
          </div>
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
              <CardTitle>{dictionary.moments.emptyTitle}</CardTitle>
              <CardDescription>
                {dictionary.moments.emptyDescription}
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
                formatPhotoCount(moment.photoCount, dictionary.common),
              ]
                .filter(Boolean)
                .join(" · "),
              src: moment.cover?.secureUrl,
              title: moment.title,
            }))}
          />
          {nextCursor ? (
            <nav
              aria-label={dictionary.moments.paginationAria}
              className="mt-6 flex justify-center"
            >
              <Button asChild variant="outline">
                <Link href={`/moments?cursor=${encodeURIComponent(nextCursor)}`}>
                  {dictionary.moments.nextPage}
                  <ChevronRight className="ml-2 size-4" aria-hidden />
                </Link>
              </Button>
            </nav>
          ) : null}
        </BlurFade>
      )}
    </section>
  );
}
