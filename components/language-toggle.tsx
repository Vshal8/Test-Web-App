"use client";

import { useLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/dictionary";

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "nl", label: "NL" },
];

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div role="group" aria-label={t.language} className="lang-toggle">
      {OPTIONS.map((option) => {
        const selected = locale === option.locale;
        return (
          <button
            key={option.locale}
            type="button"
            aria-pressed={selected}
            onClick={() => setLocale(option.locale)}
            className={selected ? "lang-toggle-btn is-active" : "lang-toggle-btn"}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
