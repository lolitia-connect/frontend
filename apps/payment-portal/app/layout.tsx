import { brandFontVariables } from "@workspace/ui/lib/brand-fonts";
import { PortalResourceHints } from "@workspace/ui/lib/portal-resource-hints";
import { ThemeScript } from "@workspace/ui/lib/theme-script";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  description:
    "Independent recharge portal powered by the existing ppanel backend APIs.",
  title: "Payment Portal",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <PortalResourceHints />
      </head>
      <body className={`${brandFontVariables} bg-background text-foreground`}>
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
