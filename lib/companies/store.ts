import type { Company, CompanyStatus } from "@/lib/companies/types";

type SeedRow = {
  name: string;
  domain: string | null;
  status: CompanyStatus;
};

const SEED: readonly SeedRow[] = [
  { name: "Acme Robotics", domain: "acme.example", status: "qualified" },
  { name: "Northwind Traders", domain: "northwind.example", status: "contacted" },
  { name: "Bright Pixel", domain: "brightpixel.example", status: "researching" },
  { name: "Harbor and Co", domain: null, status: "new" },
  { name: "Lumen Health", domain: "lumen.example", status: "rejected" },
  { name: "Cobalt Analytics", domain: "cobalt.example", status: "qualified" },
  { name: "Paperplane Mail", domain: "paperplane.example", status: "contacted" },
  { name: "Kepler Studio", domain: null, status: "researching" },
  { name: "Fieldnote", domain: "fieldnote.example", status: "new" },
  { name: "Orange Oak", domain: "orangeoak.example", status: "rejected" },
  { name: "Sable Freight", domain: "sable.example", status: "qualified" },
  { name: "Mintline", domain: "mintline.example", status: "contacted" },
  { name: "Red Kite Labs", domain: null, status: "researching" },
  { name: "Glacier Pay", domain: "glacier.example", status: "new" },
  { name: "Nimbus School", domain: "nimbus.example", status: "rejected" },
  { name: "Aster Supply", domain: "aster.example", status: "qualified" },
  { name: "Kindred Works", domain: "kindred.example", status: "contacted" },
  { name: "Volt and Vine", domain: null, status: "researching" },
  { name: "Plover Systems", domain: "plover.example", status: "new" },
  { name: "Cedar Route", domain: "cedar.example", status: "rejected" },
  { name: "Acme Parts", domain: "parts.acme.example", status: "qualified" },
  { name: "Juniper Goods", domain: "juniper.example", status: "contacted" },
  { name: "Quartz Legal", domain: null, status: "researching" },
  { name: "Bluefin Data", domain: "bluefin.example", status: "new" },
  { name: "Marlowe and Pine", domain: "marlowe.example", status: "rejected" },
  { name: "Summit Grain", domain: "summit.example", status: "qualified" },
  { name: "Ivory Thread", domain: "ivory.example", status: "contacted" },
  { name: "Driftwood AI", domain: null, status: "researching" },
  { name: "Larkspur", domain: "larkspur.example", status: "new" },
  { name: "Copper Lantern", domain: "copper.example", status: "rejected" },
  { name: "Westbridge", domain: "westbridge.example", status: "qualified" },
  { name: "Nova Parish", domain: "nova.example", status: "contacted" },
  { name: "Elm Street Coffee", domain: "elm.example", status: "researching" },
  { name: "Polar Thread", domain: "polar.example", status: "new" },
  { name: "Kite and Canvas", domain: "kite.example", status: "rejected" },
  { name: "Solstice Bio", domain: null, status: "qualified" },
  { name: "Anchorpoint", domain: "anchor.example", status: "contacted" },
  { name: "Yellowbird", domain: "yellowbird.example", status: "researching" },
  { name: "Forge District", domain: "forge.example", status: "new" },
  { name: "Little Orbit", domain: "littleorbit.example", status: "rejected" },
];

const BASE_TIME = Date.UTC(2026, 0, 1);

function seedCompanies(): Company[] {
  return SEED.map((row, index) => {
    const createdAt = new Date(BASE_TIME - index * 86_400_000).toISOString();
    return {
      id: `c${String(index + 1).padStart(2, "0")}`,
      name: row.name,
      domain: row.domain,
      status: row.status,
      version: 1,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}

declare global {
  var __companiesStore: Company[] | undefined;
}

export function getCompanies(): Company[] {
  if (!globalThis.__companiesStore) {
    globalThis.__companiesStore = seedCompanies();
  }
  return globalThis.__companiesStore;
}

export function findCompany(id: string): Company | undefined {
  return getCompanies().find((company) => company.id === id);
}

export function insertCompany(input: {
  name: string;
  domain: string | null;
  status: CompanyStatus;
}): Company {
  const now = new Date().toISOString();
  const company: Company = {
    id: crypto.randomUUID(),
    name: input.name,
    domain: input.domain,
    status: input.status,
    version: 1,
    created_at: now,
    updated_at: now,
  };
  getCompanies().push(company);
  return company;
}

export type CompanyUpdateResult =
  | { ok: true; company: Company }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "conflict"; company: Company };

export function updateCompanyRecord(
  id: string,
  patch: {
    if_version: number;
    name?: string;
    domain?: string | null;
    status?: CompanyStatus;
  },
): CompanyUpdateResult {
  const companies = getCompanies();
  const index = companies.findIndex((company) => company.id === id);
  if (index === -1) return { ok: false, reason: "not_found" };

  const current = companies[index];
  if (!current) return { ok: false, reason: "not_found" };
  if (current.version !== patch.if_version) {
    return { ok: false, reason: "conflict", company: current };
  }

  const updated: Company = {
    ...current,
    name: patch.name ?? current.name,
    domain: patch.domain === undefined ? current.domain : patch.domain,
    status: patch.status ?? current.status,
    version: current.version + 1,
    updated_at: new Date().toISOString(),
  };
  companies[index] = updated;
  return { ok: true, company: updated };
}
