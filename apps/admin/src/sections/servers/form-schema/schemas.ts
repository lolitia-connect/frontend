"use client";

import { z } from "zod";
import {
  CERT_MODES,
  ENCRYPTION_MODES,
  ENCRYPTION_RTT,
  ENCRYPTION_TYPES,
  FLOWS,
  MIERU_MULTIPLEX,
  SECURITY,
  SS_CIPHERS,
  SSR_CIPHERS,
  SSR_OBFS,
  SSR_PROTOCOLS,
  TRANSPORTS,
  TUIC_CONGESTION,
  TUIC_UDP_RELAY_MODES,
  XHTTP_MODES,
} from "./constants";

const nullableString = z.string().nullish();
const nullableBool = z.boolean().nullish();
const nullablePort = z.number().int().min(0).max(65_535).nullish();
const nullableRatio = z.number().min(0).nullish();

const ss = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("shadowsocks"),
  enable: nullableBool,
  port: nullablePort,
  cipher: z.enum(SS_CIPHERS).nullish(),
  server_key: nullableString,
  obfs: z.enum(["none", "http", "tls"] as const).nullish(),
  obfs_host: nullableString,
  obfs_path: nullableString,
  uot: nullableBool,
  uot_version: z.number().int().min(1).max(2).nullish(),
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
});

const vmess = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("vmess"),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.vmess).nullish(),
  security: z.enum(SECURITY.vmess).nullish(),
  path: nullableString,
  service_name: nullableString,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});

const vless = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("vless"),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.vless).nullish(),
  security: z.enum(SECURITY.vless).nullish(),
  path: nullableString,
  service_name: nullableString,
  flow: z.enum(FLOWS.vless).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  reality_server_addr: nullableString,
  reality_server_port: nullablePort,
  reality_private_key: nullableString,
  reality_public_key: nullableString,
  reality_short_id: nullableString,
  xhttp_mode: z.enum(XHTTP_MODES).nullish(),
  xhttp_extra: nullableString,
  encryption: z.enum(ENCRYPTION_TYPES).nullish(),
  encryption_mode: z.enum(ENCRYPTION_MODES).nullish(),
  encryption_rtt: z.enum(ENCRYPTION_RTT).nullish(),
  encryption_ticket: nullableString,
  encryption_server_padding: nullableString,
  encryption_private_key: nullableString,
  encryption_client_padding: nullableString,
  encryption_password: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});

const trojan = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("trojan"),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.trojan).nullish(),
  security: z.enum(SECURITY.trojan).nullish(),
  path: nullableString,
  service_name: nullableString,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});

const hysteria = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.enum(["hysteria", "hysteria2"]),
  enable: nullableBool,
  hop_ports: nullableString,
  hop_interval: z.number().nullish(),
  obfs_password: nullableString,
  obfs: z.enum(["none", "salamander"] as const).nullish(),
  port: nullablePort,
  security: z.enum(SECURITY.hysteria).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  up_mbps: z.number().nullish(),
  down_mbps: z.number().nullish(),
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});

const tuic = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("tuic"),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  disable_sni: z.boolean().nullish(),
  reduce_rtt: z.boolean().nullish(),
  udp_relay_mode: z.enum(TUIC_UDP_RELAY_MODES).nullish(),
  congestion_controller: z.enum(TUIC_CONGESTION).nullish(),
  security: z.enum(SECURITY.tuic).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});

const anytls = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("anytls"),
  enable: nullableBool,
  port: nullablePort,
  security: z.enum(SECURITY.anytls).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  padding_scheme: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
  reality_server_addr: nullableString,
  reality_server_port: nullablePort,
  reality_private_key: nullableString,
  reality_public_key: nullableString,
  reality_short_id: nullableString,
});
const socks = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("socks"),
  enable: nullableBool,
  port: nullablePort,
});
const naive = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("naive"),
  enable: nullableBool,
  port: nullablePort,
  security: z.enum(SECURITY.naive).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});
const http = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("http"),
  enable: nullableBool,
  port: nullablePort,
  security: z.enum(SECURITY.http).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
  ech_enable: z.boolean().nullish(),
  ech_server_name: nullableString,
});
const mieru = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  ratio: nullableRatio,
  type: z.literal("mieru"),
  enable: nullableBool,
  port: nullablePort,
  multiplex: z.enum(MIERU_MULTIPLEX).nullish(),
  transport: z.enum(TRANSPORTS.mieru).nullish(),
});

const shadowsocksr = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.literal("shadowsocksr"),
  ratio: nullableRatio,
  enable: nullableBool,
  port: nullablePort,
  transport: z.enum(["", "both", "tcp", "udp"]).nullish(),
  cipher: z.enum(SSR_CIPHERS).nullish(),
  server_key: nullableString,
  ssr_protocol: z.enum(SSR_PROTOCOLS).nullish(),
  protocol_param: nullableString,
  obfs: z.enum(SSR_OBFS).nullish(),
  obfs_param: nullableString,
});

const nowhere = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.literal("nowhere"),
  ratio: nullableRatio,
  enable: nullableBool,
  port: nullablePort,
  version: z.literal(3).default(3),
  network: z.enum(["mix", "tcp", "udp"]).default("mix"),
  alpn: z.tuple([z.literal("nw3")]).default(["nw3"]),
  obfs: z.enum(["morph", "none"]).default("morph"),
  allow_insecure: z.literal(false).default(false),
  security: z.literal("tls").default("tls"),
  sni: nullableString,
  cert_mode: z.enum(CERT_MODES).nullish(),
  cert_dns_provider: nullableString,
  cert_dns_env: nullableString,
});

export const protocolApiScheme = z
  .discriminatedUnion("type", [
    ss.passthrough(),
    vmess.passthrough(),
    vless.passthrough(),
    trojan.passthrough(),
    hysteria.passthrough(),
    tuic.passthrough(),
    anytls.passthrough(),
    socks.passthrough(),
    naive.passthrough(),
    http.passthrough(),
    mieru.passthrough(),
    shadowsocksr.passthrough(),
    nowhere.passthrough(),
  ])
  .superRefine((protocol, context) => {
    const issue = (field: string, message: string) =>
      context.addIssue({ code: "custom", path: [field], message });
    if (protocol.type === "hysteria" || protocol.type === "hysteria2") {
      const ports = protocol.hop_ports?.trim();
      if (Boolean(ports) !== Boolean(protocol.hop_interval))
        issue("hop_ports", "Configure hop ports and interval together");
      if (
        ports &&
        !ports.split(",").every((part) => {
          const bounds = part.trim().split("-");
          return (
            bounds.length <= 2 &&
            bounds.every(
              (value) =>
                /^\d+$/.test(value) &&
                Number(value) >= 1 &&
                Number(value) <= 65_535
            ) &&
            (bounds.length === 1 || Number(bounds[0]) <= Number(bounds[1]))
          );
        })
      )
        issue("hop_ports", "Invalid port range");
    }
    if (!protocol.enable) return;
    if (!protocol.port) issue("port", "Port is required");
    if (protocol.type === "shadowsocksr") {
      if (!protocol.cipher) issue("cipher", "Cipher is required");
      if (!protocol.server_key) issue("server_key", "Server key is required");
      if (!protocol.ssr_protocol)
        issue("ssr_protocol", "SSR protocol is required");
      if (
        protocol.transport === "udp" &&
        protocol.obfs &&
        protocol.obfs !== "plain"
      )
        issue("obfs", "UDP requires plain obfuscation");
    }
    if (
      protocol.security === "tls" &&
      [
        "vmess",
        "vless",
        "trojan",
        "hysteria",
        "hysteria2",
        "tuic",
        "anytls",
        "nowhere",
      ].includes(protocol.type)
    ) {
      if (typeof protocol.sni !== "string" || !protocol.sni.trim())
        issue("sni", "SNI is required");
      if (!protocol.cert_mode || protocol.cert_mode === "none")
        issue("cert_mode", "Certificate mode is required");
    }
  });

export const formSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  country: z.string().optional(),
  city: z.string().optional(),
  protocols: z.array(
    z.union([
      protocolApiScheme,
      z.object({ type: z.string(), enable: z.literal(false) }).passthrough(),
    ])
  ),
});
