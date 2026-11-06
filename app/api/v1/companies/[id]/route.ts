import {
  conflictError,
  json,
  notFoundError,
  readJson,
  requireAuth,
  validationError,
} from "@/lib/companies/http";
import { findCompany, updateCompanyRecord } from "@/lib/companies/store";
import { validatePatch } from "@/lib/companies/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const company = findCompany(id);
  if (!company) return notFoundError();
  return json(company, 200);
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!findCompany(id)) return notFoundError();

  const body = await readJson(request);
  if (!body.ok) {
    return validationError({ if_version: "Request body must be JSON." });
  }

  const parsed = validatePatch(body.value);
  if (!parsed.ok) return validationError(parsed.fields);

  const result = updateCompanyRecord(id, parsed.value);
  if (!result.ok) {
    if (result.reason === "conflict") return conflictError(result.company);
    return notFoundError();
  }
  return json(result.company, 200);
}
