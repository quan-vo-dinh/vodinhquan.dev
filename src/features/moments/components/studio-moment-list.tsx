import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerI18n } from "@/i18n/server";

import { formatPhotoCount } from "../lib/moment-copy";
import type { OwnerMomentFeedState } from "../lib/moment-feed-state";
import type { OwnerMomentView } from "../types";

export async function StudioMomentList({
  moments,
  status,
}: {
  moments: OwnerMomentView[];
  status: OwnerMomentFeedState["status"];
}) {
  const { dictionary } = await getServerI18n();
  const statusLabels = {
    archived: dictionary.common.archived,
    draft: dictionary.common.draft,
    published: dictionary.common.published,
  };
  const visibilityLabels = {
    private: dictionary.common.private,
    public: dictionary.common.public,
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {dictionary.moments.ownerStudio}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dictionary.moments.ownerStudioDescription}
          </p>
        </div>
        {status === "ready" ? (
          <Button asChild className="w-fit">
            <Link href="/studio/moments/new">
              <PlusIcon data-icon="inline-start" />
              {dictionary.moments.newMoment}
            </Link>
          </Button>
        ) : null}
      </div>

      {status === "setup-required" ? (
        <Card className="border border-dashed">
          <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
            <CardTitle>{dictionary.moments.setupTitle}</CardTitle>
            <CardDescription>
              {dictionary.moments.setupDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 text-sm text-muted-foreground sm:p-6">
            {dictionary.moments.setupHintBefore}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              supabase/migrations/202606140002_moments_owner_studio.sql
            </code>{" "}
            {dictionary.moments.setupHintAfter}
          </CardContent>
          <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
            <Button asChild variant="outline">
              <Link href="/">{dictionary.moments.goHome}</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : status === "unavailable" ? (
        <Card className="border border-dashed">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle>{dictionary.moments.studioUnavailable}</CardTitle>
            <CardDescription>
              {dictionary.moments.studioUnavailableDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : moments.length === 0 ? (
        <Card className="border border-dashed bg-card/60">
          <CardHeader className="items-start gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
            <div className="grid size-10 place-items-center rounded-full bg-muted">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>{dictionary.moments.firstSetTitle}</CardTitle>
            <CardDescription>
              {dictionary.moments.firstSetDescription}
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-5 sm:p-6">
            <Button asChild>
              <Link href="/studio/moments/new">
                <PlusIcon data-icon="inline-start" />
                {dictionary.moments.create}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {moments.map((moment) => (
            <Card
              key={moment.id}
              className="overflow-hidden border bg-card/80"
            >
              <div className="relative aspect-[16/9] bg-muted">
                {moment.cover ? (
                  <Image
                    src={moment.cover.secureUrl}
                    alt={moment.cover.alt ?? moment.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <ImageIcon className="size-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {statusLabels[moment.status]}
                    </Badge>
                    <Badge variant="outline">
                      {visibilityLabels[moment.visibility]}
                    </Badge>
                  </div>
                  <Link
                    href={`/studio/moments/${moment.id}/edit`}
                    className="truncate text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground"
                  >
                    {moment.title}
                  </Link>
                  <p className="text-xs  text-muted-foreground">
                    {[
                      moment.location,
                      moment.occurredAt,
                      formatPhotoCount(moment.photoCount, dictionary.common),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button asChild size="sm">
                    <Link href={`/studio/moments/${moment.id}/edit`}>
                      {dictionary.common.edit}
                    </Link>
                  </Button>
                  {moment.status === "published" &&
                    moment.visibility === "public" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/moments/${moment.slug}`}>
                        {dictionary.moments.viewPublic}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
