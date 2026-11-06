import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getCompany,
  listCompanies,
} from "@/lib/api/client";
import type { CompanyListQuery } from "@/lib/companies/types";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params: CompanyListQuery) => [...companyKeys.lists(), params] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

export function listCompaniesOptions(params: CompanyListQuery) {
  return queryOptions({
    queryKey: companyKeys.list(params),
    queryFn: () => listCompanies(params),
    placeholderData: keepPreviousData,
  });
}

export function companyOptions(id: string) {
  return queryOptions({
    queryKey: companyKeys.detail(id),
    queryFn: () => getCompany(id),
  });
}
