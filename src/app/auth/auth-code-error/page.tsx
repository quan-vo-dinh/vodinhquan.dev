import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const isUnauthorized = reason === "unauthorized";

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Authentication
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isUnauthorized
            ? "This Interview workspace is owner-only"
            : "GitHub sign-in could not be completed"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isUnauthorized
            ? "The GitHub session was closed because this personal workspace only accepts its configured owner account."
            : "Please try signing in again from the interview practice page."}
        </p>
      </div>
      <Button asChild>
        <Link href="/interview">Back to Interview Practice</Link>
      </Button>
    </main>
  );
}
