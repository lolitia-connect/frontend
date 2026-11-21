import { describe, expect, it } from "vitest";
import { sentryOptions } from "./sentry-options";

const dsn = "https://public@example.test/123";

const { beforeSend, beforeSendSpan } = sentryOptions(
  dsn,
  "production",
  undefined
);

describe("Sentry reporting", () => {
  it.each([
    "development",
    "test",
  ])("disables transport and tracing in %s even with a DSN", (environment) => {
    const options = sentryOptions(dsn, environment, undefined);

    expect(options.enabled).toBe(false);
    expect(options.dsn).toBeUndefined();
    expect(options.tracesSampleRate).toBe(0);
  });

  it("keeps reporting active in production when a DSN is configured", () => {
    expect(sentryOptions(dsn, "production", undefined)).toMatchObject({
      dsn,
      enabled: true,
      tracesSampleRate: 0.1,
    });
    expect(sentryOptions(undefined, "production", undefined).enabled).toBe(
      false
    );
  });
});

describe("Sentry telemetry redaction", () => {
  it("removes request data, exception messages and source lines while retaining useful frames", async () => {
    const error = await beforeSend(
      {
        type: undefined,
        request: { url: "https://example.test/path?token=secret" },
        user: { email: "example@example.test" },
        exception: {
          values: [
            {
              type: "TypeError",
              value: "private subscription link",
              stacktrace: {
                frames: [
                  {
                    filename: "C:\\Users\\operator\\project\\route.ts",
                    function: "GET",
                    lineno: 42,
                    context_line: "internal source",
                    vars: { key: "private key" },
                  },
                ],
              },
            },
          ],
        },
      },
      {}
    );

    expect(error?.request).toBeUndefined();
    expect(error?.user).toBeUndefined();
    expect(error?.exception?.values).toEqual([
      {
        type: "TypeError",
        value: "Unhandled application error",
        stacktrace: {
          frames: [{ filename: "route.ts", function: "GET", lineno: 42 }],
        },
      },
    ]);
  });

  it("preserves matching browser and server Debug IDs without leaking URL or host paths", async () => {
    const browserFile =
      "https://user.example.test/_next/static/chunks/abc123.js?token=private";
    const serverFile =
      "C:\\Users\\operator\\.next\\server\\chunks\\ssr\\[root]__abc.js";
    const externalFile = "https://example.test/private/script.js?token=private";
    const id = "12345678-abcd-4321-abcd-123456789abc";
    const result = await beforeSend(
      {
        type: undefined,
        debug_meta: {
          images: [browserFile, serverFile, externalFile].map((code_file) => ({
            type: "sourcemap",
            code_file,
            debug_id: id,
          })),
        },
        exception: {
          values: [
            {
              stacktrace: {
                frames: [
                  { filename: browserFile, lineno: 3, colno: 41 },
                  { filename: "page.js", abs_path: serverFile, lineno: 12 },
                  { filename: externalFile },
                  { filename: "app:///_next/static/chunks/unmapped.js" },
                ],
              },
            },
          ],
        },
      },
      {}
    );

    const browserPath = "app:///_next/static/chunks/abc123.js";
    const serverPath = "app:///_next/server/chunks/ssr/[root]__abc.js";
    expect(result?.debug_meta?.images).toEqual(
      [browserPath, serverPath].map((code_file) => ({
        type: "sourcemap",
        code_file,
        debug_id: id,
      }))
    );
    expect(result?.exception?.values?.[0]?.stacktrace?.frames).toMatchObject([
      { filename: browserPath, abs_path: browserPath, lineno: 3, colno: 41 },
      { filename: serverPath, abs_path: serverPath, lineno: 12 },
      { filename: "script.js" },
      { filename: "unmapped.js" },
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /private|operator|example\.test/
    );
  });

  it("retains trace timing but removes request identifiers from spans", () => {
    const span = beforeSendSpan({
      attributes: {
        "sentry.op": "http.client",
        "http.response.status_code": 502,
        "url.full": "https://example.test/subscription/private-id",
      },
      is_segment: false,
      name: "GET /subscription/private-id",
      span_id: "span",
      trace_id: "trace",
      status: "error",
      start_timestamp: 1,
      end_timestamp: 2,
    });

    expect(span).toMatchObject({
      name: "http.client",
      trace_id: "trace",
      start_timestamp: 1,
      end_timestamp: 2,
      attributes: { "http.response.status_code": 502 },
    });
    expect(JSON.stringify(span)).not.toContain("private-id");
  });
});
