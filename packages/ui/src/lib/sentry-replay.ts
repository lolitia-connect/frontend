import type {
  BaseTransportOptions,
  Envelope,
  Integration,
  Options,
  ReplayEnvelope,
  Transport,
} from "@sentry/core";

const layoutAttributes = new Set([
  "class",
  "colspan",
  "dir",
  "disabled",
  "height",
  "hidden",
  "role",
  "rowspan",
  "rr_height",
  "rr_width",
  "type",
  "width",
]);
const maskedText = /^[*\s]*$/;
const removedUrl = "about:blank";

type ReplayFrame = {
  data: { tag: string; payload: unknown };
};

function isSafeCustomFrame({ data }: ReplayFrame) {
  return (
    data.tag === "options" ||
    (data.tag === "breadcrumb" &&
      typeof data.payload === "object" &&
      data.payload !== null &&
      "category" in data.payload &&
      data.payload.category === "replay.hydrate-error")
  );
}

const cssResourceUrl =
  /\burl\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)'"\s]*)\s*\)/gi;

function scrubRecordingAttributes(attributes: Record<string, unknown>) {
  const result = Object.fromEntries(
    Object.entries(attributes).filter(
      ([name, entry]) =>
        layoutAttributes.has(name) ||
        (name === "data-theme" &&
          (entry === "dark" || entry === "light" || entry === null)) ||
        (name === "value" &&
          typeof entry === "string" &&
          maskedText.test(entry))
    )
  );
  // rrweb replaces a loaded link's href and rel with its CSSOM text, both
  // in the snapshot and in the attribute mutation for a late-loading sheet.
  const css = attributes._cssText;
  if (
    attributes["data-precedence"] === "next" &&
    attributes.rel === null &&
    typeof css === "string" &&
    !/@import\b/i.test(css)
  ) {
    result._cssText = css.replace(cssResourceUrl, 'url("about:blank")');
  }
  return result;
}

function scrubRecordingValue(key: string, value: unknown): unknown {
  if (key === "attributes" && value && !Array.isArray(value)) {
    return scrubRecordingAttributes(value as Record<string, unknown>);
  }
  if (key === "href" || key === "url") return removedUrl;
  if (
    ["textContent", "text", "value"].includes(key) &&
    typeof value === "string"
  ) {
    return maskedText.test(value) ? value : "";
  }
  return value;
}

function isReplayEnvelope(envelope: Envelope): envelope is ReplayEnvelope {
  return envelope[1][0]?.[0].type === "replay_event";
}

export function scrubReplayEnvelope(envelope: Envelope): Envelope | null {
  if (!isReplayEnvelope(envelope)) return envelope;

  const [[eventHeader, event], [recordingHeader, payload]] = envelope[1];
  if (typeof payload !== "string") return null;

  // The SDK prefixes its uncompressed rrweb JSON array with the segment header.
  const separator = payload.indexOf("\n");
  if (separator === -1) return null;
  try {
    const frames: unknown = JSON.parse(
      payload.slice(separator + 1),
      scrubRecordingValue
    );
    if (!Array.isArray(frames)) return null;
    const recording = JSON.stringify(
      frames.filter((frame) => {
        // rrweb's DOM snapshots and viewport/mouse/scroll/input updates. Drop
        // dynamic CSS rule edits, canvas, fonts, and arbitrary plugin data.
        if (frame.type === 3)
          return [0, 1, 2, 3, 4, 5, 6].includes(frame.data.source);
        return (
          (frame.type >= 0 && frame.type <= 4) ||
          (frame.type === 5 && isSafeCustomFrame(frame))
        );
      })
    );
    const body = `${JSON.stringify({ segment_id: event.segment_id })}\n${recording}`;
    return [
      envelope[0],
      [
        [
          eventHeader,
          {
            type: event.type,
            environment: event.environment,
            event_id: event.event_id,
            release: event.release,
            platform: event.platform,
            sdk: event.sdk,
            timestamp: event.timestamp,
            replay_start_timestamp: event.replay_start_timestamp,
            replay_id: event.replay_id,
            replay_type: event.replay_type,
            segment_id: event.segment_id,
            error_ids: event.error_ids,
            trace_ids: event.trace_ids,
            segment_names: [],
            urls: [],
          },
        ],
        [
          { ...recordingHeader, length: new TextEncoder().encode(body).length },
          body,
        ],
      ],
    ];
  } catch {
    return null;
  }
}

type ReplayFactory = (options: {
  block: string[];
  blockAllMedia: boolean;
  maskAllInputs: boolean;
  maskAllText: boolean;
  networkCaptureBodies: boolean;
  useCompression: boolean;
  beforeAddRecordingEvent: <Frame extends ReplayFrame>(
    event: Frame
  ) => Frame | null;
}) => Integration;

export function sentryBrowserOptions(
  options: Options,
  replayIntegration: ReplayFactory,
  makeTransport: (options: BaseTransportOptions) => Transport
) {
  if (!options.enabled) return options;

  return {
    ...options,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    integrations: [
      replayIntegration({
        block: [
          "canvas",
          "iframe",
          "#custom_html",
          // Only Next's local build assets should supply embedded replay CSS.
          'link[data-precedence="next"]:not([href^="/_next/static/chunks/"]):not([href^="/_next/static/css/"])',
        ],
        blockAllMedia: true,
        maskAllInputs: true,
        maskAllText: true,
        networkCaptureBodies: false,
        useCompression: false,
        beforeAddRecordingEvent(event) {
          return isSafeCustomFrame(event) ? event : null;
        },
      }),
    ],
    transport(transportOptions: BaseTransportOptions): Transport {
      const transport = makeTransport(transportOptions);
      return {
        ...transport,
        send(envelope) {
          const scrubbed = scrubReplayEnvelope(envelope);
          return scrubbed ? transport.send(scrubbed) : Promise.resolve({});
        },
      };
    },
  };
}
