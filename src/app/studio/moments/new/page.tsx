import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { requireOwner } from "@/features/auth/lib/require-owner";
import { createMomentAction } from "@/features/moments/actions/moment-actions";
import { MomentForm } from "@/features/moments/components/moment-form";
import { getServerI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: dictionary.moments.newMoment,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function NewMomentPage() {
  const { dictionary } = await getServerI18n();
  await requireOwner("/studio/moments/new");

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit px-0">
        <Link href="/studio">{dictionary.moments.backToStudio}</Link>
      </Button>
      <MomentForm action={createMomentAction} />
    </section>
  );
}
