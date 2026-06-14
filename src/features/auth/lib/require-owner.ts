import "server-only";

import { redirect } from "next/navigation";

import { getOwnerAuthUser } from "./get-owner-auth-user";

export async function requireOwner(next = "/studio/moments") {
  const user = await getOwnerAuthUser();

  if (!user) {
    redirect(`/auth/sign-in/github?next=${encodeURIComponent(next)}`);
  }

  return user;
}
