import { protocols } from "./constants";
import { getProtocolDefaultConfig } from "./defaults";
import type { ProtocolType } from "./types";

type ProtocolValue = Record<string, any>;

// Mieru stores its multiplex level under the panel's own enum names
// (MULTIPLEXING_LOW…), while every other protocol uses multiplexLevels
// (none/h2mux/smux/yamux). A stored value from either vocabulary — or the
// lowercase "off/low/middle/high" aliases the panel comment documents — is
// folded back into the mieru enum so the select never shows an unselectable
// value that the schema would then reject on save.
export function normalizeMultiplexValue(
  protocolType: ProtocolType,
  value: unknown,
  fallback: unknown
) {
  const raw = String(value || fallback || "").trim();
  if (protocolType !== "mieru") {
    return raw || "none";
  }

  switch (raw.toUpperCase()) {
    case "NONE":
    case "OFF":
    case "MULTIPLEXING_OFF":
      return "MULTIPLEXING_OFF";
    case "":
    case "LOW":
    case "MULTIPLEXING_LOW":
      return "MULTIPLEXING_LOW";
    case "MIDDLE":
    case "MEDIUM":
    case "MULTIPLEXING_MIDDLE":
      return "MULTIPLEXING_MIDDLE";
    case "HIGH":
    case "MULTIPLEXING_HIGH":
      return "MULTIPLEXING_HIGH";
    default:
      return raw;
  }
}

export function getProtocolFormValues(existing: readonly ProtocolValue[] = []) {
  return existing
    .filter((protocol) =>
      (protocols as readonly string[]).includes(protocol.type)
    )
    .map((protocol) => {
      const defaultConfig = getProtocolDefaultConfig(
        protocol.type as ProtocolType
      );
      const merged = {
        ...defaultConfig,
        ...protocol,
      };
      // Only protocols that carry a multiplex setting are normalized, so the
      // coercion never adds a `multiplex` key to a payload that had none.
      if ("multiplex" in defaultConfig || protocol.multiplex != null) {
        merged.multiplex = normalizeMultiplexValue(
          protocol.type as ProtocolType,
          protocol.multiplex,
          defaultConfig.multiplex
        );
      }
      if (protocol.transport === "websocket") merged.transport = "ws";
      if (protocol.type === "nowhere") {
        const version = Number(protocol.version || 0);
        if (version === 0 || version === 1) {
          merged.version = 3;
          merged.alpn = ["nw3"];
        }
        const network = String(protocol.network || "mix")
          .toLowerCase()
          .replaceAll(" ", "");
        merged.network = [
          "mixed",
          "both",
          "tcp,udp",
          "udp,tcp",
          "tcp+udp",
          "udp+tcp",
        ].includes(network)
          ? "mix"
          : network === "quic"
            ? "udp"
            : network;
        merged.obfs = String(protocol.obfs || "morph")
          .trim()
          .toLowerCase();
        merged.security = "tls";
        merged.allow_insecure = false;
        if (!merged.cert_mode || merged.cert_mode === "none")
          merged.cert_mode = "self";
      }
      return merged;
    });
}

export function preserveUneditableProtocols<
  Protocol extends ProtocolValue,
  Existing extends ProtocolValue = Protocol,
>(edited: Protocol[], existing: readonly Existing[] = []) {
  return [
    ...edited,
    ...existing.filter(
      (protocol) => !(protocols as readonly string[]).includes(protocol.type)
    ),
  ];
}
