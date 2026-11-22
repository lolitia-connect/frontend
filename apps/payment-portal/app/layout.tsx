import { BrandFontLinks } from "@workspace/ui/lib/brand-font-links";
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
        <BrandFontLinks />
      </head>
      <body className="bg-background text-foreground">
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
