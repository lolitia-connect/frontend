import request from "@workspace/ui/lib/request";

export type PluginStatus =
  | "unloaded"
  | "loaded"
  | "initialized"
  | "running"
  | "stopped"
  | "error";

export interface PluginInfo extends Record<string, unknown> {
  author: string;
  description: string;
  error?: string;
  name: string;
  permissions: string[];
  routes: string[];
  status: PluginStatus;
  version: string;
}

export interface PluginListResponse {
  list: PluginInfo[];
  total: number;
}

export interface PluginManifest {
  author?: string;
  config?: Record<string, unknown>;
  description?: string;
  main: string;
  name: string;
  permissions?: string[];
  version: string;
}

export interface PluginRoute {
  Handler: string;
  Method: string;
  Middleware?: string[];
  Path: string;
  PluginName: string;
}

export interface PluginMiddleware {
  Handler: string;
  Name: string;
  PluginName: string;
}

export interface PluginEventSubscription {
  Event: string;
  Handler: string;
  PluginName: string;
}

export interface PluginHealth {
  async_in_flight: number;
  async_limit: number;
  error?: string;
  name: string;
  pool_size: number;
  ready: boolean;
  registered_route: number;
  status: PluginStatus;
}

export interface PluginActionResponse {
  action: string;
  message: string;
  name: string;
  status: PluginStatus;
}

export interface PluginValidationCheck {
  message?: string;
  name: string;
  ok: boolean;
}

export interface PluginValidation {
  checks: PluginValidationCheck[];
  error?: string;
  manifest?: PluginManifest;
  name: string;
  valid: boolean;
}

export interface PluginInstallResult {
  enabled: boolean;
  name: string;
  plugin: PluginInfo;
  replaced: boolean;
  status: PluginStatus;
  validation: PluginValidation;
}

export interface GetPluginListParams {
  page?: number;
  q?: string;
  size?: number;
  status?: string;
}

export interface UploadPluginOptions {
  enable?: boolean;
  replace?: boolean;
}

const prefix = `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/plugins`;

export async function getPluginList(
  params: GetPluginListParams,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginListResponse }>(prefix, {
    method: "GET",
    params,
    ...(options || {}),
  });
}

export async function getPluginDetail(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginInfo }>(
    `${prefix}/${encodeURIComponent(name)}`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getPluginManifest(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginManifest }>(
    `${prefix}/${encodeURIComponent(name)}/manifest`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getPluginRoutes(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginRoute[] }>(
    `${prefix}/${encodeURIComponent(name)}/routes`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getPluginMiddlewares(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginMiddleware[] }>(
    `${prefix}/${encodeURIComponent(name)}/middlewares`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getPluginEvents(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginEventSubscription[] }>(
    `${prefix}/${encodeURIComponent(name)}/events`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getPluginHealth(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginHealth }>(
    `${prefix}/${encodeURIComponent(name)}/health`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function enablePlugin(
  name: string,
  options?: { [key: string]: unknown }
) {
  return pluginAction(name, "enable", options);
}

export async function disablePlugin(
  name: string,
  options?: { [key: string]: unknown }
) {
  return pluginAction(name, "disable", options);
}

export async function reloadPlugin(
  name: string,
  options?: { [key: string]: unknown }
) {
  return pluginAction(name, "reload", options);
}

export async function restartPlugin(
  name: string,
  options?: { [key: string]: unknown }
) {
  return pluginAction(name, "restart", options);
}

export async function validatePlugin(
  name: string,
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginValidation }>(
    `${prefix}/${encodeURIComponent(name)}/validate`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function reloadAllPlugins(options?: { [key: string]: unknown }) {
  return request<API.Response & { data?: PluginListResponse }>(
    `${prefix}/reload-all`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function uploadPluginPackage(
  file: File,
  body: UploadPluginOptions = {},
  options?: { [key: string]: unknown }
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("replace", body.replace ? "true" : "false");
  formData.append("enable", body.enable ? "true" : "false");

  return request<API.Response & { data?: PluginInstallResult }>(
    `${prefix}/upload`,
    {
      method: "POST",
      data: formData,
      ...(options || {}),
    }
  );
}

function pluginAction(
  name: string,
  action: "enable" | "disable" | "reload" | "restart",
  options?: { [key: string]: unknown }
) {
  return request<API.Response & { data?: PluginActionResponse }>(
    `${prefix}/${encodeURIComponent(name)}/${action}`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}
