import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { buildSchema } from "./node-form";

const t = ((_key: string, fallback: string) => fallback) as TFunction;
const base = {
  name: "Node",
  node_type: "landing",
  server_id: "1",
  protocol: "vless",
  protocol_id: "1",
  address: "",
  port: 0,
  tags: [],
};
const create = {
  chain_id: "chain-1",
  entry_group_id: "group-1",
  protocol: "tcp_udp",
  target_host: "target.example.com",
  target_port: 443,
  requested_port: 0,
};

describe("node forwarding form validation", () => {
  it("keeps the entry address and port required for ordinary nodes", () => {
    expect(buildSchema(t).safeParse(base).success).toBe(false);
    expect(
      buildSchema(t).safeParse({
        ...base,
        address: "entry.example.com",
        port: 443,
      }).success
    ).toBe(true);
  });
  it("allows remote allocation without guessing an entry port", () => {
    expect(
      buildSchema(t).safeParse({ ...base, nekoproxy: { create } }).success
    ).toBe(true);
    expect(
      buildSchema(t).safeParse({
        ...base,
        nekoproxy: { forward_id: "l4s-1", session_id: "session-1" },
      }).success
    ).toBe(true);
  });
  it("requires a complete forwarding target and exactly one selection mode", () => {
    for (const nekoproxy of [
      { forward_id: "l4s-1", session_id: "" },
      { create: { ...create, target_port: 0 } },
      { create: { ...create, entry_group_id: "" } },
      { create: { ...create, requested_port: 65_536 } },
      { create, forward_id: "l4s-1", session_id: "session-1" },
    ])
      expect(buildSchema(t).safeParse({ ...base, nekoproxy }).success).toBe(
        false
      );
  });
  it("preserves the landing-node server requirement when forwarding is selected", () => {
    expect(
      buildSchema(t).safeParse({
        ...base,
        server_id: "",
        nekoproxy: { create },
      }).success
    ).toBe(false);
    expect(
      buildSchema(t).safeParse({
        ...base,
        node_type: "front",
        server_id: undefined,
        protocol: "",
        protocol_id: "",
        nekoproxy: { create },
      }).success
    ).toBe(true);
  });
});
