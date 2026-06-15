"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/locale-provider";

export function SignOutButton() {
  const { dictionary } = useI18n();

  return (
    <form action="/auth/sign-out" method="post">
      <Button type="submit" variant="outline" className="h-7 px-2.5 text-xs shadow-sm cursor-pointer">
        {dictionary.auth.signOut}
      </Button>
    </form>
  );
}
