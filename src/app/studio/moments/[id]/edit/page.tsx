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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Moment",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await requireOwner(`/studio/moments/${id}/edit`);
  const moment = await getOwnerMomentById(id);

  if (!moment) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/60 p-4 sm:p-5">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/studio/moments">Back to Moments</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{moment.status}</Badge>
          <Badge variant="outline">{moment.visibility}</Badge>
          <Button asChild size="sm" variant="outline">
            <Link href={`/moments/${moment.slug}`}>Public view</Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)]">
        <div className="flex min-w-0 flex-col gap-6">
          <MomentUploadPanel momentId={moment.id} />
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Photos</h2>
              <p className="text-sm text-muted-foreground">
                Edit captions, choose the cover, and control display order.
              </p>
            </div>
            <MomentAssetsEditor moment={moment} />
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
          <Card className="border bg-card/80">
            <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardTitle>Publishing</CardTitle>
              <CardDescription>
                Control when this photo set appears on the public site.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-5 sm:p-6">
              <form action={publishMomentAction.bind(null, moment.id)}>
                <Button type="submit" size="sm">
                  Publish
                </Button>
              </form>
              <form action={archiveMomentAction.bind(null, moment.id)}>
                <Button type="submit" size="sm" variant="outline">
                  Archive
                </Button>
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" variant="destructive">
                    Delete moment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete “{moment.title}”?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the Moment and detaches its photo
                      records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={deleteMomentAction.bind(null, moment.id)}>
                      <AlertDialogAction asChild>
                        <Button type="submit" variant="destructive">
                          Delete permanently
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
