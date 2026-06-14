"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: Theme;
}>;

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

const ThemeContext = createContext<ThemeContextValue | null>(null);
let runtimeTheme: Theme | null = null;

function isTheme(value: string | null): value is Theme {
  return value === "dark" || value === "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function getThemeSnapshot(defaultTheme: Theme) {
  if (runtimeTheme) {
    return runtimeTheme;
  }

  try {
    const storedTheme = window.localStorage?.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function storeTheme(theme: Theme) {
  runtimeTheme = theme;

  try {
    window.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The active theme still works when storage is disabled or unavailable.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) {
  const readThemeSnapshot = useCallback(
    () => getThemeSnapshot(defaultTheme),
    [defaultTheme]
  );
  const readServerThemeSnapshot = useCallback(() => defaultTheme, [defaultTheme]);
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readThemeSnapshot,
    readServerThemeSnapshot
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    storeTheme(nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      setTheme,
      theme,
    }),
    [setTheme, theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
