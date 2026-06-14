const SUPABASE_AUTH_COOKIE_PREFIX = "sb-";
const SUPABASE_AUTH_COOKIE_SUFFIX = "-auth-token";
const STALE_REFRESH_TOKEN_MESSAGES = [
  "Invalid Refresh Token",
  "Refresh Token Not Found",
];

export function isSupabaseAuthCookieName(name: string) {
  return (
    name.startsWith(SUPABASE_AUTH_COOKIE_PREFIX) &&
    name.includes(SUPABASE_AUTH_COOKIE_SUFFIX)
  );
}

export function isStaleSupabaseRefreshTokenError(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return false;
  }

  const message = (error as { message?: unknown }).message;

  return (
    typeof message === "string" &&
    STALE_REFRESH_TOKEN_MESSAGES.some((staleMessage) =>
      message.includes(staleMessage)
    )
  );
}
