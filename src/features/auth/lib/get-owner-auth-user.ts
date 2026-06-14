import "server-only";

import {
  createSupabaseServerClient,
  getCachedAuthUser,
} from "@/lib/supabase/server";

export async function getOwnerAuthUser() {
  const {
    data: { user },
    error,
  } = await getCachedAuthUser();

  if (error || !user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: isOwner, error: ownerCheckError } = await supabase.rpc(
    "is_interview_owner"
  );

  return !ownerCheckError && isOwner ? user : null;
}
