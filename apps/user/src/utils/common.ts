import { removeCookie, setCookie } from "@workspace/ui/lib/cookies";
import { isBrowser } from "@workspace/ui/utils/index";

export function getPlatform(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) return "android";

  // Detect iOS, including iPad/iPhone requesting desktop site
  // iOS devices have maxTouchPoints > 1, macOS typically has 0
  const isIOS =
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    (userAgent.includes("mac") && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";

  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";

  return "unknown";
}

export function differenceInDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function setAuthorization(token: string): void {
  setCookie("Authorization", token);
}

function normalizeRedirect(value?: string | null): string | undefined {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : undefined;
}

export function getRedirectUrl(options?: { consumeStored?: boolean }): string {
  if (typeof window === "undefined") return "/dashboard";

  const readRedirect = (search: string) => {
    const redirect = new URLSearchParams(search).get("redirect");
    return normalizeRedirect(redirect);
  };

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  const hashSearchIndex = hash.indexOf("?");
  const hashSearch = hashSearchIndex >= 0 ? hash.slice(hashSearchIndex) : "";
  const redirect =
    readRedirect(window.location.search) ||
    readRedirect(hashSearch) ||
    normalizeRedirect(window.sessionStorage.getItem("redirect-url")) ||
    "/dashboard";

  if (normalizeRedirect(redirect)) {
    if (options?.consumeStored !== false)
      window.sessionStorage.removeItem("redirect-url");
    return redirect;
  }

  return "/dashboard";
}

export function setRedirectUrl(value?: string) {
  if (normalizeRedirect(value)) {
    window.sessionStorage.setItem("redirect-url", value!);
  }
}

export function Logout() {
  if (!isBrowser()) return;
  removeCookie("Authorization");

  const pathname = location.pathname;
  const hash = location.hash.slice(1); // 移除 '#'

  if (
    !(
      ["", "/", "/auth", "/tos", "/privacy-policy"].includes(pathname) ||
      pathname.startsWith("/purchasing") ||
      pathname.startsWith("/oauth/")
    )
  ) {
    setRedirectUrl(pathname);
    location.href = "/#/auth";
    return;
  }

  if (
    hash &&
    !(
      ["", "/", "/auth", "/tos", "/privacy-policy"].includes(hash) ||
      hash.startsWith("/purchasing") ||
      hash.startsWith("/oauth/")
    )
  ) {
    setRedirectUrl(hash);
    location.href = "/#/auth";
  }
}
