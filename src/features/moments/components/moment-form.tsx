import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { OwnerMomentView } from "../types";

export function MomentForm({
  action,
  moment,
}: {
  action: (formData: FormData) => void | Promise<void>;
  moment?: OwnerMomentView;
}) {
  return (
    <Card className="border bg-card/80">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardTitle>{moment ? "Edit moment" : "Create moment"}</CardTitle>
        <CardDescription>
          Keep it photo-first: a title, optional metadata, and a short note.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Street frames in Saigon"
              required
              defaultValue={moment?.title}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="slug">
              Slug
            </label>
            <Input
              id="slug"
              name="slug"
              placeholder="street-frames-in-saigon"
              defaultValue={moment?.slug}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to generate from the title.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="occurredAt">
                Date
              </label>
              <Input
                id="occurredAt"
                name="occurredAt"
                type="date"
                defaultValue={moment?.occurredAt ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="location">
                Location
              </label>
              <Input
                id="location"
                name="location"
                placeholder="Ho Chi Minh City"
                defaultValue={moment?.location ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="A one-line description for cards and metadata."
              defaultValue={moment?.description ?? ""}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="noteMarkdown">
              Optional note
            </label>
            <Textarea
              id="noteMarkdown"
              name="noteMarkdown"
              placeholder="Short markdown note. Keep long essays in /blog."
              className="min-h-32"
              defaultValue={moment?.noteMarkdown ?? ""}
            />
          </div>

          <div className="flex justify-end border-t pt-5">
            <Button type="submit" className="w-full sm:w-auto">
              {moment ? "Save changes" : "Create moment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
