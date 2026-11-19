import type { IconifyIcon } from "@iconify/react";

const iconGroupLoaders = {
  logos: () => import("./icons/logos"),
  lucide: () => import("./icons/lucide"),
  mdi: () => import("./icons/mdi"),
  "simple-icons": () => import("./icons/simple-icons"),
  tabler: () => import("./icons/tabler"),
  uil: () => import("./icons/uil"),
} satisfies Record<
  string,
  () => Promise<{ icons: Readonly<Record<string, IconifyIcon>> }>
>;

/**
 * `flat-color-icons` was removed from this allowlist (and from the dependency
 * list): it is a multicolour set, so every icon it rendered ignored the
 * theme-driven `color` applied by the sidebar and showed up as a random splash
 * of blue/orange/green against the pink brand. Nav entries now use the
 * single-tone `uil` line set instead.
 */
const bundledIconNames = new Set([
  "logos:facebook",
  "logos:github",
  "logos:google",
  "logos:google-icon",
  "logos:mailgun-icon",
  "logos:telegram",
  "lucide:chevron-right",
  "mdi:access-time",
  "mdi:account",
  "mdi:account-multiple-plus-outline",
  "mdi:account-plus-outline",
  "mdi:apple",
  "mdi:cancel",
  "mdi:chevron-down",
  "mdi:chevron-right",
  "mdi:clock-time-eight",
  "mdi:cog",
  "mdi:content-copy",
  "mdi:currency-usd",
  "mdi:database-plus",
  "mdi:delete-sweep",
  "mdi:devices",
  "mdi:dice-multiple",
  "mdi:download",
  "mdi:email-multiple",
  "mdi:email-outline",
  "mdi:email-send",
  "mdi:eye",
  "mdi:facebook",
  "mdi:file-document-outline",
  "mdi:gift",
  "mdi:github",
  "mdi:google",
  "mdi:help-circle-outline",
  "mdi:key",
  "mdi:loading",
  "mdi:message-text-clock-outline",
  "mdi:microsoft-windows",
  "mdi:open-in-new",
  "mdi:phone-settings",
  "mdi:resistor-nodes",
  "mdi:server",
  "mdi:shield-account-outline",
  "mdi:shield-check-outline",
  "mdi:success-circle-outline",
  "mdi:telegram",
  "mdi:telephone",
  "mdi:tune-variant",
  "mdi:web",
  "simple-icons:harmonyos",
  "simple-icons:ios",
  "tabler:external-link",
  "uil:android",
  "uil:angle-right",
  "uil:apple",
  "uil:bell",
  "uil:book-alt",
  "uil:bookmark",
  "uil:chart-bar",
  "uil:chart-growth",
  "uil:chart-line",
  "uil:check",
  "uil:clipboard-notes",
  "uil:clock",
  "uil:cloud-data-connection",
  "uil:cog",
  "uil:comment-alt-notes",
  "uil:copy",
  "uil:credit-card",
  "uil:dashboard",
  "uil:database",
  "uil:discord",
  "uil:document",
  "uil:download-alt",
  "uil:envelope",
  "uil:exchange-alt",
  "uil:exclamation-triangle",
  "uil:exit",
  "uil:facebook",
  "uil:gift",
  "uil:github",
  "uil:image",
  "uil:image-upload",
  "uil:instagram",
  "uil:key-skeleton",
  "uil:linkedin",
  "uil:linux",
  "uil:loading",
  "uil:lock",
  "uil:map-marker",
  "uil:megaphone",
  "uil:message",
  "uil:mobile-android",
  "uil:money-bill",
  "uil:navigator",
  "uil:notes",
  "uil:object-group",
  "uil:processor",
  "uil:refresh",
  "uil:server",
  "uil:server-network",
  "uil:servers",
  "uil:shield-check",
  "uil:shield-exclamation",
  "uil:shop",
  "uil:sign-in-alt",
  "uil:sync",
  "uil:tachometer-fast",
  "uil:tag-alt",
  "uil:telegram",
  "uil:twitter",
  "uil:upload",
  "uil:user",
  "uil:user-plus",
  "uil:users-alt",
  "uil:wallet",
]);

export function isBundledIcon(name: string) {
  return bundledIconNames.has(name);
}

export async function loadBundledIcon(name: string) {
  if (!isBundledIcon(name)) {
    return;
  }

  const [prefix, iconName] = name.split(":");
  const loader = iconGroupLoaders[prefix as keyof typeof iconGroupLoaders];
  const module = await loader();
  return module.icons[iconName ?? ""];
}
