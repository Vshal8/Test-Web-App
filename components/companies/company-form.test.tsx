import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompanyForm } from "@/components/companies/company-form";
import { getCompany, updateCompany } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Company } from "@/lib/companies/types";
import { LocaleProvider } from "@/lib/i18n/locale";

vi.mock("@/lib/api/client", () => ({
  listCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
}));

const company: Company = {
  id: "c01",
  name: "Acme Robotics",
  domain: "acme.example",
  status: "new",
  version: 1,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function renderForm() {
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
  return render(
    <CompanyForm
      mode="edit"
      company={company}
      onCancel={vi.fn()}
      onSaved={vi.fn()}
    />,
    { wrapper: Wrapper },
  );
}

describe("company edit conflict", () => {
  beforeEach(() => {
    vi.mocked(updateCompany).mockReset();
    vi.mocked(getCompany).mockReset();
  });

  it("keeps the draft, reloads the latest version, and resubmits with it", async () => {
    const user = userEvent.setup({ delay: null });
    vi.mocked(updateCompany)
      .mockRejectedValueOnce(
        new ApiError(409, {
          error: "conflict",
          company: { ...company, version: 2, name: "Server Name" },
        }),
      )
      .mockResolvedValueOnce({
        ...company,
        version: 3,
        name: "Typed Name",
      });
    vi.mocked(getCompany).mockResolvedValue({
      ...company,
      version: 2,
      name: "Server Name",
    });

    renderForm();
    const name = screen.getByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Typed Name");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /someone else has updated this company/i,
    );
    expect(name).toHaveValue("Typed Name");
    expect(updateCompany).toHaveBeenCalledWith(
      "c01",
      expect.objectContaining({ if_version: 1, name: "Typed Name" }),
    );

    await user.click(screen.getByRole("button", { name: "Reload & Keep Edits" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      /latest version loaded/i,
    );
    expect(name).toHaveValue("Typed Name");

    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(updateCompany).toHaveBeenLastCalledWith(
      "c01",
      expect.objectContaining({ if_version: 2, name: "Typed Name" }),
    );
  });
});
