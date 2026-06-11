import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/auth/sign-out" method="post">
      <Button type="submit" size="sm" variant="ghost">
        Sign out
      </Button>
    </form>
  );
}
