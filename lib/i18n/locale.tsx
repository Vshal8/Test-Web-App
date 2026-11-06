"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  dictionaries,
  formatCompanyDate,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionary";

const LOCALE_KEY = "companies.locale";

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  formatDate: (iso: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const localeListeners = new Set<() => void>();

function emitLocale(): void {
  localeListeners.forEach((listener) => listener());
}

function subscribeLocale(listener: () => void): () => void {
  localeListeners.add(listener);
  return () => {
    localeListeners.delete(listener);
  };
}

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_KEY);
  return stored === "nl" ? "nl" : "en";
}

function getServerLocale(): Locale {
  return "en";
}

function updateLocale(locale: Locale): void {
  window.localStorage.setItem(LOCALE_KEY, locale);
  document.documentElement.lang = locale === "nl" ? "nl" : "en";
  emitLocale();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getStoredLocale,
    getServerLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "nl" ? "nl" : "en";
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale: updateLocale,
      formatDate: (iso: string) => formatCompanyDate(iso, locale),
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return value;
}
