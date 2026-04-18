import { getCookie, removeCookie, setCookie } from "@workspace/ui/lib/cookies";

export function getAuthorization(): string | undefined {
  return getCookie("Authorization");
}

export function setAuthorization(token: string): void {
  setCookie("Authorization", token);
}

export function clearAuthorization(): void {
  removeCookie("Authorization");
}
