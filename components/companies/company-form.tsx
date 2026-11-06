"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState, type FormEvent } from "react";
import { createCompany, updateCompany } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { companyOptions } from "@/lib/api/queries";
import type {
  Company,
  CompanyStatus,
  CreateCompanyBody,
  FieldErrors,
  UpdateCompanyBody,
} from "@/lib/companies/types";
import { COMPANY_STATUSES } from "@/lib/companies/types";
import { readFieldErrors, validateCreate, validatePatch } from "@/lib/companies/validate";
import { translateFieldMessage } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale";
import { WarningIcon } from "@/components/icons";

type SaveInput =
  | { mode: "create"; body: CreateCompanyBody }
  | { mode: "edit"; id: string; body: UpdateCompanyBody };

type CompanyFormProps = {
  onCancel: () => void;
  onSaved: (company: Company) => void;
} & ({ mode: "create" } | { mode: "edit"; company: Company });

export function CompanyForm(props: CompanyFormProps) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const initial = props.mode === "edit" ? props.company : null;
  const [name, setName] = useState(initial?.name ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [status, setStatus] = useState<CompanyStatus>(initial?.status ?? "new");
  const [version, setVersion] = useState(initial?.version ?? 1);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  const nameId = useId();
  const domainId = useId();
  const statusId = useId();
  const nameErrorId = useId();
  const domainErrorId = useId();
  const statusErrorId = useId();

  const saveMutation = useMutation({
    mutationFn: (input: SaveInput) => {
      if (input.mode === "create") return createCompany(input.body);
      return updateCompany(input.id, input.body);
    },
  });

  function applyApiError(error: unknown) {
    if (error instanceof ApiError && error.status === 422) {
      setFieldErrors(readFieldErrors(error.body));
      setFormError(t.validationError);
      setConflict(false);
      return;
    }
    if (error instanceof ApiError && error.status === 409) {
      setConflict(true);
      setFormError(null);
      setStatusMessage(null);
      return;
    }
    setFormError(t.saveError);
  }

  async function reloadLatest() {
    if (props.mode !== "edit") return;
    setReloading(true);
    setFormError(null);
    try {
      const latest = await queryClient.fetchQuery(companyOptions(props.company.id));
      setVersion(latest.version);
      setConflict(false);
      setStatusMessage(t.reloaded);
    } catch {
      setFormError(t.drawerError);
    } finally {
      setReloading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);
    const draft = {
      name,
      domain,
      status,
    };

    if (props.mode === "create") {
      const parsed = validateCreate(draft);
      if (!parsed.ok) {
        setFieldErrors(parsed.fields);
        setFormError(t.validationError);
        return;
      }
      try {
        const saved = await saveMutation.mutateAsync({
          mode: "create",
          body: parsed.value,
        });
        setFieldErrors({});
        props.onSaved(saved);
      } catch (error) {
        applyApiError(error);
      }
      return;
    }

    const parsed = validatePatch({ if_version: version, ...draft });
    if (!parsed.ok) {
      setFieldErrors(parsed.fields);
      setFormError(t.validationError);
      return;
    }
    try {
      const saved = await saveMutation.mutateAsync({
        mode: "edit",
        id: props.company.id,
        body: parsed.value,
      });
      setVersion(saved.version);
      setFieldErrors({});
      setConflict(false);
      props.onSaved(saved);
    } catch (error) {
      applyApiError(error);
    }
  }

  const nameMessage = fieldErrors.name
    ? translateFieldMessage(fieldErrors.name, t)
    : null;
  const domainMessage = fieldErrors.domain
    ? translateFieldMessage(fieldErrors.domain, t)
    : null;
  const statusMessageError = fieldErrors.status
    ? translateFieldMessage(fieldErrors.status, t)
    : null;

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="drawer-form" noValidate>
      <div className="drawer-scroll">
        <div aria-live="assertive">
          {conflict ? (
            <div role="alert" className="banner-conflict">
              <p className="banner-conflict-copy">
                <WarningIcon />
                <span>{t.conflict}</span>
              </p>
              <button
                type="button"
                onClick={() => void reloadLatest()}
                disabled={reloading}
                className="btn banner-action"
              >
                {t.reload}
              </button>
            </div>
          ) : null}
          {formError ? (
            <p role="alert" className="banner-error">
              {formError}
            </p>
          ) : null}
        </div>
        {statusMessage ? (
          <p role="status" className="banner-success">
            {statusMessage}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor={nameId} className="field-label">
            {t.name}
          </label>
          <input
            id={nameId}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameMessage ? true : undefined}
            aria-describedby={nameMessage ? nameErrorId : undefined}
            className="input"
          />
          {nameMessage ? (
            <p id={nameErrorId} className="field-error">
              {nameMessage}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={domainId} className="field-label">
            {t.domain}
          </label>
          <input
            id={domainId}
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            aria-invalid={domainMessage ? true : undefined}
            aria-describedby={domainMessage ? domainErrorId : undefined}
            className="input"
          />
          {domainMessage ? (
            <p id={domainErrorId} className="field-error">
              {domainMessage}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={statusId} className="field-label">
            {t.statusLabel}
          </label>
          <select
            id={statusId}
            value={status}
            onChange={(event) => {
              const next = event.target.value;
              if (
                next === "new" ||
                next === "researching" ||
                next === "contacted" ||
                next === "qualified" ||
                next === "rejected"
              ) {
                setStatus(next);
              }
            }}
            aria-invalid={statusMessageError ? true : undefined}
            aria-describedby={statusMessageError ? statusErrorId : undefined}
            className="input input-select"
          >
            {COMPANY_STATUSES.map((option) => (
              <option key={option} value={option}>
                {t.status[option]}
              </option>
            ))}
          </select>
          {statusMessageError ? (
            <p id={statusErrorId} className="field-error">
              {statusMessageError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="drawer-footer">
        <button type="button" onClick={props.onCancel} className="btn btn-ghost">
          {t.cancel}
        </button>
        <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
          {saveMutation.isPending ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}
