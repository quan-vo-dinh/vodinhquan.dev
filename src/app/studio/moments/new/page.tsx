import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { requireOwner } from "@/features/auth/lib/require-owner";
import { createMomentAction } from "@/features/moments/actions/moment-actions";
import { MomentForm } from "@/features/moments/components/moment-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Moment",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewMomentPage() {
  await requireOwner("/studio/moments/new");

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit px-0">
        <Link href="/studio">Back to Studio</Link>
      </Button>
      <MomentForm action={createMomentAction} />
    </section>
  );
}
