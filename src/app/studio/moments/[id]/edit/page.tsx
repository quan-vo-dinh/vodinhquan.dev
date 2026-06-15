import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOwner } from "@/features/auth/lib/require-owner";
import {
  archiveMomentAction,
  deleteMomentAction,
  publishMomentAction,
  updateMomentAction,
} from "@/features/moments/actions/moment-actions";
import { MomentAssetsEditor } from "@/features/moments/components/moment-assets-editor";
import { MomentForm } from "@/features/moments/components/moment-form";
import { MomentUploadPanel } from "@/features/moments/components/moment-upload-panel";
import { getOwnerMomentById } from "@/features/moments/lib/moment-repository";
import { getServerI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: dictionary.moments.formEditTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { dictionary } = await getServerI18n();
  const { id } = await params;
  const statusLabels = {
    archived: dictionary.common.archived,
    draft: dictionary.common.draft,
    published: dictionary.common.published,
  };
  const visibilityLabels = {
    private: dictionary.common.private,
    public: dictionary.common.public,
  };

  await requireOwner(`/studio/moments/${id}/edit`);
  const moment = await getOwnerMomentById(id);

  if (!moment) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/60 p-4 sm:p-5">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/studio/moments">
            {dictionary.moments.backToMoments}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{statusLabels[moment.status]}</Badge>
          <Badge variant="outline">
            {visibilityLabels[moment.visibility]}
          </Badge>
          <Button asChild size="sm" variant="outline">
            <Link href={`/moments/${moment.slug}`}>
              {dictionary.moments.publicView}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)]">
        <div className="flex min-w-0 flex-col gap-6">
          <MomentUploadPanel momentId={moment.id} />
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {dictionary.moments.photosSection}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dictionary.moments.photosSectionDescription}
              </p>
            </div>
            <MomentAssetsEditor moment={moment} />
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
          <Card className="border bg-card/80">
            <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardTitle>{dictionary.moments.publishing}</CardTitle>
              <CardDescription>
                {dictionary.moments.publishingDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-5 sm:p-6">
              <form action={publishMomentAction.bind(null, moment.id)}>
                <Button type="submit" size="sm">
                  {dictionary.moments.publish}
                </Button>
              </form>
              <form action={archiveMomentAction.bind(null, moment.id)}>
                <Button type="submit" size="sm" variant="outline">
                  {dictionary.moments.archive}
                </Button>
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    {dictionary.moments.deleteMoment}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {dictionary.moments.deleteMomentTitle} “{moment.title}”
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {dictionary.moments.deleteMomentDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {dictionary.common.cancel}
                    </AlertDialogCancel>
                    <form action={deleteMomentAction.bind(null, moment.id)}>
                      <AlertDialogAction asChild>
                        <Button type="submit" variant="destructive">
                          {dictionary.moments.deletePermanently}
                        </Button>
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <MomentForm
            action={updateMomentAction.bind(null, moment.id)}
            moment={moment}
          />
        </aside>
      </div>
    </section>
  );
}
