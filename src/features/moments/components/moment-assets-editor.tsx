import Image from "next/image";
import { Trash2Icon } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  deleteMomentAssetAction,
  setMomentCoverAction,
  updateMomentAssetAction,
} from "../actions/moment-actions";
import type { OwnerMomentView } from "../types";
import { getServerI18n } from "@/i18n/server";

export async function MomentAssetsEditor({
  moment,
}: {
  moment: OwnerMomentView;
}) {
  const { dictionary } = await getServerI18n();

  if (moment.assets.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          {dictionary.moments.assetsEmpty}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {moment.assets.map((asset, index) => {
        const isCover = asset.id === moment.coverAssetId;

        return (
          <Card key={asset.id} className="overflow-hidden border bg-card/80">
            <div
              className="relative bg-muted"
              style={{
                aspectRatio:
                  asset.width && asset.height
                    ? `${asset.width} / ${asset.height}`
                    : "4 / 3",
              }}
            >
              <Image
                src={asset.secureUrl}
                alt={asset.alt ?? moment.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <CardHeader className="gap-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">
                  {dictionary.common.photo} {index + 1}
                </CardTitle>
                {isCover && (
                  <Badge variant="secondary">
                    {dictionary.moments.cover}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form
                action={updateMomentAssetAction.bind(
                  null,
                  moment.id,
                  asset.id
                )}
                className="grid gap-3"
              >
                <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`sort-${asset.id}`}
                      className="text-xs font-medium"
                    >
                      {dictionary.moments.sort}
                    </label>
                    <Input
                      id={`sort-${asset.id}`}
                      name="sortOrder"
                      type="number"
                      defaultValue={index}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`alt-${asset.id}`}
                      className="text-xs font-medium"
                    >
                      {dictionary.moments.altText}
                    </label>
                    <Input
                      id={`alt-${asset.id}`}
                      name="alt"
                      defaultValue={asset.alt ?? ""}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`caption-${asset.id}`}
                    className="text-xs font-medium"
                  >
                    {dictionary.moments.caption}
                  </label>
                  <Textarea
                    id={`caption-${asset.id}`}
                    name="caption"
                    defaultValue={asset.caption ?? ""}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" variant="outline">
                    {dictionary.moments.savePhoto}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 p-4 pt-0">
              <form action={setMomentCoverAction.bind(null, moment.id, asset.id)}>
                <Button type="submit" size="sm" variant="secondary">
                  {dictionary.moments.setCover}
                </Button>
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" variant="destructive">
                    {dictionary.common.delete}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {dictionary.moments.deletePhotoTitle}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {dictionary.moments.deletePhotoDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {dictionary.common.cancel}
                    </AlertDialogCancel>
                    <form
                      action={deleteMomentAssetAction.bind(
                        null,
                        moment.id,
                        asset.id
                      )}
                    >
                      <AlertDialogAction asChild>
                        <Button type="submit" variant="destructive">
                          {dictionary.moments.deletePhoto}
                        </Button>
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
