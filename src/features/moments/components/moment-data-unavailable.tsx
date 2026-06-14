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

export function MomentDataUnavailable() {
  return (
    <Card className="border border-dashed">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardTitle>Moments are temporarily unavailable</CardTitle>
        <CardDescription>
          The photo data source is offline or not configured. The rest of the
          site is still available.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 text-sm text-muted-foreground sm:p-6">
        Check the Supabase URL and ensure the Moments migration has been
        applied before publishing photo sets.
      </CardContent>
      <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
        <Button asChild variant="outline">
          <Link href="/">Go to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
