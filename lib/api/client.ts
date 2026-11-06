import { ApiError } from "@/lib/api/errors";
import { getToken, notifyUnauthorized } from "@/lib/auth/token";
import type {
  Company,
  CompanyListQuery,
  CompanyListResponse,
  CreateCompanyBody,
  UpdateCompanyBody,
} from "@/lib/companies/types";

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });
  const body = await readBody(response);

  if (response.status === 401) {
    notifyUnauthorized();
    throw new ApiError(401, body);
  }
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}

function toQuery(params: CompanyListQuery): string {
  const search = new URLSearchParams();
  search.set("limit", String(params.limit));
  search.set("offset", String(params.offset));
  search.set("sort", params.sort);
  if (params.q && params.q.trim().length > 0) search.set("q", params.q.trim());
  if (params.status) search.set("status", params.status);
  return search.toString();
}

export function listCompanies(
  params: CompanyListQuery,
): Promise<CompanyListResponse> {
  return request<CompanyListResponse>(`/api/v1/companies?${toQuery(params)}`);
}

export function getCompany(id: string): Promise<Company> {
  return request<Company>(`/api/v1/companies/${encodeURIComponent(id)}`);
}

export function createCompany(body: CreateCompanyBody): Promise<Company> {
  return request<Company>("/api/v1/companies", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateCompany(
  id: string,
  body: UpdateCompanyBody,
): Promise<Company> {
  return request<Company>(`/api/v1/companies/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
