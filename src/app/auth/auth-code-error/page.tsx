import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getServerI18n } from "@/i18n/server";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { dictionary } = await getServerI18n();
  const { reason } = await searchParams;
  const isUnauthorized = reason === "unauthorized";

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {dictionary.auth.authentication}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isUnauthorized
            ? dictionary.auth.ownerOnlyTitle
            : dictionary.auth.signInFailedTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isUnauthorized
            ? dictionary.auth.unauthorizedDescription
            : dictionary.auth.retryDescription}
        </p>
      </div>
      <Button asChild>
        <Link href="/interview">{dictionary.auth.backToInterview}</Link>
      </Button>
    </main>
  );
}
