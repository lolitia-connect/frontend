import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("portal amount configuration", () => {
  it("preserves main's legacy large-preset interpretation without a second conversion", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_PAYMENT_PORTAL_AMOUNTS",
      "10,25.50,10000,invalid,-3"
    );
    vi.stubEnv("NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT", "1");
    const { portalConfig } = await import("./config");
    expect(portalConfig.rechargeAmounts).toEqual([10, 25.5, 100]);
    expect(portalConfig.minCustomAmount).toBe(1);
  });

  it("falls back when configured presets are unusable without multiplying the fallback", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYMENT_PORTAL_AMOUNTS", "invalid,-1,0");
    vi.stubEnv("NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT", "invalid");
    const { portalConfig } = await import("./config");
    expect(portalConfig.rechargeAmounts).toEqual([10, 20, 50, 100]);
    expect(portalConfig.minCustomAmount).toBe(1);
  });

  it("honors custom limits above the minimum floor", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT", "250");
    const { portalConfig } = await import("./config");
    expect(portalConfig.minCustomAmount).toBe(250);
  });

  it.each([
    undefined,
    "",
    "https://backend.example.test",
  ])("preserves the Vite proxy destination when API base is %s", async (baseUrl) => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", baseUrl);
    const { default: nextConfig } = await import("../next.config");
    expect(await nextConfig.rewrites?.()).toEqual([
      {
        source: "/api/:path*",
        destination: `${baseUrl || "https://api.ppanel.dev"}/api/:path*`,
      },
    ]);
  });
});
