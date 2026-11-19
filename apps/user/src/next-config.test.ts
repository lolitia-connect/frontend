import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

describe("user API proxying", () => {
  it("defines no server-side rewrites so the browser calls the backend directly", () => {
    expect(nextConfig.rewrites).toBeUndefined();
  });
});
