"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { getToken, setToken } from "@/lib/auth/token";
import { useLocale } from "@/lib/i18n/locale";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/companies";
  return value;
}

export function SignInForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setTokenValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) router.replace("/companies");
  }, [router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError(t.tokenRequired);
      return;
    }
    setToken(trimmed);
    router.replace(safeNextPath(searchParams.get("next")));
  }

  return (
    <div className="app-canvas app-canvas-center">
      <main className="auth-card">
        <div className="page-title-row">
          <h1 className="page-title">{t.signInTitle}</h1>
          <LanguageToggle />
        </div>
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="access-token" className="field-label">
              {t.tokenLabel}
            </label>
            <input
              id="access-token"
              value={token}
              onChange={(event) => setTokenValue(event.target.value)}
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "token-error" : "token-hint"}
              className="input"
            />
            <p id="token-hint" className="field-hint">
              {t.tokenHint}
            </p>
            {error ? (
              <p id="token-error" role="alert" className="field-error">
                {error}
              </p>
            ) : null}
          </div>
          <button type="submit" className="btn btn-primary">
            {t.continue}
          </button>
        </form>
      </main>
    </div>
  );
}
