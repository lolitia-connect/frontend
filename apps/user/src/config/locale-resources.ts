/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun scripts/generate-locale-resources.mjs user en-US
 *
 * Synchronous en-US resources for the fallback language. Bundling these makes
 * the server render and the client's hydration render produce identical text;
 * without them SSR falls back to inline `defaultValue` strings while the client
 * hydrates real translations, which React reports as a hydration mismatch.
 */
import affiliate from "../../public/assets/locales/en-US/affiliate.json";
import auth from "../../public/assets/locales/en-US/auth.json";
import components from "../../public/assets/locales/en-US/components.json";
import dashboard from "../../public/assets/locales/en-US/dashboard.json";
import document from "../../public/assets/locales/en-US/document.json";
import layout from "../../public/assets/locales/en-US/layout.json";
import main from "../../public/assets/locales/en-US/main.json";
import main_map from "../../public/assets/locales/en-US/main_map.json";
import order from "../../public/assets/locales/en-US/order.json";
import payment from "../../public/assets/locales/en-US/payment.json";
import profile from "../../public/assets/locales/en-US/profile.json";
import servers from "../../public/assets/locales/en-US/servers.json";
import subscribe from "../../public/assets/locales/en-US/subscribe.json";
import ticket from "../../public/assets/locales/en-US/ticket.json";
import traffic from "../../public/assets/locales/en-US/traffic.json";
import wallet from "../../public/assets/locales/en-US/wallet.json";

export const fallbackResources = {
  "en-US": {
    affiliate,
    auth,
    components,
    dashboard,
    document,
    layout,
    main,
    main_map,
    order,
    payment,
    profile,
    servers,
    subscribe,
    ticket,
    traffic,
    wallet,
  },
} as const;

/** Namespaces available synchronously for the fallback language. */
export const fallbackNamespaces = [
  "affiliate",
  "auth",
  "components",
  "dashboard",
  "document",
  "layout",
  "main",
  "main_map",
  "order",
  "payment",
  "profile",
  "servers",
  "subscribe",
  "ticket",
  "traffic",
  "wallet",
] as const;
