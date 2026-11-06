export const COMPANY_STATUSES = [
  "new",
  "researching",
  "contacted",
  "qualified",
  "rejected",
] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_SORTS = [
  "name",
  "-name",
  "created_at",
  "-created_at",
] as const;

export type CompanySort = (typeof COMPANY_SORTS)[number];

export type Company = {
  id: string;
  name: string;
  domain: string | null;
  status: CompanyStatus;
  version: number;
  created_at: string;
  updated_at: string;
};

export type CompanyListQuery = {
  limit: number;
  offset: number;
  q?: string;
  status?: CompanyStatus;
  sort: CompanySort;
};

export type CompanyListResponse = {
  items: Company[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateCompanyBody = {
  name: string;
  domain?: string | null;
  status?: CompanyStatus;
};

export type UpdateCompanyBody = {
  if_version: number;
  name?: string;
  domain?: string | null;
  status?: CompanyStatus;
};

export type FieldName =
  | "name"
  | "domain"
  | "status"
  | "if_version"
  | "limit"
  | "offset"
  | "sort"
  | "q";

export type FieldErrors = Partial<Record<FieldName, string>>;

export type ValidationErrorBody = {
  error: "validation";
  fields: FieldErrors;
};

export type ConflictErrorBody = {
  error: "conflict";
  company: Company;
};

export type NotFoundErrorBody = {
  error: "not_found";
};

export type UnauthorizedErrorBody = {
  error: "unauthorized";
};

export const PAGE_SIZE = 20;
export const DEFAULT_SORT: CompanySort = "-created_at";
export const MAX_LIMIT = 100;
