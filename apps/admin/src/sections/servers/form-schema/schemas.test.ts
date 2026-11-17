import { describe, expect, it } from "vitest";
import { MIERU_MULTIPLEX } from "./constants";
import { getProtocolDefaultConfig } from "./defaults";
import { formSchema, protocolApiScheme } from "./schemas";
import { getProtocolFormValues, preserveUneditableProtocols } from "./values";

const validServer = {
  name: "Hysteria2 node",
  address: "node.example.com",
  protocols: [
    {
      type: "hysteria2",
      enable: true,
      port: 40_000,
      security: "tls",
      sni: "node.example.com",
      cert_mode: "self",
      allow_insecure: true,
      hop_ports: "40000-60000",
      hop_interval: 10,
      up_mbps: 300,
      down_mbps: 300,
      obfs: "none",
    },
  ],
};

describe("Hysteria2 protocol form schema", () => {
  it("keeps client-side TLS and port-hopping options", () => {
    const result = formSchema.parse(validServer);
    expect(result.protocols[0]).toMatchObject({
      allow_insecure: true,
      hop_ports: "40000-60000",
      hop_interval: 10,
    });
  });

  it("requires hop ports and hop interval to be configured together", () => {
    const result = formSchema.safeParse({
      ...validServer,
      protocols: [
        {
          ...validServer.protocols[0],
          hop_ports: "",
          hop_interval: 10,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["protocols", 0, "hop_ports"] }),
        ])
      );
    }
  });

  it("rejects invalid Hysteria2 hop-port ranges", () => {
    const result = formSchema.safeParse({
      ...validServer,
      protocols: [
        {
          ...validServer.protocols[0],
          hop_ports: "40000-70000",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ["protocols", 0, "hop_ports"] }),
        ])
      );
    }
  });

  it("accepts comma-separated Hysteria2 ports and single ports", () => {
    const result = formSchema.safeParse({
      ...validServer,
      protocols: [
        {
          ...validServer.protocols[0],
          hop_ports: "40000, 40002-40005",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe("TLS protocol form schemas", () => {
  it.each([
    "shadowsocks",
    "vmess",
    "vless",
    "trojan",
    "hysteria2",
    "tuic",
    "anytls",
    "naive",
  ] as const)("keeps allow_insecure for %s", (type) => {
    const result = formSchema.parse({
      name: `${type} node`,
      address: "node.example.com",
      protocols: [{ type, allow_insecure: true }],
    });

    expect(result.protocols[0]).toMatchObject({
      type,
      allow_insecure: true,
    });
  });
});

describe("client fingerprint protocol fields", () => {
  it.each([
    "vmess",
    "vless",
    "trojan",
    "anytls",
  ] as const)("defaults %s to the Chrome fingerprint", (type) => {
    expect(getProtocolDefaultConfig(type)).toMatchObject({
      fingerprint: "chrome",
    });
  });

  it.each([
    "vmess",
    "vless",
    "trojan",
    "anytls",
  ] as const)("keeps the selected fingerprint for %s", (type) => {
    const result = formSchema.parse({
      name: `${type} node`,
      address: "node.example.com",
      protocols: [{ type, fingerprint: "firefox" }],
    });

    expect(result.protocols[0]).toMatchObject({
      type,
      fingerprint: "firefox",
    });
  });
});

describe("local protocol compatibility", () => {
  it("preserves separate identities, disabled drafts and hidden fields", () => {
    const protocols = ["1", "2"].map((id) => ({
      ...getProtocolDefaultConfig("vless"),
      id,
      name: `Inbound ${id}`,
      cert_pin_sha256: `pin-${id}`,
      future_option: { secret: id },
      transport: "grpc",
      reality_private_key: `key-${id}`,
    }));
    expect(
      formSchema.parse({ name: "server", address: "example.com", protocols })
        .protocols
    ).toEqual(protocols);
  });

  it("uses NW3 defaults", () => {
    expect(
      protocolApiScheme.parse({ type: "nowhere", enable: false })
    ).toMatchObject({
      version: 3,
      network: "mix",
      alpn: ["nw3"],
      obfs: "morph",
      security: "tls",
    });
  });

  it("migrates each NW1 instance without losing identities, pins or unknown fields", () => {
    const existing = ["1", "2"].map((id) => ({
      type: "nowhere",
      id,
      version: 1,
      alpn: ["now/1"],
      network: "tcp,udp",
      allow_insecure: true,
      secret: id,
      cert_pin_sha256: `pin-${id}`,
    }));
    const result = getProtocolFormValues(existing);
    expect(result).toHaveLength(2);
    for (const [index, protocol] of result.entries())
      expect(protocol).toMatchObject({
        ...existing[index],
        version: 3,
        alpn: ["nw3"],
        network: "mix",
        obfs: "morph",
        allow_insecure: false,
      });
  });

  it("retains unknown protocols and disabled invalid drafts on save", () => {
    const unknown = { type: "future", enable: true, secret: "opaque" };
    const draft = {
      type: "vless",
      enable: false,
      security: "future",
      private_key: "keep",
    };
    const values = formSchema.parse({
      name: "server",
      address: "example.com",
      protocols: [draft],
    });
    expect(
      preserveUneditableProtocols(values.protocols, [draft, unknown])
    ).toEqual([draft, unknown]);
  });

  it.each([
    { port: 0, sni: "example.com" },
    { port: 443, sni: " " },
    { port: 443, sni: "example.com", allow_insecure: true },
  ])("rejects invalid enabled NW3 configuration %j", (options) => {
    expect(
      protocolApiScheme.safeParse({
        ...getProtocolDefaultConfig("nowhere"),
        enable: true,
        ...options,
      }).success
    ).toBe(false);
  });

  it.each([
    { type: "nowhere", version: 2 },
    { type: "nowhere", alpn: ["h2", "now/1"] },
    { type: "shadowsocksr", ssr_protocol: "origin" },
    {
      type: "shadowsocksr",
      enable: true,
      port: 8443,
      cipher: "aes-256-cfb",
      server_key: "secret",
      ssr_protocol: "auth_chain_a",
      transport: "udp",
      obfs: "http_simple",
    },
  ])("rejects incompatible protocol options: %j", (protocol) => {
    expect(protocolApiScheme.safeParse(protocol).success).toBe(false);
  });

  // The mieru multiplex select offers MIERU_MULTIPLEX values, every other
  // protocol offers multiplexLevels. The schema must accept whatever the
  // select can produce, or the form becomes unsaveable once it is touched.
  it.each([
    ...MIERU_MULTIPLEX,
  ])("accepts the mieru multiplex option the form offers: %s", (multiplex) => {
    const parsed = protocolApiScheme.safeParse({
      ...getProtocolDefaultConfig("mieru"),
      enable: true,
      port: 443,
      transport: "tcp",
      multiplex,
    });
    expect(parsed.success).toBe(true);
  });

  it("normalizes every stored mieru multiplex spelling to the select values", () => {
    const cases: [unknown, string][] = [
      ["", "MULTIPLEXING_LOW"],
      ["none", "MULTIPLEXING_OFF"],
      ["off", "MULTIPLEXING_OFF"],
      ["low", "MULTIPLEXING_LOW"],
      ["middle", "MULTIPLEXING_MIDDLE"],
      ["medium", "MULTIPLEXING_MIDDLE"],
      ["high", "MULTIPLEXING_HIGH"],
      ["MULTIPLEXING_HIGH", "MULTIPLEXING_HIGH"],
    ];
    for (const [stored, expected] of cases) {
      const [values] = getProtocolFormValues([
        { type: "mieru", id: "1", multiplex: stored },
      ]);
      expect(values.multiplex).toBe(expected);
    }
  });

  it("keeps a stored mieru multiplex value the schema would otherwise reject", () => {
    const [values] = getProtocolFormValues([
      { type: "mieru", id: "1", multiplex: "MULTIPLEXING_LOW" },
    ]);
    expect(
      protocolApiScheme.safeParse({
        ...values,
        enable: true,
        port: 443,
        transport: "tcp",
      }).success
    ).toBe(true);
  });
});
