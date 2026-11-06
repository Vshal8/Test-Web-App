import {
  DEFAULT_SORT,
  type CompanySort,
  type CompanyStatus,
} from "@/lib/companies/types";
import { isCompanySort, isCompanyStatus } from "@/lib/companies/validate";

export const CREATE_COMPANY = "new";

export type CompanyViewParams = {
  q: string;
  status: CompanyStatus | "";
  sort: CompanySort;
  page: number;
  company: string | null;
};

export function parseCompanyView(searchParams: URLSearchParams): CompanyViewParams {
  const q = searchParams.get("q") ?? "";
  const statusRaw = searchParams.get("status") ?? "";
  const status = isCompanyStatus(statusRaw) ? statusRaw : "";
  const sortRaw = searchParams.get("sort");
  const sort = sortRaw && isCompanySort(sortRaw) ? sortRaw : DEFAULT_SORT;
  const pageNumber = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
  const companyRaw = searchParams.get("company");
  const company =
    companyRaw && companyRaw.trim().length > 0 ? companyRaw : null;

  return { q, status, sort, page, company };
}

export function hrefFromParams(params: CompanyViewParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.sort !== DEFAULT_SORT) search.set("sort", params.sort);
  if (params.page > 1) search.set("page", String(params.page));
  if (params.company) search.set("company", params.company);
  const query = search.toString();
  return query.length > 0 ? `/companies?${query}` : "/companies";
}

export function nextSort(
  current: CompanySort,
  column: "name" | "created_at",
): CompanySort {
  if (column === "name") return current === "name" ? "-name" : "name";
  return current === "created_at" ? "-created_at" : "created_at";
}
