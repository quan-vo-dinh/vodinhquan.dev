import "server-only";

import { cookies } from "next/headers";

import { getDictionary } from "./dictionaries";
import {
  LOCALE_COOKIE_NAME,
  resolveLocale,
} from "./locale";

export async function getServerLocale() {
  const cookieStore = await cookies();

  return resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getServerI18n() {
  const locale = await getServerLocale();

  return {
    dictionary: getDictionary(locale),
    locale,
  };
}
