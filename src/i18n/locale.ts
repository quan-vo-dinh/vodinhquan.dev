export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export const DEFAULT_LOCALE = "vi";
export const LOCALE_COOKIE_NAME = "portfolio-locale";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function serializeLocaleCookie(locale: Locale) {
  const oneYearInSeconds = 60 * 60 * 24 * 365;

  return [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    "Path=/",
    `Max-Age=${oneYearInSeconds}`,
    "SameSite=Lax",
  ].join("; ");
}
