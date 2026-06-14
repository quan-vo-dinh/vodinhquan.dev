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

import type { OwnerMomentFeedState } from "../lib/moment-feed-state";
import type { OwnerMomentView } from "../types";

export function StudioMomentList({
  moments,
  status,
}: {
  moments: OwnerMomentView[];
  status: OwnerMomentFeedState["status"];
}) {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Owner Studio
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, upload, edit, and publish personal photo sets.
          </p>
        </div>
        {status === "ready" ? (
          <Button asChild className="w-fit">
            <Link href="/studio/moments/new">
              <PlusIcon data-icon="inline-start" />
              New moment
            </Link>
          </Button>
        ) : null}
      </div>

      {status === "setup-required" ? (
        <Card className="border border-dashed">
          <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
            <CardTitle>Moments database setup required</CardTitle>
            <CardDescription>
              Owner authentication is working, but the remote Supabase project
              does not have the Moments tables yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 text-sm text-muted-foreground sm:p-6">
            Apply{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              supabase/migrations/202606140002_moments_owner_studio.sql
            </code>{" "}
            to the linked Supabase project before creating photo sets.
          </CardContent>
          <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
            <Button asChild variant="outline">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : status === "unavailable" ? (
        <Card className="border border-dashed">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle>Studio is temporarily unavailable</CardTitle>
            <CardDescription>
              The Moments data source could not be loaded. Try again after
              checking the Supabase connection and policies.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : moments.length === 0 ? (
        <Card className="border border-dashed bg-card/60">
          <CardHeader className="items-start gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
            <div className="grid size-10 place-items-center rounded-full bg-muted">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Your first photo set starts here</CardTitle>
            <CardDescription>
              Start with a title, then attach Cloudinary-hosted photos.
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-5 sm:p-6">
            <Button asChild>
              <Link href="/studio/moments/new">
                <PlusIcon data-icon="inline-start" />
                Create a moment
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
                    <Badge variant="secondary">{moment.status}</Badge>
                    <Badge variant="outline">{moment.visibility}</Badge>
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
                      `${moment.photoCount} photos`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button asChild size="sm">
                    <Link href={`/studio/moments/${moment.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  {moment.status === "published" &&
                    moment.visibility === "public" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/moments/${moment.slug}`}>
                        View public
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
