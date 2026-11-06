"use client";

import { AuthSkeleton, PageSkeleton } from "@/components/skeleton";
import { useLocale } from "@/lib/i18n/locale";

export function CompaniesRouteFallback() {
  const { t } = useLocale();
  return <PageSkeleton label={t.loading} />;
}

export function SignInRouteFallback() {
  const { t } = useLocale();
  return <AuthSkeleton label={t.signInTitle} />;
}
