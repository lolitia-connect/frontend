const sessionTokens = new Map<string, string>();

export function saveCheckoutToken(orderNo: string, token?: string) {
  if (!token) return;
  sessionTokens.set(orderNo, token);
  try {
    localStorage.setItem(orderNo, JSON.stringify({ checkout_token: token }));
  } catch {
    return;
  }
}

export function getCheckoutToken(orderNo: string): string | undefined {
  const token = sessionTokens.get(orderNo);
  if (token) return token;
  try {
    return readCheckoutToken(localStorage, orderNo);
  } catch {
    return;
  }
}

export function clearCheckoutToken(orderNo: string) {
  sessionTokens.delete(orderNo);
  try {
    localStorage.removeItem(orderNo);
  } catch {
    return;
  }
}

export function readCheckoutToken(
  storage: Pick<Storage, "getItem">,
  orderNo: string
): string | undefined {
  try {
    const value: unknown = JSON.parse(storage.getItem(orderNo) ?? "null");
    if (
      value &&
      typeof value === "object" &&
      "checkout_token" in value &&
      typeof value.checkout_token === "string" &&
      value.checkout_token.length > 0
    ) {
      return value.checkout_token;
    }
  } catch {
    return;
  }
  return;
}
