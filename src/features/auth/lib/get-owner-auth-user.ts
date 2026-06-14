import "server-only";

import {
  createSupabaseServerClient,
  getCachedAuthUser,
} from "@/lib/supabase/server";

import { checkDatabaseOwner } from "./database-owner-authorization";

export async function getOwnerAuthUser() {
  const {
    data: { user },
    error,
  } = await getCachedAuthUser();

  if (error || !user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const isOwner = await checkDatabaseOwner((functionName) =>
    supabase.rpc(functionName)
  );

  return isOwner ? user : null;
}
