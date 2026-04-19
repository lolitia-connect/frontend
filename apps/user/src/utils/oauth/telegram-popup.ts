import { isBrowser } from "@workspace/ui/utils/index";

export type TelegramAuthMode = "login" | "bind";

const TELEGRAM_WIDGET_SCRIPT_SRC = "https://telegram.org/js/telegram-widget.js?23";

let telegramWidgetScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        auth: (
          options: {
            bot_id: number;
            request_access?: string;
          },
          callback: (user: unknown) => void
        ) => void;
      };
    };
  }
}

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

function ensureTelegramWidgetLoaded(): Promise<void> {
  if (!isBrowser()) {
    return Promise.reject(new Error("Telegram widget can only be loaded in browser"));
  }

  if (typeof window.Telegram?.Login?.auth === "function") {
    return Promise.resolve();
  }

  if (telegramWidgetScriptPromise) {
    return telegramWidgetScriptPromise;
  }

  telegramWidgetScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src=\"${TELEGRAM_WIDGET_SCRIPT_SRC}\"]`
    );

    const handleLoad = () => {
      if (typeof window.Telegram?.Login?.auth === "function") {
        resolve();
        return;
      }

      reject(new Error("Telegram widget loaded but Login.auth is unavailable"));
    };

    const handleError = () => {
      telegramWidgetScriptPromise = null;
      reject(new Error("Failed to load Telegram widget script"));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });

      if (typeof window.Telegram?.Login?.auth === "function") {
        handleLoad();
      }

      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = TELEGRAM_WIDGET_SCRIPT_SRC;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return telegramWidgetScriptPromise;
}

function parseTelegramRedirectConfig(redirectUrl: string) {
  const url = new URL(redirectUrl);
  const botId = Number(url.searchParams.get("bot_id"));

  if (!Number.isFinite(botId)) {
    throw new Error("Telegram redirect url does not include a valid bot_id");
  }

  const requestAccess = url.searchParams.get("request_access") || undefined;

  return {
    botId,
    requestAccess,
  };
}

export async function requestTelegramAuthCallback(redirectUrl: string) {
  await ensureTelegramWidgetLoaded();

  const { botId, requestAccess } = parseTelegramRedirectConfig(redirectUrl);

  return new Promise<Record<string, string>>((resolve, reject) => {
    const telegramLogin = window.Telegram?.Login?.auth;

    if (typeof telegramLogin !== "function") {
      reject(new Error("Telegram Login.auth is unavailable"));
      return;
    }

    telegramLogin(
      {
        bot_id: botId,
        ...(requestAccess ? { request_access: requestAccess } : {}),
      },
      (user) => {
        const payload = extractTelegramAuthCallbackPayload(user);

        if (!payload) {
          reject(new Error("Telegram auth callback did not return valid payload"));
          return;
        }

        resolve(payload);
      }
    );
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

  const path = mode === "bind" ? "/bind/telegram" : "/oauth/telegram";
  const search = new URLSearchParams(payload).toString();
  window.location.hash = search ? `${path}?${search}` : path;
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
