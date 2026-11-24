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
  "style",
  "data-theme",
  "data-state",
  "data-slot",
  "aria-expanded",
  "aria-selected",
  "checked",
  "selected",
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

const mediaAttributes: Record<string, string[]> = {
  audio: ["src", "controls", "loop", "muted"],
  image: ["href", "xlink:href"],
  img: ["src", "srcset", "sizes", "crossorigin"],
  link: ["href", "rel", "media", "as", "crossorigin", "_cssText"],
  source: ["src", "srcset", "sizes", "media"],
  style: ["_cssText", "media"],
  use: ["href", "xlink:href"],
  video: ["src", "poster", "controls", "loop", "muted"],
};
const svgAttributes = new Set(
  "id viewBox preserveAspectRatio d points x y x1 x2 y1 y2 cx cy r rx ry fill fill-rule fill-opacity stroke stroke-width stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset stroke-opacity clip-path clip-rule transform opacity offset stop-color stop-opacity gradientUnits gradientTransform".split(
    " "
  )
);
const renderSources = new Set([7, 8, 10, 13, 15]); // Media, CSS rules, fonts, declarations, adopted stylesheets.

type RenderNode = { tagName: string; isSVG?: boolean; renderLink?: boolean };

function domReplacer(nodes: Map<number, RenderNode>) {
  return function scrubDom(
    this: { tagName?: string; id?: number; isSVG?: boolean; isStyle?: boolean },
    key: string,
    value: unknown
  ): unknown {
    if (
      key === "attributes" &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const node: RenderNode | undefined = this.tagName
        ? { tagName: this.tagName, isSVG: this.isSVG }
        : nodes.get(this.id ?? -1);
      if (node?.tagName === "link" && "rel" in value) {
        node.renderLink =
          value.rel === null ||
          (typeof value.rel === "string" &&
            /\b(?:stylesheet|icon)\b/i.test(value.rel));
      }
      // Attribute mutations carry a node id but omit its tag, including across segments.
      if (
        this.tagName &&
        this.id !== undefined &&
        node &&
        (Object.hasOwn(mediaAttributes, node.tagName) || node.isSVG)
      )
        nodes.set(this.id, node);
      const resourceKeys =
        node && Object.hasOwn(mediaAttributes, node.tagName)
          ? mediaAttributes[node.tagName]
          : undefined;
      return Object.fromEntries(
        Object.entries(value).filter(
          ([name, entry]) =>
            layoutAttributes.has(name) ||
            (resourceKeys?.includes(name) &&
              (node?.tagName !== "link" || node.renderLink)) ||
            (node?.isSVG && svgAttributes.has(name)) ||
            (name === "value" &&
              typeof entry === "string" &&
              maskedText.test(entry))
        )
      );
    }
    if (key === "textContent" && this.isStyle) {
      if (this.id !== undefined) nodes.set(this.id, { tagName: "#style-text" });
      return value;
    }
    if (
      key === "value" &&
      this.id !== undefined &&
      nodes.get(this.id)?.tagName === "#style-text"
    )
      return value;
    if (
      ["textContent", "text", "value"].includes(key) &&
      typeof value === "string" &&
      !maskedText.test(value)
    )
      return "";
    return value;
  };
}

function isReplayEnvelope(envelope: Envelope): envelope is ReplayEnvelope {
  return envelope[1][0]?.[0].type === "replay_event";
}

export function scrubReplayEnvelope(
  envelope: Envelope,
  nodes = new Map<number, RenderNode>()
): Envelope | null {
  if (!isReplayEnvelope(envelope)) return envelope;

  const [[eventHeader, event], [recordingHeader, payload]] = envelope[1];
  if (typeof payload !== "string") return null;

  // The SDK prefixes its uncompressed rrweb JSON array with the segment header.
  const separator = payload.indexOf("\n");
  if (separator === -1) return null;
  try {
    const frames: unknown = JSON.parse(payload.slice(separator + 1));
    if (!Array.isArray(frames)) return null;
    const scrubDom = domReplacer(nodes);
    const recording = frames.flatMap((frame) => {
      if (frame.type === 2) nodes.clear();
      if (frame.type === 3 && renderSources.has(frame.data.source))
        return [JSON.stringify(frame)];
      if (
        frame.type === 2 ||
        (frame.type === 3 && [0, 1, 2, 3, 4, 5, 6].includes(frame.data.source))
      )
        return [JSON.stringify(frame, scrubDom)];
      if (
        [0, 1, 4].includes(frame.type) ||
        (frame.type === 5 && isSafeCustomFrame(frame))
      ) {
        return [
          JSON.stringify(frame, (key, value) =>
            key === "href" || key === "url" ? removedUrl : value
          ),
        ];
      }
      return [];
    });
    const body = `${JSON.stringify({ segment_id: event.segment_id })}\n[${recording.join(",")}]`;
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
  unmask: string[];
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
        block: ["canvas", "iframe", "object", "embed", "#custom_html"],
        blockAllMedia: false,
        maskAllInputs: true,
        maskAllText: true,
        unmask: ["style"],
        networkCaptureBodies: false,
        useCompression: false,
        beforeAddRecordingEvent(event) {
          return isSafeCustomFrame(event) ? event : null;
        },
      }),
    ],
    transport(transportOptions: BaseTransportOptions): Transport {
      const transport = makeTransport(transportOptions);
      const nodes = new Map<number, RenderNode>();
      let replayId: string | undefined;
      return {
        ...transport,
        send(envelope) {
          if (
            isReplayEnvelope(envelope) &&
            replayId !== envelope[1][0][1].replay_id
          ) {
            replayId = envelope[1][0][1].replay_id;
            nodes.clear();
          }
          const scrubbed = scrubReplayEnvelope(envelope, nodes);
          return scrubbed ? transport.send(scrubbed) : Promise.resolve({});
        },
      };
    },
  };
}
