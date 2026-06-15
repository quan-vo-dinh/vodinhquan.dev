import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getServerI18n } from "@/i18n/server";

import { MomentPhotoGallery } from "./moment-photo-gallery";
import type { MomentDetailView } from "../types";
import { formatPhotoCount } from "../lib/moment-copy";

const BLUR_FADE_DELAY = 0.04;

export async function MomentDetailPage({
  moment,
}: {
  moment: MomentDetailView;
}) {
  const { dictionary } = await getServerI18n();

  return (
    <article className="flex flex-col gap-10">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <Link
          href="/moments"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="size-4" />
          {dictionary.moments.back}
        </Link>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <header className="flex max-w-2xl flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {moment.title}
            </h1>
            <Badge variant="secondary">
              {formatPhotoCount(moment.photoCount, dictionary.common)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {[moment.location, moment.occurredAt].filter(Boolean).join(" · ")}
          </p>
          {moment.description && (
            <p className="text-sm leading-6 text-muted-foreground">
              {moment.description}
            </p>
          )}
        </header>
      </BlurFade>

      {moment.assets.length > 0 ? (
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <MomentPhotoGallery assets={moment.assets} momentTitle={moment.title} />
        </BlurFade>
      ) : (
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <Card className="border border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground">
              {dictionary.moments.noPhotos}
            </CardContent>
          </Card>
        </BlurFade>
      )}

      {moment.noteMarkdown && (
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="prose prose-neutral max-w-2xl text-sm leading-7 dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>
              {moment.noteMarkdown}
            </Markdown>
          </div>
        </BlurFade>
      )}
    </article>
  );
}
