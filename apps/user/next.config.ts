import { withSentryConfig } from "@sentry/nextjs/config";
import {
  replayAssetHeaders,
  sentryBuildOptions,
} from "@workspace/ui/lib/sentry-build-options";
import type { NextConfig } from "next";

/**
 * The frontend talks to the backend DIRECTLY from the browser: the API base is
 * inlined as axios' `baseURL` (`NEXT_PUBLIC_API_BASE_URL`, see
 * `packages/ui/src/lib/request.ts`), so requests go straight to the backend
 * origin with no server-side proxy hop.
 *
 * There are intentionally NO `rewrites()` here. The old Next rewrites proxied
 * `<prefix>/v1|v2/*` through the SSR/edge runtime to the backend, which on a
 * deployed host (e.g. Netlify) fell back to a dead `http://127.0.0.1:8080` and
 * broke every request. Set `NEXT_PUBLIC_API_BASE_URL` to the backend's public
 * URL (in the Netlify UI for production, in `.env` for local development) and
 * make sure the backend allows CORS from the site origin.
 */
const nextConfig: NextConfig = {
  headers: replayAssetHeaders,
  // The shared workspace UI package ships untranspiled TS/TSX.
  transpilePackages: ["@workspace/ui"],
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  allowedDevOrigins: ["100.98.240.8", "127.0.0.1"],
};

export default withSentryConfig(
  nextConfig,
  sentryBuildOptions("lolitia-connect-user")
);
