// Pure constants only: this module is imported by i18n tooling that runs outside
// the bundler, so it must stay free of runtime/env-dependent code.
export const fallbackLng = "en-US";
export const supportedLngs = ["en-US", "zh-CN"];

// Shared translations needed by every screen. Dashboard shell and page
// namespaces are selected from the current hash route during bootstrap.
export const sharedI18nNamespaces = ["components"];

export const routeI18nNamespaces: Record<string, string[]> = {
  "/": ["auth"],
  "/dashboard": ["menu", "auth"],
  "/dashboard/ads": ["ads"],
  "/dashboard/announcement": ["announcement"],
  "/dashboard/auth-control": ["auth-control"],
  "/dashboard/coupon": ["coupon"],
  "/dashboard/document": ["document"],
  "/dashboard/log": ["log"],
  "/dashboard/marketing": ["marketing"],
  "/dashboard/nodes": ["nodes"],
  "/dashboard/order": ["order"],
  "/dashboard/payment": ["payment"],
  "/dashboard/product": ["product"],
  "/dashboard/servers": ["servers"],
  "/dashboard/subscribe": ["subscribe"],
  "/dashboard/system": ["system"],
  "/dashboard/ticket": ["ticket"],
  "/dashboard/user": ["user"],
  "/dashboard/withdrawal": ["withdrawal"],
  "/dashboard/plugin": ["plugin"],
  "/dashboard/group": ["group"],
  "/dashboard/redemption": ["redemption"],
};

export const exactRouteI18nNamespaces: Record<string, string[]> = {
  "/dashboard": ["dashboard", "tool"],
};

export function getInitialI18nNamespaces(pathname: string) {
  const routeNamespaces = Object.entries(routeI18nNamespaces).flatMap(
    ([route, namespaces]) => {
      const matches =
        route === "/"
          ? pathname === route
          : pathname === route || pathname.startsWith(`${route}/`);
      return matches ? namespaces : [];
    }
  );

  return [
    ...new Set([
      ...sharedI18nNamespaces,
      ...routeNamespaces,
      ...(exactRouteI18nNamespaces[pathname] ?? []),
    ]),
  ];
}
