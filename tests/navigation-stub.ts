import { useSyncExternalStore } from "react";

let current = new URLSearchParams();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function resetNavigation(href = "/companies"): void {
  const url = new URL(href, "http://localhost");
  current = new URLSearchParams(url.search);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePathname(): string {
  return "/companies";
}

export function useSearchParams(): URLSearchParams {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

export function useRouter() {
  return {
    push(href: string) {
      resetNavigation(href);
    },
    replace(href: string) {
      resetNavigation(href);
    },
  };
}
