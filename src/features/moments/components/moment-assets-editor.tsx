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

export function MomentAssetsEditor({ moment }: { moment: OwnerMomentView }) {
  if (moment.assets.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No photos attached yet. Upload a few images to start shaping this
          moment.
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
                  Photo {index + 1}
                </CardTitle>
                {isCover && <Badge variant="secondary">Cover</Badge>}
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
                      Sort
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
                      Alt text
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
                    Caption
                  </label>
                  <Textarea
                    id={`caption-${asset.id}`}
                    name="caption"
                    defaultValue={asset.caption ?? ""}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" variant="outline">
                    Save photo metadata
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 p-4 pt-0">
              <form action={setMomentCoverAction.bind(null, moment.id, asset.id)}>
                <Button type="submit" size="sm" variant="secondary">
                  Set cover
                </Button>
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm" variant="destructive">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the photo from the Moment. The action cannot
                      be undone from Studio.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form
                      action={deleteMomentAssetAction.bind(
                        null,
                        moment.id,
                        asset.id
                      )}
                    >
                      <AlertDialogAction asChild>
                        <Button type="submit" variant="destructive">
                          Delete photo
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
