import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompaniesScreen } from "@/components/companies/companies-screen";
import { listCompanies } from "@/lib/api/client";
import { setToken } from "@/lib/auth/token";
import type { Company, CompanyListQuery, CompanyListResponse } from "@/lib/companies/types";
import { LocaleProvider } from "@/lib/i18n/locale";
import { resetNavigation } from "@/tests/navigation-stub";

vi.mock("next/navigation", () => import("@/tests/navigation-stub"));

vi.mock("@/lib/api/client", () => ({
  listCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
}));

const acme: Company = {
  id: "c01",
  name: "Acme Robotics",
  domain: "acme.example",
  status: "qualified",
  version: 1,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const northwind: Company = {
  id: "c02",
  name: "Northwind Traders",
  domain: "northwind.example",
  status: "new",
  version: 1,
  created_at: "2025-12-31T00:00:00.000Z",
  updated_at: "2025-12-31T00:00:00.000Z",
};

const allCompanies: CompanyListResponse = {
  items: [acme, northwind],
  total: 2,
  limit: 20,
  offset: 0,
};

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <LocaleProvider>{children}</LocaleProvider>
      </QueryClientProvider>
    );
  }
  return render(<CompaniesScreen />, { wrapper: Wrapper });
}

describe("companies list", () => {
  beforeEach(() => {
    resetNavigation();
    setToken("test-token");
    window.localStorage.removeItem("companies.locale");
    vi.mocked(listCompanies).mockReset();
  });

  it("filters by search and status without remounting the table", async () => {
    const user = userEvent.setup({ delay: null });
    let resolveFiltered: ((value: CompanyListResponse) => void) | undefined;

    vi.mocked(listCompanies).mockImplementation((params: CompanyListQuery) => {
      if (params.status === "new") {
        return new Promise((resolve) => {
          resolveFiltered = resolve;
        });
      }
      if (params.q === "acme") {
        return Promise.resolve({
          items: [acme],
          total: 1,
          limit: 20,
          offset: 0,
        });
      }
      return Promise.resolve(allCompanies);
    });

    renderScreen();
    expect(await screen.findByText("Northwind Traders")).toBeInTheDocument();
    const table = screen.getByRole("table");

    await user.type(screen.getByLabelText("Search"), "acme");
    await waitFor(() => {
      expect(listCompanies).toHaveBeenCalledWith(
        expect.objectContaining({ q: "acme", offset: 0, limit: 20 }),
      );
    });
    expect(await screen.findByText("Acme Robotics")).toBeInTheDocument();
    expect(screen.queryByText("Northwind Traders")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBe(table);

    await user.selectOptions(screen.getByLabelText("Status"), "new");
    await waitFor(() => {
      expect(listCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "new",
          q: "acme",
          offset: 0,
          limit: 20,
        }),
      );
    });
    expect(screen.getByRole("table")).toBe(table);
    expect(screen.getByText("Acme Robotics")).toBeInTheDocument();

    if (!resolveFiltered) throw new Error("Expected the filtered request to be pending.");
    resolveFiltered({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    expect(await screen.findByText("No companies match these filters.")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBe(table);
  });
});
