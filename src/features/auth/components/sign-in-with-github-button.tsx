import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

type SignInWithGitHubButtonProps = {
  next?: string;
};

export function SignInWithGitHubButton({
  next = "/interview",
}: SignInWithGitHubButtonProps) {
  return (
    <Button asChild size="sm" variant="outline">
      <Link href={`/auth/sign-in/github?next=${encodeURIComponent(next)}`}>
        <Icons.github className="mr-2 size-4" aria-hidden />
        Sign in with GitHub
      </Link>
    </Button>
  );
}
