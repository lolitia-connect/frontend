import type { DebugImage, Options, StackFrame } from "@sentry/core";

const safeErrorTypes = new Set([
  "Error",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);

const nextBuildPath =
  /\/_next\/(static\/(?:immutable\/)?chunks\/[\w%./()[\]@+~-]+\.[cm]?js)$|(?:^|\/(?:_next|\.next[^/]*)\/)(server\/[\w%./()[\]@+~-]+\.[cm]?js)$/;
const debugIdPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function buildFilePath(path?: string) {
  const cleaned = path?.split(/[?#]/, 1)[0]?.replaceAll("\\", "/");
  const match = cleaned?.match(nextBuildPath);
  const relative = match?.[1] ?? match?.[2];
  if (relative && !relative.split("/").includes("..")) {
    return `app:///_next/${relative}`;
  }
}

function scrubSourceMapImages(images: DebugImage[] = []) {
  return images.flatMap((image) => {
    if (image.type !== "sourcemap" || !debugIdPattern.test(image.debug_id)) {
      return [];
    }
    const codeFile = buildFilePath(image.code_file);
    return codeFile
      ? [{ type: image.type, debug_id: image.debug_id, code_file: codeFile }]
      : [];
  });
}

function scrubFrame(frame: StackFrame, mappedFiles: Set<string>): StackFrame {
  const buildPath =
    buildFilePath(frame.abs_path) ?? buildFilePath(frame.filename);
  const mappedPath =
    buildPath && mappedFiles.has(buildPath) ? buildPath : undefined;
  const filename = frame.filename?.split(/[?#]/, 1)[0]?.split(/[/\\]/).pop();
  return {
    ...(mappedPath && { abs_path: mappedPath }),
    colno: frame.colno,
    filename: mappedPath ?? filename,
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
  const enabled = environment === "production" && Boolean(dsn);

  return {
    dsn: enabled ? dsn : undefined,
    enabled,
    environment,
    ...(release && { release }),
    tracesSampleRate: enabled ? 0.1 : 0,
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
      const images = scrubSourceMapImages(event.debug_meta?.images);
      const mappedFiles = new Set(images.map((image) => image.code_file));
      return {
        type: event.type,
        contexts: trace && {
          trace: { span_id: trace.span_id, trace_id: trace.trace_id },
        },
        ...(images.length > 0 && { debug_meta: { images } }),
        environment: event.environment,
        event_id: event.event_id,
        exception: event.exception && {
          values: event.exception.values?.map((exception) => ({
            stacktrace: exception.stacktrace && {
              frames: exception.stacktrace.frames?.map((frame) =>
                scrubFrame(frame, mappedFiles)
              ),
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
