"use client";

import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";

import type { Dictionary } from "./dictionaries";
import type { Locale } from "./locale";

type LocaleContextValue = {
  dictionary: Dictionary;
  locale: Locale;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  dictionary,
  locale,
}: PropsWithChildren<LocaleContextValue>) {
  return (
    <LocaleContext.Provider value={{ dictionary, locale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useI18n must be used within LocaleProvider");
  }

  return context;
}
