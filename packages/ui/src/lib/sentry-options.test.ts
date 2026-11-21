import { describe, expect, it } from "vitest";
import { sentryOptions } from "./sentry-options";

const { beforeSend, beforeSendSpan } = sentryOptions(
  undefined,
  "development",
  undefined
);

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
