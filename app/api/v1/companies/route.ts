import {
  json,
  readJson,
  requireAuth,
  validationError,
} from "@/lib/companies/http";
import { queryCompanies } from "@/lib/companies/query";
import { getCompanies, insertCompany } from "@/lib/companies/store";
import { parseListSearchParams, validateCreate } from "@/lib/companies/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const parsed = parseListSearchParams(url.searchParams);
  if (!parsed.ok) return validationError(parsed.fields);

  return json(queryCompanies(getCompanies(), parsed.value), 200);
}

export async function POST(request: Request): Promise<Response> {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const body = await readJson(request);
  if (!body.ok) return validationError({ name: "Request body must be JSON." });

  const parsed = validateCreate(body.value);
  if (!parsed.ok) return validationError(parsed.fields);

  const company = insertCompany({
    name: parsed.value.name,
    domain: parsed.value.domain ?? null,
    status: parsed.value.status ?? "new",
  });
  return json(company, 201);
}
