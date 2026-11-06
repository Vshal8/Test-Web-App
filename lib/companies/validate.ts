import {
  COMPANY_SORTS,
  COMPANY_STATUSES,
  DEFAULT_SORT,
  MAX_LIMIT,
  PAGE_SIZE,
  type CompanyListQuery,
  type CompanySort,
  type CompanyStatus,
  type CreateCompanyBody,
  type FieldErrors,
  type FieldName,
  type UpdateCompanyBody,
} from "@/lib/companies/types";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; fields: FieldErrors };

export function isCompanyStatus(value: unknown): value is CompanyStatus {
  return (
    typeof value === "string" &&
    (COMPANY_STATUSES as readonly string[]).includes(value)
  );
}

export function isCompanySort(value: unknown): value is CompanySort {
  return (
    typeof value === "string" &&
    (COMPANY_SORTS as readonly string[]).includes(value)
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeDomain(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseInteger(value: string): number | null {
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseListSearchParams(
  searchParams: URLSearchParams,
): ParseResult<CompanyListQuery> {
  const fields: FieldErrors = {};

  const limitRaw = searchParams.get("limit");
  let limit = PAGE_SIZE;
  if (limitRaw !== null) {
    const parsed = parseInteger(limitRaw);
    if (parsed === null || parsed < 1) {
      fields.limit = "Limit must be a positive integer.";
    } else {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  const offsetRaw = searchParams.get("offset");
  let offset = 0;
  if (offsetRaw !== null) {
    const parsed = parseInteger(offsetRaw);
    if (parsed === null || parsed < 0) {
      fields.offset = "Offset must be a non-negative integer.";
    } else {
      offset = parsed;
    }
  }

  let q: string | undefined;
  const qRaw = searchParams.get("q");
  if (qRaw !== null) {
    const trimmed = qRaw.trim();
    if (trimmed.length > 0) q = trimmed;
  }

  let status: CompanyStatus | undefined;
  const statusRaw = searchParams.get("status");
  if (statusRaw !== null && statusRaw.trim().length > 0) {
    if (!isCompanyStatus(statusRaw)) {
      fields.status = "Status is invalid.";
    } else {
      status = statusRaw;
    }
  }

  let sort: CompanySort = DEFAULT_SORT;
  const sortRaw = searchParams.get("sort");
  if (sortRaw !== null && sortRaw.trim().length > 0) {
    if (!isCompanySort(sortRaw)) {
      fields.sort = "Sort is invalid.";
    } else {
      sort = sortRaw;
    }
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return { ok: true, value: { limit, offset, q, status, sort } };
}

export function validateCreate(body: unknown): ParseResult<CreateCompanyBody> {
  if (!isRecord(body)) {
    return { ok: false, fields: { name: "Request body must be a JSON object." } };
  }

  const fields: FieldErrors = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length === 0) fields.name = "Name is required.";

  let domain: string | null | undefined;
  if (body.domain !== undefined) {
    if (body.domain !== null && typeof body.domain !== "string") {
      fields.domain = "Domain must be a string.";
    } else {
      domain = normalizeDomain(
        typeof body.domain === "string" ? body.domain : null,
      );
    }
  }

  let status: CompanyStatus | undefined;
  if (body.status !== undefined) {
    if (!isCompanyStatus(body.status)) fields.status = "Status is invalid.";
    else status = body.status;
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    value: {
      name,
      domain,
      status: status ?? "new",
    },
  };
}

export function validatePatch(body: unknown): ParseResult<UpdateCompanyBody> {
  if (!isRecord(body)) {
    return {
      ok: false,
      fields: { if_version: "Request body must be a JSON object." },
    };
  }

  const fields: FieldErrors = {};
  if (typeof body.if_version !== "number" || !Number.isInteger(body.if_version)) {
    fields.if_version = "if_version must be an integer.";
  }

  const value: UpdateCompanyBody = {
    if_version: typeof body.if_version === "number" ? body.if_version : 0,
  };

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      fields.name = "Name is required.";
    } else {
      value.name = body.name.trim();
    }
  }

  if (body.domain !== undefined) {
    if (body.domain !== null && typeof body.domain !== "string") {
      fields.domain = "Domain must be a string.";
    } else {
      value.domain = normalizeDomain(
        typeof body.domain === "string" ? body.domain : null,
      );
    }
  }

  if (body.status !== undefined) {
    if (!isCompanyStatus(body.status)) fields.status = "Status is invalid.";
    else value.status = body.status;
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return { ok: true, value };
}

export function readFieldErrors(body: unknown): FieldErrors {
  if (!isRecord(body) || !isRecord(body.fields)) return {};
  const fields: FieldErrors = {};
  const names: FieldName[] = [
    "name",
    "domain",
    "status",
    "if_version",
    "limit",
    "offset",
    "sort",
    "q",
  ];
  for (const name of names) {
    const value = body.fields[name];
    if (typeof value === "string" && value.length > 0) fields[name] = value;
  }
  return fields;
}
