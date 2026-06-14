const DEFAULT_AUTH_PATH = "/interview";

type ResolveAuthOriginInput = {
  configuredOrigin: string;
  isDevelopment: boolean;
  requestUrl: string;
};

export function safeNextPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_PATH;
  }

  return value;
}

export function resolveAuthOrigin({
  configuredOrigin,
  isDevelopment,
  requestUrl,
}: ResolveAuthOriginInput) {
  return isDevelopment
    ? new URL(requestUrl).origin
    : new URL(configuredOrigin).origin;
}
