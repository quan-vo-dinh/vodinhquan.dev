"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useI18n } from "@/i18n/locale-provider";

type SignInWithGitHubButtonProps = {
  next?: string;
};

export function SignInWithGitHubButton({
  next = "/interview",
}: SignInWithGitHubButtonProps) {
  const { dictionary } = useI18n();

  return (
    <Button asChild size="sm" variant="outline">
      <a href={`/auth/sign-in/github?next=${encodeURIComponent(next)}`}>
        <Icons.github className="mr-2 size-4" aria-hidden />
        {dictionary.auth.signInGitHub}
      </a>
    </Button>
  );
}
