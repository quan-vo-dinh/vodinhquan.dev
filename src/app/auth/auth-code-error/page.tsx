import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Authentication
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          GitHub sign-in could not be completed
        </h1>
        <p className="text-sm text-muted-foreground">
          Please try signing in again from the interview practice page.
        </p>
      </div>
      <Button asChild>
        <Link href="/interview">Back to Interview Practice</Link>
      </Button>
    </main>
  );
}
