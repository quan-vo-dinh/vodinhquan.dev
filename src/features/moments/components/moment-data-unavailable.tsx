import Link from "next/link";

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

export async function MomentDataUnavailable() {
  const { dictionary } = await getServerI18n();

  return (
    <Card className="border border-dashed">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardTitle>{dictionary.moments.unavailableTitle}</CardTitle>
        <CardDescription>
          {dictionary.moments.unavailableDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 text-sm text-muted-foreground sm:p-6">
        {dictionary.moments.unavailableHint}
      </CardContent>
      <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
        <Button asChild variant="outline">
          <Link href="/">{dictionary.moments.goHome}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
