import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/auth/sign-out" method="post">
      <Button type="submit" variant="outline" className="h-7 px-2.5 text-xs shadow-sm cursor-pointer">
        Sign out
      </Button>
    </form>
  );
}
