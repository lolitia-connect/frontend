import { isBrowser } from "@workspace/ui/utils/index";

export type TelegramAuthMode = "login" | "bind";

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

function encodeTelegramAuthResult(payload: Record<string, string | number>) {
  const processedPayload = {
    ...payload,
    id: Number(payload.id),
    auth_date: Number(payload.auth_date),
  };

  const json = JSON.stringify(processedPayload);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ""
  );

  return btoa(binary);
}

function hasTelegramAuthFields(value: Record<string, unknown>) {
  return (
    typeof value.auth_date !== "undefined" &&
    typeof value.hash !== "undefined" &&
    (typeof value.id !== "undefined" || typeof value.username !== "undefined")
  );
}

// Telegram's redirect flow hands the signed payload back as a base64 (standard
// or URL-safe) `tgAuthResult` blob. Decode it so the fields can flow through the
// same normalization path as the individual query parameters some setups emit.
function decodeTelegramAuthResult(
  value: string
): Record<string, unknown> | null {
  let normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = normalized.length % 4;
  if (remainder) {
    normalized += "=".repeat(4 - remainder);
  }

  try {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function extractTelegramAuthCallbackPayload(
  value: unknown
): Record<string, string> | null {
  let source: unknown = value;

  if (typeof source === "string") {
    const raw = source;
    const queryString = raw.startsWith("?") ? raw.slice(1) : raw;
    const queryParams = new URLSearchParams(queryString);
    if (queryParams.get("auth_date") && queryParams.get("hash")) {
      return Object.fromEntries(queryParams.entries());
    }

    const tgAuthResult = queryParams.get("tgAuthResult");
    if (tgAuthResult) {
      source = decodeTelegramAuthResult(tgAuthResult);
    } else {
      try {
        source = JSON.parse(raw);
      } catch {
        source = decodeTelegramAuthResult(raw);
      }
    }
  }

  if (!isRecord(source)) {
    return null;
  }

  let record: Record<string, unknown> = source;

  // Some bridges forward the raw `tgAuthResult` blob instead of the decoded
  // fields; unwrap it so downstream candidates see the signed user object.
  if (typeof record.tgAuthResult === "string") {
    const decoded = decodeTelegramAuthResult(record.tgAuthResult);
    if (decoded) {
      record = decoded;
    }
  }

  const candidates = [
    record,
    isRecord(record.payload) ? record.payload : null,
    isRecord(record.data) ? record.data : null,
    isRecord(record.user) ? record.user : null,
    isRecord(record.auth_data) ? record.auth_data : null,
    isRecord(record.result) ? record.result : null,
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

function resolveAllowedCallbackOrigins(): Set<string> {
  const origins = new Set<string>();

  if (isBrowser()) {
    origins.add(window.location.origin);
  }

  return origins;
}

// Open the Telegram authorization window. This MUST be called synchronously
// from the user's click handler — browsers only allow `window.open` as a direct
// response to a user gesture, so opening it after the awaited backend round
// trip (as the previous widget-based flow did) got silently blocked.
export function openTelegramAuthPopup(mode: TelegramAuthMode): Window | null {
  if (!isTelegramAuthMode(mode)) {
    throw new Error("Invalid Telegram auth mode");
  }

  return openCenteredPopup("about:blank", `telegram-${mode}-popup`);
}

// Drive the already-open popup through the Telegram OAuth URL and resolve once
// the static bridge page (`public/{oauth,bind}/telegram/index.html`) relays the
// signed payload back via `postMessage`.
export function requestTelegramAuthCallback(
  redirectUrl: string,
  popup: Window | null
): Promise<Record<string, string>> {
  if (!isBrowser()) {
    return Promise.reject(
      new Error("Telegram auth callback can only run in browser")
    );
  }

  // The popup was blocked (or never opened). Fall back to a full-page redirect
  // so the user can still authenticate; the page unloads, so this promise never
  // settles.
  if (!popup || popup.closed) {
    window.location.href = redirectUrl;
    return new Promise<Record<string, string>>(() => {
      /* intentionally never settles: the document is navigating away */
    });
  }

  return new Promise<Record<string, string>>((resolve, reject) => {
    const allowedOrigins = resolveAllowedCallbackOrigins();
    let settled = false;
    let closeTimer = 0;

    const handleMessage = (event: MessageEvent) => {
      if (allowedOrigins.size > 0 && !allowedOrigins.has(event.origin)) {
        return;
      }

      const payload = extractTelegramAuthCallbackPayload(event.data);
      if (!payload) {
        return;
      }

      settled = true;
      window.removeEventListener("message", handleMessage);
      if (closeTimer) {
        window.clearInterval(closeTimer);
        closeTimer = 0;
      }
      closePopup(popup);
      resolve(payload);
    };

    window.addEventListener("message", handleMessage);

    // Detect the user dismissing the popup so the triggering button does not
    // stay stuck in its loading state forever. A short grace period lets an
    // in-flight `postMessage` win the race against the bridge closing itself.
    closeTimer = window.setInterval(() => {
      if (settled || !popup.closed) {
        return;
      }

      window.clearInterval(closeTimer);
      closeTimer = 0;
      window.setTimeout(() => {
        if (settled) {
          return;
        }
        window.removeEventListener("message", handleMessage);
        reject(new Error("Telegram auth popup was closed before completing"));
      }, 500);
    }, 500);

    popup.location.replace(redirectUrl);
    popup.focus();
  });
}

export function navigateToTelegramCallbackRoute(
  mode: TelegramAuthMode,
  payload: Record<string, string>
) {
  if (!isBrowser()) {
    return;
  }

  if (!isTelegramAuthMode(mode)) {
    throw new Error("Invalid Telegram auth mode");
  }

  // Navigate to the real pathname route, not a hash fragment. The pre-migration
  // app used TanStack *hash* history (`createHashHistory()` in `src/main.tsx`),
  // so assigning `location.hash` performed a route change. Under the App Router
  // a fragment is not a route, so assigning `location.hash` changes the URL
  // without ever mounting `/oauth/telegram` (or `/bind/telegram`) — the
  // certification effect would never run and the sign-in silently stalled.
  // `location.assign` performs a full navigation, which also discards the
  // now-foreign hash and guarantees the route mounts on both fresh and
  // already-loaded documents.
  const path = mode === "bind" ? "/bind/telegram" : "/oauth/telegram";
  const search = new URLSearchParams({
    tgAuthResult: encodeTelegramAuthResult(payload),
  }).toString();
  const target = search ? `${path}?${search}` : path;

  window.location.assign(target);
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

export function closePopup(popup: Window | null) {
  try {
    if (popup && !popup.closed) {
      popup.close();
    }
  } catch {
    // ignore popup close errors
  }
}
