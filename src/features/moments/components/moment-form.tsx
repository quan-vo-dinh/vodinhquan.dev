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

import { MomentEmojiField } from "./moment-emoji-field";
import type { OwnerMomentView } from "../types";
import { getServerI18n } from "@/i18n/server";

export async function MomentForm({
  action,
  moment,
}: {
  action: (formData: FormData) => void | Promise<void>;
  moment?: OwnerMomentView;
}) {
  const { dictionary } = await getServerI18n();

  return (
    <Card className="border bg-card/80">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardTitle>
          {moment
            ? dictionary.moments.formEditTitle
            : dictionary.moments.formCreateTitle}
        </CardTitle>
        <CardDescription>
          {dictionary.moments.formDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form action={action} className="flex flex-col gap-4">
          <MomentEmojiField
            id="title"
            name="title"
            label={dictionary.moments.titleLabel}
            placeholder={dictionary.moments.titlePlaceholder}
            required
            defaultValue={moment?.title}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="slug">
              {dictionary.moments.slugLabel}
            </label>
            <Input
              id="slug"
              name="slug"
              placeholder={dictionary.moments.slugPlaceholder}
              defaultValue={moment?.slug}
            />
            <p className="text-xs text-muted-foreground">
              {dictionary.moments.slugHint}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="occurredAt">
                {dictionary.moments.dateLabel}
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
                {dictionary.moments.locationLabel}
              </label>
              <Input
                id="location"
                name="location"
                placeholder={dictionary.moments.locationPlaceholder}
                defaultValue={moment?.location ?? ""}
              />
            </div>
          </div>

          <MomentEmojiField
            id="description"
            name="description"
            label={dictionary.moments.descriptionLabel}
            placeholder={dictionary.moments.descriptionPlaceholder}
            defaultValue={moment?.description}
            multiline
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="noteMarkdown">
              {dictionary.moments.noteLabel}
            </label>
            <Textarea
              id="noteMarkdown"
              name="noteMarkdown"
              placeholder={dictionary.moments.notePlaceholder}
              className="min-h-32"
              defaultValue={moment?.noteMarkdown ?? ""}
            />
          </div>

          <div className="flex justify-end border-t pt-5">
            <Button type="submit" className="w-full sm:w-auto">
              {moment
                ? dictionary.moments.saveChanges
                : dictionary.moments.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
