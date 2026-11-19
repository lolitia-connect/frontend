"use client";

interface NavigationProgressState {
  from: string;
  id: number;
  pending: boolean;
}

let state: NavigationProgressState | null = null;
let timeout: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function getNavigationProgress() {
  return state;
}

export function subscribeNavigationProgress(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function completeNavigationProgress(id = state?.id) {
  if (!state?.pending || state.id !== id) return;
  clearTimeout(timeout);
  state = { ...state, pending: false };
  notify();
}

export function startNavigationProgress(href: string) {
  if (typeof window === "undefined") return;
  const current = new URL(window.location.href);
  const target = new URL(href, current);
  if (target.origin !== current.origin) return;

  const from = `${current.pathname}?${current.searchParams.toString()}`;
  const to = `${target.pathname}?${target.searchParams.toString()}`;
  if (from === to) {
    completeNavigationProgress();
    return;
  }

  const id = (state?.id ?? 0) + 1;
  state = { id, from, pending: true };
  clearTimeout(timeout);
  // Failed or aborted navigations may never commit a new location.
  timeout = setTimeout(() => completeNavigationProgress(id), 30_000);
  notify();
  return id;
}
