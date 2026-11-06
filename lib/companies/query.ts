import type {
  Company,
  CompanyListQuery,
  CompanyListResponse,
} from "@/lib/companies/types";

export function queryCompanies(
  companies: readonly Company[],
  query: CompanyListQuery,
): CompanyListResponse {
  const needle = query.q?.trim().toLowerCase() ?? "";

  const filtered = companies.filter((company) => {
    if (query.status && company.status !== query.status) return false;
    if (!needle) return true;
    const domain = company.domain?.toLowerCase() ?? "";
    return (
      company.name.toLowerCase().includes(needle) || domain.includes(needle)
    );
  });

  const descending = query.sort.startsWith("-");
  const field = descending ? query.sort.slice(1) : query.sort;
  const direction = descending ? -1 : 1;

  const sorted = [...filtered].sort((left, right) => {
    const primary =
      field === "name"
        ? left.name.localeCompare(right.name, "en", { sensitivity: "base" })
        : left.created_at.localeCompare(right.created_at);
    if (primary !== 0) return primary * direction;
    return left.id.localeCompare(right.id) * direction;
  });

  return {
    items: sorted.slice(query.offset, query.offset + query.limit),
    total: sorted.length,
    limit: query.limit,
    offset: query.offset,
  };
}
