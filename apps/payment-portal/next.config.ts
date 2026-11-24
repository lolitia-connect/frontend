import { withSentryConfig } from "@sentry/nextjs/config";
import {
  replayAssetHeaders,
  sentryBuildOptions,
} from "@workspace/ui/lib/sentry-build-options";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: replayAssetHeaders,
  // Compile the shared workspace UI package (it ships untranspiled TS/TSX).
  transpilePackages: ["@workspace/ui"],
  // Allow an isolated build/dist dir (used by the E2E dev server) so it can run
  // alongside a regular `next dev` without clobbering its `.next` lock.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  // Keep the original Vite dev proxy behaviour (`/api` -> backend).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.ppanel.dev"}/api/:path*`,
      },
    ];
  },
  allowedDevOrigins: ["100.98.240.8", "127.0.0.1", "localhost"],
};

export default withSentryConfig(
  nextConfig,
  sentryBuildOptions("lolitia-connect-payment-portal")
);
