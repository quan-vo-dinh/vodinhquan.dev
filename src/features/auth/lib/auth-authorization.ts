export function getGitHubUsername(metadata: Record<string, unknown>) {
  for (const key of ["user_name", "preferred_username"]) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function isInterviewOwner(
  metadata: Record<string, unknown>,
  ownerGitHubUsername: string
) {
  return (
    getGitHubUsername(metadata)?.toLocaleLowerCase() ===
    ownerGitHubUsername.toLocaleLowerCase()
  );
}
