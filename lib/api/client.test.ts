import { keepPreviousData } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { listCompanies, updateCompany } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { listCompaniesOptions } from "@/lib/api/queries";
import {
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from "@/lib/auth/token";
import type { CompanyListQuery } from "@/lib/companies/types";

const listParams: CompanyListQuery = {
  limit: 20,
  offset: 0,
  q: "acme",
  status: "new",
  sort: "name",
};

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
  clearToken();
});

describe("listCompaniesOptions", () => {
  it("includes the list params in the query key and keeps the previous page", () => {
    const options = listCompaniesOptions(listParams);

    expect(options.queryKey).toEqual(["companies", "list", listParams]);
    expect(options.placeholderData).toBe(keepPreviousData);
  });
});

describe("companies client", () => {
  it("sends the bearer token", async () => {
    setToken("abc");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ items: [], total: 0, limit: 20, offset: 0 }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await listCompanies({ limit: 20, offset: 0, sort: "-created_at" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer abc");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("sort=-created_at");
  });

  it("throws ApiError for 409 and 422 without clearing the token", async () => {
    setToken("abc");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "conflict" }), { status: 409 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: "validation", fields: { name: "Name is required." } }),
          { status: 422 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updateCompany("c01", { if_version: 1, name: "A" }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      updateCompany("c01", { if_version: 1, name: "" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBe("abc");
  });

  it("clears the token and notifies the app on 401", async () => {
    setToken("abc");
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
      ),
    );

    await expect(
      listCompanies({ limit: 20, offset: 0, sort: "-created_at" }),
    ).rejects.toMatchObject({ status: 401 });
    expect(getToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});
