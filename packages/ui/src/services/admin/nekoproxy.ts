import request from "@workspace/ui/lib/request";

export interface NekoproxyConfig {
  api_url: string;
  has_api_token: boolean;
}
export interface NekoproxySession {
  address: string;
  group_id: string;
  id: string;
  port: number;
  status: string;
}
export interface NekoproxyForward {
  chain_id: string;
  chain_name: string;
  enabled: boolean;
  id: string;
  name: string;
  paused: boolean;
  protocol: string;
  sessions: NekoproxySession[];
  target_host: string;
  target_port: number;
}
export interface NekoproxyBinding {
  api_url: string;
  forward_id: string;
  node_id: string;
  session_id: string;
  sync_on_save: boolean;
}
export interface NekoproxyNodeEntry {
  address: string;
  binding?: NekoproxyBinding;
  port: number;
}
export interface NekoproxyState {
  api_url: string;
  bindings: NekoproxyBinding[];
  chains: { id: string; name: string }[];
  error?: string;
  forwards: NekoproxyForward[];
  groups: {
    id: string;
    name: string;
    listen_host: string;
    port_start: number;
    port_end: number;
  }[];
}
export interface CreateNekoproxyForward {
  chain_id: string;
  entry_group_id: string;
  protocol: "tcp" | "udp" | "tcp_udp";
  requested_port: number;
  target_host: string;
  target_port: number;
  target_port_manual?: boolean;
}
export interface NekoproxyNodeOptions {
  create?: CreateNekoproxyForward;
  forward_id?: string;
  session_id?: string;
}
export interface NekoproxySyncResponse {
  errors: { node_id: string; message: string }[];
  updated: number;
}

export function getNekoproxyConfig() {
  return request<API.Response & { data?: NekoproxyConfig }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/config`,
    { method: "GET" }
  );
}
export function updateNekoproxyConfig(data: {
  api_url: string;
  api_token?: string;
}) {
  return request<API.Response>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/config`,
    { method: "PUT", data }
  );
}
export function getNekoproxyState() {
  return request<API.Response & { data?: NekoproxyState }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/state`,
    { method: "GET" }
  );
}
export function getNekoproxyBinding(nodeID: string) {
  return request<API.Response & { data: NekoproxyNodeEntry }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/binding`,
    { method: "GET", params: { node_id: nodeID } }
  );
}
export function bindNekoproxy(data: {
  node_id: string;
  forward_id: string;
  session_id: string;
}) {
  return request<API.Response>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/binding`,
    { method: "PUT", data }
  );
}
export function unbindNekoproxy(data: { node_id: string }) {
  return request<API.Response>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/binding`,
    { method: "DELETE", data }
  );
}
export function syncNekoproxy(data: { node_id?: string } = {}) {
  return request<API.Response & { data?: NekoproxySyncResponse }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/nekoproxy/sync`,
    { method: "POST", data }
  );
}
