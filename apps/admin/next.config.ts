import type { NextConfig } from "next";

/**
 * API rewrites strip the configured prefix and forward versioned routes to the backend.
 *
 * Two details are easy to get subtly wrong here, and both were:
 *
 * 1. The prefix is STRIPPED before forwarding. Vite matched
 *    `^<prefix>/v[12](?:/|$)` and then did `rewrite: path => path.slice(prefix.length)`,
 *    so the backend received `/v1/...`. Passing the prefix through in the
 *    destination instead would send `/api/v1/...` and 404 — the `.env.example`
 *    documents the prefix as supported ("Production proxies must strip this
 *    prefix before forwarding to the backend"), and the Vite proxy did exactly
 *    that in development.
 *
 * 2. The base URL falls back on an EMPTY value, not just on an unset one.
 *    Vite used `||`, and `.env.example` ships `NEXT_PUBLIC_API_BASE_URL=` (empty)
 *    as the documented "use the local backend" state. With `??` an empty string
 *    is not nullish, so the destination collapsed to a bare `/v1/...` path.
 *
 * v1 and v2 are listed separately because Next's `source` is a path pattern
 * (`:param` / `:param*`) with no regex character class, so the original `[12]`
 * has to be expressed as two entries. This also keeps `v3` from matching.
 */
const apiPrefix = (process.env.NEXT_PUBLIC_API_PREFIX ?? "").replace(
  /\/+$/,
  ""
);
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  // The shared workspace UI package ships untranspiled TS/TSX.
  transpilePackages: ["@workspace/ui"],
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  async rewrites() {
    return [1, 2].map((version) => ({
      source: `${apiPrefix}/v${version}/:path*`,
      destination: `${apiBaseUrl}/v${version}/:path*`,
    }));
  },
  allowedDevOrigins: ["100.98.240.8", "127.0.0.1"],
};

export default nextConfig;
