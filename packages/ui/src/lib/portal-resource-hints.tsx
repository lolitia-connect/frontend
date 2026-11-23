const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/+$/,
  ""
);
const apiOrigin = (() => {
  if (!/^https?:\/\//i.test(apiBase)) return;
  try {
    return new URL(apiBase).origin;
  } catch {
    return;
  }
})();

export function PortalResourceHints() {
  if (!apiOrigin) return null;
  return <link crossOrigin="anonymous" href={apiOrigin} rel="preconnect" />;
}
