import "server-only";

import { createSupabaseServerClient, getCachedAuthUser } from "@/lib/supabase/server";

import type { CurrentViewer } from "../types";

function getMetadataString(
  metadata: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

export async function getCurrentViewer(): Promise<CurrentViewer | null> {
  const {
    data: { user },
  } = await getCachedAuthUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("profiles")
    .select("github_username, display_name, avatar_url, profile_url")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as {
    github_username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    profile_url: string | null;
  } | null;

  const metadata = user.user_metadata;
  const githubUsername =
    profile?.github_username ??
    getMetadataString(metadata, ["user_name", "preferred_username"]);
  const displayName =
    profile?.display_name ??
    getMetadataString(metadata, ["full_name", "name", "user_name"]) ??
    "GitHub learner";
  const avatarUrl =
    profile?.avatar_url ??
    getMetadataString(metadata, ["avatar_url", "picture"]);
  const profileUrl =
    profile?.profile_url ??
    (githubUsername ? `https://github.com/${githubUsername}` : null);

  return {
    id: user.id,
    githubUsername,
    displayName,
    avatarUrl,
    profileUrl,
  };
}
