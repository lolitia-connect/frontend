import type { Options, StackFrame } from "@sentry/core";

const safeErrorTypes = new Set([
  "Error",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);

function scrubFrame(frame: StackFrame): StackFrame {
  const filename = frame.filename?.split(/[?#]/, 1)[0]?.split(/[/\\]/).pop();
  return {
    colno: frame.colno,
    filename,
    function: frame.function,
    in_app: frame.in_app,
    lineno: frame.lineno,
  };
}

export function sentryOptions(
  dsn: string | undefined,
  environment: string,
  release: string | undefined
): Options & Required<Pick<Options, "beforeSend" | "beforeSendSpan">> {
  return {
    dsn,
    enabled: Boolean(dsn),
    environment,
    release,
    tracesSampleRate: environment === "development" ? 1 : 0.1,
    tracePropagationTargets: [],
    maxBreadcrumbs: 0,
    sendClientReports: false,
    dataCollection: {
      cookies: false,
      frameContextLines: 0,
      httpBodies: [],
      httpHeaders: false,
      stackFrameVariables: false,
      urlQueryParams: false,
      userInfo: false,
    },
    beforeSend(event) {
      const trace = event.contexts?.trace;
      return {
        type: event.type,
        contexts: trace && {
          trace: { span_id: trace.span_id, trace_id: trace.trace_id },
        },
        environment: event.environment,
        event_id: event.event_id,
        exception: event.exception && {
          values: event.exception.values?.map((exception) => ({
            stacktrace: exception.stacktrace && {
              frames: exception.stacktrace.frames?.map(scrubFrame),
            },
            type: safeErrorTypes.has(exception.type ?? "")
              ? exception.type
              : "Error",
            value: "Unhandled application error",
          })),
        },
        level: event.level,
        message: event.message ? "Application error" : undefined,
        platform: event.platform,
        release: event.release,
        sdk: event.sdk,
        timestamp: event.timestamp,
      };
    },
    beforeSendSpan(span) {
      const operation = span.attributes["sentry.op"];
      const statusCode = span.attributes["http.response.status_code"];
      return {
        trace_id: span.trace_id,
        parent_span_id: span.parent_span_id,
        span_id: span.span_id,
        name: typeof operation === "string" ? operation : "operation",
        start_timestamp: span.start_timestamp,
        end_timestamp: span.end_timestamp,
        status: span.status,
        is_segment: span.is_segment,
        attributes: {
          "sentry.op": operation,
          "http.response.status_code": statusCode,
        },
      };
    },
    beforeSendLog(log) {
      return { level: log.level, message: "Application log" };
    },
  };
}
