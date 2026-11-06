"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AppShell } from "@/components/app-shell";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";
import { CompanyDrawer } from "@/components/companies/company-drawer";
import { CompanyTable } from "@/components/companies/company-table";
import { PageSkeleton, Skeleton } from "@/components/skeleton";
import { listCompaniesOptions } from "@/lib/api/queries";
import {
  clearToken,
  getServerToken,
  getToken,
  setUnauthorizedHandler,
  subscribeToken,
} from "@/lib/auth/token";
import {
  COMPANY_STATUSES,
  PAGE_SIZE,
  type Company,
  type CompanyListQuery,
  type CompanyStatus,
} from "@/lib/companies/types";
import {
  CREATE_COMPANY,
  hrefFromParams,
  nextSort,
  parseCompanyView,
  type CompanyViewParams,
} from "@/lib/companies/url";
import { isCompanyStatus } from "@/lib/companies/validate";
import { showingRange } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale";

function subscribeNoop(): () => void {
  return () => {};
}

export function CompaniesScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t, formatDate } = useLocale();
  const rawQuery = searchParams.toString();
  const params = useMemo(
    () => parseCompanyView(new URLSearchParams(rawQuery)),
    [rawQuery],
  );
  const [draft, setDraft] = useState<{ value: string; from: string } | null>(null);
  const searchValue = draft && draft.from === params.q ? draft.value : params.q;
  const token = useSyncExternalStore(subscribeToken, getToken, getServerToken);
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      const next = window.location.pathname + window.location.search;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  useEffect(() => {
    if (!isClient || token) return;
    const next = rawQuery ? `${pathname}?${rawQuery}` : pathname;
    router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
  }, [isClient, pathname, rawQuery, router, token]);

  useEffect(() => {
    if (searchValue === params.q) return;
    const timeout = window.setTimeout(() => {
      router.replace(hrefFromParams({ ...params, q: searchValue, page: 1 }));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [params, router, searchValue]);

  const listParams = useMemo<CompanyListQuery>(() => {
    const query: CompanyListQuery = {
      limit: PAGE_SIZE,
      offset: (params.page - 1) * PAGE_SIZE,
      sort: params.sort,
    };
    const q = params.q.trim();
    if (q) query.q = q;
    if (params.status) query.status = params.status;
    return query;
  }, [params]);

  const authed = isClient && token !== null;
  const listQuery = useQuery({
    ...listCompaniesOptions(listParams),
    enabled: authed,
  });

  useEffect(() => {
    if (!listQuery.data) return;
    const pageCount = Math.max(1, Math.ceil(listQuery.data.total / PAGE_SIZE));
    if (params.page > pageCount) {
      router.replace(hrefFromParams({ ...params, page: pageCount }));
    }
  }, [listQuery.data, params, router]);

  function pushParams(partial: Partial<CompanyViewParams>) {
    const resetsPage =
      partial.q !== undefined ||
      partial.status !== undefined ||
      partial.sort !== undefined;
    const next: CompanyViewParams = {
      ...params,
      ...partial,
      page: partial.page ?? (resetsPage ? 1 : params.page),
    };
    router.push(hrefFromParams(next));
  }

  function signOut() {
    clearToken();
    router.replace("/sign-in");
  }

  function handleSaved(company: Company) {
    if (params.company === CREATE_COMPANY) {
      router.replace(hrefFromParams({ ...params, company: company.id }));
    }
  }

  if (!authed) {
    return <PageSkeleton label={t.loading} />;
  }

  const pageCount = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / PAGE_SIZE))
    : 1;
  const selectedId =
    params.company && params.company !== CREATE_COMPANY ? params.company : null;

  const rangeStart =
    listQuery.data && listQuery.data.total > 0 ? listQuery.data.offset + 1 : 0;
  const rangeEnd = listQuery.data
    ? Math.min(listQuery.data.offset + listQuery.data.items.length, listQuery.data.total)
    : 0;

  return (
    <AppShell
      companiesLabel={t.appTitle}
      signOutLabel={t.signOut}
      onSignOut={signOut}
      actions={
        <button
          type="button"
          onClick={() => pushParams({ company: CREATE_COMPANY })}
          className="btn btn-primary"
        >
          {t.create}
        </button>
      }
    >
      <div className="filters">
        <label className="search-field">
          <span className="sr-only">{t.searchLabel}</span>
          <SearchIcon className="search-icon" />
          <input
            type="search"
            value={searchValue}
            placeholder={t.searchPlaceholder}
            onChange={(event) =>
              setDraft({ value: event.target.value, from: params.q })
            }
            className="input"
          />
        </label>
        <label className="status-field">
          <span className="sr-only">{t.statusLabel}</span>
          <select
            value={params.status}
            onChange={(event) => {
              const value = event.target.value;
              const status: CompanyStatus | "" = isCompanyStatus(value) ? value : "";
              pushParams({ status });
            }}
            className="input input-select"
          >
            <option value="">{t.statusAll}</option>
            {COMPANY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.status[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CompanyTable
        items={listQuery.data?.items}
        sort={params.sort}
        selectedId={selectedId}
        offset={listQuery.data?.offset ?? (params.page - 1) * PAGE_SIZE}
        isPending={listQuery.isPending}
        isFetching={listQuery.isFetching}
        isError={listQuery.isError && !listQuery.data}
        labels={t}
        formatDate={formatDate}
        onSort={(column) => pushParams({ sort: nextSort(params.sort, column) })}
        onOpen={(id) => pushParams({ company: id })}
        onRetry={() => {
          void listQuery.refetch();
        }}
      />

      <nav aria-label={t.pagination} className="pager">
        <p>
          {listQuery.data ? (
            showingRange(locale, rangeStart, rangeEnd, listQuery.data.total)
          ) : listQuery.isPending ? (
            <Skeleton className="skeleton-pager" />
          ) : null}
        </p>
        <div className="pager-actions">
          <button
            type="button"
            onClick={() => pushParams({ page: params.page - 1 })}
            disabled={params.page <= 1}
            className="btn btn-icon"
            aria-label={t.previous}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => pushParams({ page: params.page + 1 })}
            disabled={!listQuery.data || params.page >= pageCount}
            className="btn btn-icon"
            aria-label={t.next}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </nav>

      <CompanyDrawer
        companyParam={params.company}
        onClose={() => pushParams({ company: null })}
        onSaved={handleSaved}
      />
    </AppShell>
  );
}
