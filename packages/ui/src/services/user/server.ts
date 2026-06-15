// @ts-nocheck
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** Query Public Server List GET /v1/public/server/list */
export async function queryPublicServerList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.QueryPublicServerListParams,
  options?: { [key: string]: any }
) {
  return request<API.Response & { data?: API.QueryPublicServerListResponse }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/server/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}
