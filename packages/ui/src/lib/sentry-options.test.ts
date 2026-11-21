import {
  type Client,
  eventFiltersIntegration,
  type ReplayEnvelope,
} from "@sentry/core";
import { describe, expect, it, vi } from "vitest";
import { sentryOptions } from "./sentry-options";
import { scrubReplayEnvelope, sentryBrowserOptions } from "./sentry-replay";

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

describe("Netlify screenshot errors", () => {
  const deployHost = "5f3b5efaeea0a8b06442b086--example.netlify.app";
  const mismatch =
    "Minified React error #418; visit https://react.dev/errors/418?args[]=HTML";

  it.each([
    [deployHost, "HeadlessChrome/131.0.0.0", mismatch, true],
    ["lolitia.fyi", "HeadlessChrome/131.0.0.0", mismatch, false],
    [
      "deploy-preview-42--example.netlify.app",
      "HeadlessChrome/131.0.0.0",
      mismatch,
      false,
    ],
    [deployHost, "Chrome/131.0.0.0", mismatch, false],
    [
      deployHost,
      "HeadlessChrome/131.0.0.0",
      "Minified React error #423",
      false,
    ],
  ])("only drops React #418 from the screenshot signature (%s, %s, %s)", async (hostname, userAgent, value, drop) => {
    vi.stubGlobal("window", {
      location: { hostname },
      navigator: { userAgent },
    });
    try {
      const browser = sentryBrowserOptions(
        sentryOptions(dsn, "production", undefined),
        () => ({ name: "Replay" }),
        vi.fn()
      );
      const event = { exception: { values: [{ type: "Error", value }] } };
      const client = { getOptions: () => browser } as Client;
      const result = await eventFiltersIntegration().processEvent?.(
        event,
        {},
        client
      );
      expect(result).toBe(drop ? null : event);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("Sentry session replay", () => {
  it.each([
    "development",
    "test",
    "production",
  ])("only initializes replay when %s has reporting enabled", (environment) => {
    const replay = vi.fn(() => ({ name: "Replay" }));
    const transport = vi.fn();
    const options = sentryOptions(dsn, environment, undefined);
    const browser = sentryBrowserOptions(options, replay, transport);
    if (environment === "production") {
      expect(browser).toMatchObject({
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1,
      });
      expect(replay).toHaveBeenCalledOnce();
      expect(
        sentryBrowserOptions(
          sentryOptions(undefined, environment, undefined),
          replay,
          transport
        )
      ).not.toHaveProperty("integrations");
      expect(replay).toHaveBeenCalledOnce();
    } else {
      expect(replay).not.toHaveBeenCalled();
    }
  });

  it("keeps only the validated Replay link on an error", async () => {
    const replayId = "9c75a8ec25aa48b4a97c4184ddec4662";
    const result = await beforeSend(
      { tags: { replayId, private: "secret" } },
      {}
    );
    expect(result?.tags).toEqual({ replayId });
    expect(
      (await beforeSend({ tags: { replayId: "secret" } }, {}))?.tags
    ).toBeUndefined();
  });

  it("scrubs Replay metadata, DOM attributes, and raw events before transport", () => {
    const frames = [
      { type: 4, data: { href: "https://example.test/orders/secret" } },
      {
        type: 2,
        data: {
          node: {
            attributes: {
              class: "layout",
              "data-token": "secret",
              href: "secret",
              value: "****",
            },
          },
        },
      },
      { type: 3, data: { source: 8, rule: "secret" } },
      {
        type: 5,
        data: {
          tag: "breadcrumb",
          payload: { category: "console", message: "secret" },
        },
      },
      {
        type: 5,
        data: {
          tag: "breadcrumb",
          payload: {
            category: "replay.hydrate-error",
            data: { url: "secret" },
          },
        },
      },
    ];
    const envelope: ReplayEnvelope = [
      {},
      [
        [
          { type: "replay_event" },
          {
            type: "replay_event",
            replay_id: "rec",
            replay_type: "buffer",
            segment_id: 0,
            error_ids: ["err"],
            trace_ids: [],
            urls: ["secret"],
            segment_names: ["secret"],
            user: { email: "secret" },
          },
        ],
        [
          { type: "replay_recording", length: 0 },
          `{"segment_id":0}\n${JSON.stringify(frames)}`,
        ],
      ],
    ];
    const scrubbed = scrubReplayEnvelope(envelope);
    expect(scrubbed?.[1][0]?.[1]).toMatchObject({
      replay_id: "rec",
      error_ids: ["err"],
    });
    const body = scrubbed?.[1][1]?.[1];
    expect(typeof body).toBe("string");
    expect(String(body).split("\n")[1]).toBe(
      JSON.stringify([
        { type: 4, data: { href: "about:blank" } },
        {
          type: 2,
          data: { node: { attributes: { class: "layout", value: "****" } } },
        },
        {
          type: 5,
          data: {
            tag: "breadcrumb",
            payload: {
              category: "replay.hydrate-error",
              data: { url: "about:blank" },
            },
          },
        },
      ])
    );
    expect(JSON.stringify(scrubbed)).not.toContain("secret");
    envelope[1][1][1] = new Uint8Array([0, 1, 2]);
    expect(scrubReplayEnvelope(envelope)).toBeNull();
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
