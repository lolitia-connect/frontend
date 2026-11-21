import { describe, expect, it } from "vitest";
import { sentryBuildOptions } from "./sentry-build-options";

const project = "lolitia-connect-user";
const production = {
  COMMIT_REF: "commit-sha",
  CONTEXT: "production",
  NEXT_PUBLIC_SENTRY_DSN: "https://public@example.test/123",
  NODE_ENV: "production",
  SENTRY_AUTH_TOKEN: "test-upload-token",
};

describe("Sentry source map uploads", () => {
  it("routes production uploads to the app project and removes browser maps", () => {
    expect(sentryBuildOptions(project, production)).toMatchObject({
      authToken: production.SENTRY_AUTH_TOKEN,
      org: "yumian-pte-ltd",
      project,
      release: { name: production.COMMIT_REF },
      sourcemaps: { disable: false, deleteSourcemapsAfterUpload: true },
    });
  });

  it.each([
    { SENTRY_AUTH_TOKEN: undefined },
    { NEXT_PUBLIC_SENTRY_DSN: undefined },
    { CONTEXT: "deploy-preview" },
    { NODE_ENV: "development" },
  ])("disables map generation and uploads with %j", (override) => {
    const options = sentryBuildOptions(project, { ...production, ...override });
    expect(options.authToken).toBeUndefined();
    expect(options.sourcemaps.disable).toBe(true);
  });

  it("blocks uploads before test credentials can enter build artifacts", () => {
    expect(() =>
      sentryBuildOptions(project, {
        ...production,
        NEXT_PUBLIC_USER_PASSWORD: "test-password",
      })
    ).toThrow("Remove the development default login credentials");
  });
});
