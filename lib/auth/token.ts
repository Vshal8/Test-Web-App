const TOKEN_KEY = "companies.token";

type UnauthorizedHandler = () => void;

const tokenListeners = new Set<() => void>();
let unauthorizedHandler: UnauthorizedHandler | null = null;

function emitToken(): void {
  tokenListeners.forEach((listener) => listener());
}

export function subscribeToken(listener: () => void): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

export function getServerToken(): null {
  return null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(TOKEN_KEY);
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  emitToken();
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  emitToken();
}

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  clearToken();
  unauthorizedHandler?.();
}
