import { isBrowser } from "@workspace/ui/utils/index";

export type TelegramAuthMode = "login" | "bind";

const TELEGRAM_AUTH_MODE_STORAGE_KEY = "telegram-auth-mode";

function isTelegramAuthMode(value: unknown): value is TelegramAuthMode {
  return value === "login" || value === "bind";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeTelegramAuthValue(value: unknown): string | null {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return null;
}

function hasTelegramAuthFields(value: Record<string, unknown>) {
  return (
    typeof value.auth_date !== "undefined" &&
    typeof value.hash !== "undefined" &&
    (typeof value.id !== "undefined" || typeof value.username !== "undefined")
  );
}

export function setPendingTelegramAuthMode(mode: TelegramAuthMode) {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.setItem(TELEGRAM_AUTH_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
}

export function getPendingTelegramAuthMode(): TelegramAuthMode | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const mode = sessionStorage.getItem(TELEGRAM_AUTH_MODE_STORAGE_KEY);
    return isTelegramAuthMode(mode) ? mode : null;
  } catch {
    return null;
  }
}

export function extractTelegramAuthCallbackPayload(
  value: unknown
): Record<string, string> | null {
  let source = value;

  if (typeof source === "string") {
    const queryString = source.startsWith("?") ? source.slice(1) : source;
    const queryParams = new URLSearchParams(queryString);
    if (queryParams.get("auth_date") && queryParams.get("hash")) {
      return Object.fromEntries(queryParams.entries());
    }

    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }

  if (!isRecord(source)) {
    return null;
  }

  const candidates = [
    source,
    isRecord(source.payload) ? source.payload : null,
    isRecord(source.data) ? source.data : null,
    isRecord(source.user) ? source.user : null,
    isRecord(source.auth_data) ? source.auth_data : null,
    isRecord(source.result) ? source.result : null,
  ].filter((candidate): candidate is Record<string, unknown> => !!candidate);

  for (const candidate of candidates) {
    if (!hasTelegramAuthFields(candidate)) {
      continue;
    }

    const payload = Object.entries(candidate).reduce<Record<string, string>>(
      (acc, [key, item]) => {
        const normalized = normalizeTelegramAuthValue(item);

        if (normalized !== null) {
          acc[key] = normalized;
        }

        return acc;
      },
      {}
    );

    return payload;
  }

  return null;
}

export function openCenteredPopup(
  url: string,
  name: string,
  width = 520,
  height = 680
) {
  if (!isBrowser()) {
    return null;
  }

  const left = Math.max(window.screenX + (window.outerWidth - width) / 2, 0);
  const top = Math.max(window.screenY + (window.outerHeight - height) / 2, 0);
  const features = [
    "popup=yes",
    "resizable=yes",
    "scrollbars=yes",
    "status=no",
    "toolbar=no",
    "menubar=no",
    `width=${Math.round(width)}`,
    `height=${Math.round(height)}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
  ].join(",");

  const popup = window.open(url, name, features);
  popup?.focus();

  return popup;
}

export function openTelegramAuthPopup(mode: "login" | "bind") {
  setPendingTelegramAuthMode(mode);
  return openCenteredPopup("about:blank", `telegram-${mode}-popup`);
}

export function navigatePopupToUrl(popup: Window | null, url: string) {
  if (popup && !popup.closed) {
    popup.location.replace(url);
    popup.focus();
    return true;
  }

  if (isBrowser()) {
    window.location.href = url;
  }

  return false;
}

export function closePopup(popup: Window | null) {
  try {
    if (popup && !popup.closed) {
      popup.close();
    }
  } catch {
    // ignore popup close errors
  }
}
