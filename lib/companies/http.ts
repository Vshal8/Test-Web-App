import type {
  ConflictErrorBody,
  FieldErrors,
  NotFoundErrorBody,
  UnauthorizedErrorBody,
  ValidationErrorBody,
} from "@/lib/companies/types";

export function artificialDelay(): Promise<void> {
  const ms = 300 + Math.floor(Math.random() * 501);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function requireAuth(request: Request): Promise<Response | null> {
  await artificialDelay();
  if (readBearer(request)) return null;
  const body: UnauthorizedErrorBody = { error: "unauthorized" };
  return json(body, 401);
}

export async function readJson(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return { ok: false };
  }
}

export function validationError(fields: FieldErrors): Response {
  const body: ValidationErrorBody = { error: "validation", fields };
  return json(body, 422);
}

export function notFoundError(): Response {
  const body: NotFoundErrorBody = { error: "not_found" };
  return json(body, 404);
}

export function conflictError(company: ConflictErrorBody["company"]): Response {
  const body: ConflictErrorBody = { error: "conflict", company };
  return json(body, 409);
}
