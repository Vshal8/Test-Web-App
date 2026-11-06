"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ApiError } from "@/lib/api/errors";
import { companyKeys, companyOptions } from "@/lib/api/queries";
import { CompanyForm } from "@/components/companies/company-form";
import { CloseIcon } from "@/components/icons";
import { DrawerSkeleton } from "@/components/skeleton";
import { CREATE_COMPANY } from "@/lib/companies/url";
import type { Company } from "@/lib/companies/types";
import { companyMeta } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale";

type CompanyDrawerProps = {
  companyParam: string | null;
  onClose: () => void;
  onSaved: (company: Company) => void;
};

export function CompanyDrawer({
  companyParam,
  onClose,
  onSaved,
}: CompanyDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (companyParam) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
  }, [companyParam]);

  return (
    <dialog
      ref={dialogRef}
      className="company-drawer"
      aria-labelledby="company-drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {companyParam ? (
        <DrawerContent
          companyParam={companyParam}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </dialog>
  );
}

function DrawerContent({
  companyParam,
  onClose,
  onSaved,
}: {
  companyParam: string;
  onClose: () => void;
  onSaved: (company: Company) => void;
}) {
  const { locale, t } = useLocale();
  const queryClient = useQueryClient();
  const isCreate = companyParam === CREATE_COMPANY;
  const detail = useQuery({
    ...companyOptions(companyParam),
    enabled: !isCreate,
  });
  const company = detail.data;

  function handleSaved(saved: Company) {
    queryClient.setQueryData(companyKeys.detail(saved.id), saved);
    void queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    onSaved(saved);
  }

  const title = isCreate
    ? t.createTitle
    : company
      ? `${t.editTitle}: ${company.name}`
      : t.editTitle;

  return (
    <div className="drawer">
      <header className="drawer-header">
        <div>
          <h2 id="company-drawer-title" className="drawer-title">
            {title}
          </h2>
          {company && !isCreate ? (
            <p className="drawer-meta">{companyMeta(locale, company.id, company.version)}</p>
          ) : null}
        </div>
        <button type="button" className="drawer-dismiss" onClick={onClose} aria-label={t.close}>
          <span aria-hidden="true">Esc</span>
          <CloseIcon />
        </button>
      </header>
      <div className="drawer-content">
        {isCreate ? (
          <CompanyForm mode="create" onCancel={onClose} onSaved={handleSaved} />
        ) : detail.isPending ? (
          <>
            <p className="sr-only" role="status">
              {t.drawerLoading}
            </p>
            <DrawerSkeleton />
          </>
        ) : detail.isError ? (
          <DrawerError
            error={detail.error}
            onRetry={() => {
              void detail.refetch();
            }}
          />
        ) : company ? (
          <CompanyForm
            key={company.id}
            mode="edit"
            company={company}
            onCancel={onClose}
            onSaved={handleSaved}
          />
        ) : null}
      </div>
    </div>
  );
}

function DrawerError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { t } = useLocale();
  const missing = error instanceof ApiError && error.status === 404;

  return (
    <div className="drawer-scroll">
      <div role="alert" className="banner-error">
        <p>{missing ? t.notFound : t.drawerError}</p>
      </div>
      {missing ? null : (
        <button type="button" onClick={onRetry} className="btn btn-ghost">
          {t.retry}
        </button>
      )}
    </div>
  );
}
