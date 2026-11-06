import { describe, expect, it } from "vitest";
import { queryCompanies } from "@/lib/companies/query";
import type { Company } from "@/lib/companies/types";

const companies: Company[] = [
  {
    id: "c01",
    name: "Bravo",
    domain: "bravo.example",
    status: "new",
    version: 1,
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "c02",
    name: "acme labs",
    domain: null,
    status: "qualified",
    version: 1,
    created_at: "2026-01-03T00:00:00.000Z",
    updated_at: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "c03",
    name: "Cedar",
    domain: "acme.example",
    status: "new",
    version: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("queryCompanies", () => {
  it("searches name and domain, then sorts and paginates", () => {
    const result = queryCompanies(companies, {
      limit: 1,
      offset: 1,
      q: "ACME",
      sort: "name",
    });

    expect(result.total).toBe(2);
    expect(result.limit).toBe(1);
    expect(result.offset).toBe(1);
    expect(result.items.map((company) => company.id)).toEqual(["c03"]);
  });

  it("filters by status and sorts created dates descending", () => {
    const result = queryCompanies(companies, {
      limit: 20,
      offset: 0,
      status: "new",
      sort: "-created_at",
    });

    expect(result.items.map((company) => company.id)).toEqual(["c01", "c03"]);
  });
});
