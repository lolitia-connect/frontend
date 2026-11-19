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

// Parse the `bot_id` and the Telegram widgets origin (e.g.
// `https://oauth.telegram.org`) out of the backend-built authorization URL so
// the callback can trust Telegram's `postMessage` and run its `/auth/get`
// fallback exactly like the official widget does.
function parseTelegramAuthEndpoint(redirectUrl: string): {
  origin: string | null;
  botId: string | null;
} {
  try {
    const url = new URL(redirectUrl);
    return { origin: url.origin, botId: url.searchParams.get("bot_id") };
  } catch {
    return { origin: null, botId: null };
  }
}

// Mirror of the Telegram widget's `getAuthData`: when the popup closes without
// having relayed a message (some flows only expose the signed user through this
// endpoint), ask `oauth.telegram.org/auth/get` for the authenticated user. The
// request is credentialed and cross-origin, so Telegram only answers for an
// origin the bot owner registered with @BotFather.
function fetchTelegramAuthData(
  telegramOrigin: string | null,
  botId: string | null
): Promise<Record<string, string> | null> {
  if (!(telegramOrigin && botId)) {
    return Promise.resolve(null);
  }

  return fetch(`${telegramOrigin}/auth/get`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: `bot_id=${encodeURIComponent(botId)}`,
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((result) => {
      if (result && typeof result === "object" && "user" in result) {
        return extractTelegramAuthCallbackPayload(
          (result as { user: unknown }).user
        );
      }
      return null;
    })
    .catch(() => null);
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
// Telegram relays the signed payload. Telegram opens its authorization page as
// a popup whose opener is this window, and on success it `postMessage`s
// `{event:"auth_result", result:{…}}` back from the `oauth.telegram.org` origin
// and closes itself (it does NOT navigate to `return_to`). Trust is therefore
// established by matching the message `source` to the popup we opened — exactly
// like the official `telegram-widget.js` — instead of an origin allowlist,
// which would drop Telegram's own message. The redirect-to-`return_to` bridge
// (handled by the callback page's `relayTelegramCallbackToOpener`) and the
// `/auth/get` close fallback cover the remaining flows.
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

  const { origin: telegramOrigin, botId } =
    parseTelegramAuthEndpoint(redirectUrl);

  return new Promise<Record<string, string>>((resolve, reject) => {
    let settled = false;
    let closeTimer = 0;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      if (closeTimer) {
        window.clearInterval(closeTimer);
        closeTimer = 0;
      }
    };

    const finish = (payload: Record<string, string>) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      closePopup(popup);
      resolve(payload);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    const isTrustedSender = (event: MessageEvent) => {
      // The window we opened is the authoritative sender, whether it is still on
      // `oauth.telegram.org` (native `auth_result` message) or has been
      // redirected to our own callback page (relayed `tgAuthResult`).
      if (event.source === popup) {
        return true;
      }
      // `event.source` can be null for synthetic events and some embedded
      // flows; fall back to the origins we actually expect to hear from.
      return (
        event.origin === window.location.origin ||
        (telegramOrigin !== null && event.origin === telegramOrigin)
      );
    };

    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedSender(event)) {
        return;
      }

      const payload = extractTelegramAuthCallbackPayload(event.data);
      if (!payload) {
        return;
      }

      finish(payload);
    };

    window.addEventListener("message", handleMessage);

    // When the popup closes, Telegram may have authenticated the user without a
    // deliverable message (it closed before/instead of posting). Mirror the
    // official widget: pull the signed user from `/auth/get`, and only reject if
    // that also yields nothing so the triggering button leaves its loading
    // state. A short grace period lets an in-flight `postMessage` win the race.
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

        fetchTelegramAuthData(telegramOrigin, botId)
          .then((payload) => {
            if (payload) {
              finish(payload);
            } else {
              fail(
                new Error("Telegram auth popup was closed before completing")
              );
            }
          })
          .catch(() => {
            fail(new Error("Telegram auth popup was closed before completing"));
          });
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

// Merge the query string and the hash fragment of the current document into a
// single flat record. Telegram's redirect flow returns the signed payload in
// the hash (`#tgAuthResult=...`), while the opener re-navigates the main window
// with it in the query, so both have to be considered.
function readTelegramCallbackParams(): Record<string, string> | null {
  if (!isBrowser()) {
    return null;
  }

  const params = new URLSearchParams(window.location.search || "");
  const hash = (window.location.hash || "").replace(/^#/, "");
  if (hash) {
    new URLSearchParams(hash).forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  const record = Object.fromEntries(params.entries());
  return extractTelegramAuthCallbackPayload(record) ? record : null;
}

export function getTelegramAuthCallback(): { tgAuthResult: string } | null {
  const params = readTelegramCallbackParams();
  if (!params) return null;

  if (params.tgAuthResult) {
    return { tgAuthResult: params.tgAuthResult };
  }

  const payload = extractTelegramAuthCallbackPayload(params);
  return payload ? { tgAuthResult: encodeTelegramAuthResult(payload) } : null;
}

// Next.js callback pages relay popup results before attempting an exchange.
// The opener completes login/binding in the main window; returning true tells
// the callback page to skip its own exchange.
export function relayTelegramCallbackToOpener(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const opener = window.opener as Window | null;
  if (!opener || opener === window) {
    return false;
  }

  try {
    if (opener.closed) {
      return false;
    }
  } catch {
    // Cross-origin openers can throw on `closed`; treat as still open.
  }

  const payload = readTelegramCallbackParams();
  if (!payload) {
    return false;
  }

  try {
    opener.postMessage(payload, window.location.origin);
    opener.focus();
  } catch {
    // ignore opener message errors
  }

  // Defer the close so an in-flight `postMessage` is delivered before the popup
  // tears itself down.
  window.setTimeout(() => closePopup(window), 150);
  return true;
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
