import request from "@workspace/ui/lib/request";

export async function putV1AdminAds(
  body: BackendAPI.UpdateAdsRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ads/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminAds(
  body: BackendAPI.CreateAdsRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ads/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminAds(
  body: BackendAPI.DeleteAdsRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ads/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminAdsDetail(
  params: BackendAPI.getV1AdminAdsDetailParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.Ads }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ads/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminAdsList(
  params: BackendAPI.getV1AdminAdsListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetAdsListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ads/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminAnnouncement(
  body: BackendAPI.UpdateAnnouncementRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/announcement/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminAnnouncement(
  body: BackendAPI.CreateAnnouncementRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/announcement/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminAnnouncement(
  body: BackendAPI.DeleteAnnouncementRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/announcement/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminAnnouncementDetail(
  params: BackendAPI.getV1AdminAnnouncementDetailParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.Announcement;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/announcement/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminAnnouncementList(
  params: BackendAPI.getV1AdminAnnouncementListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetAnnouncementListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/announcement/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1AdminApplication(
  body: BackendAPI.CreateSubscribeApplicationRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SubscribeApplication;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/application/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV1AdminApplicationPreview(
  params: BackendAPI.getV1AdminApplicationPreviewParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PreviewSubscribeTemplateResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/application/preview`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1AdminApplicationSubscribeApplication(
  body: BackendAPI.UpdateSubscribeApplicationRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SubscribeApplication;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/application/subscribe_application`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminApplicationSubscribeApplication(
  body: BackendAPI.DeleteSubscribeApplicationRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/application/subscribe_application`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminApplicationSubscribeApplicationList(
  params: BackendAPI.getV1AdminApplicationSubscribeApplicationListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscribeApplicationListResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/application/subscribe_application_list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminAuthMethodConfig(
  params: BackendAPI.getV1AdminAuthMethodConfigParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.AuthMethodConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/auth-method/config`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1AdminAuthMethodConfig(
  body: BackendAPI.UpdateAuthMethodConfigRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.AuthMethodConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/auth-method/config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminAuthMethodEmailPlatform(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PlatformResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/auth-method/email_platform`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminAuthMethodList(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetAuthMethodListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/auth-method/list`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminAuthMethodSmsPlatform(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PlatformResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/auth-method/sms_platform`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1AdminAuthMethodTestEmailSend(
  body: BackendAPI.TestEmailSendRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/auth-method/test_email_send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminAuthMethodTestSmsSend(
  body: BackendAPI.TestSmsSendRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/auth-method/test_sms_send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminConsoleRevenue(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.RevenueStatisticsResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/console/revenue`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminConsoleServer(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.ServerTotalDataResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/console/server`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminConsoleTicket(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.TicketWaitRelpyResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/console/ticket`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminConsoleUser(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.UserStatisticsResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/console/user`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function putV1AdminCoupon(
  body: BackendAPI.UpdateCouponRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/coupon/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminCoupon(
  body: BackendAPI.CreateCouponRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/coupon/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminCoupon(
  body: BackendAPI.DeleteCouponRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/coupon/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminCouponBatch(
  body: BackendAPI.BatchDeleteCouponRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/coupon/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminCouponList(
  params: BackendAPI.getV1AdminCouponListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetCouponListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/coupon/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminDocument(
  body: BackendAPI.UpdateDocumentRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/document/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminDocument(
  body: BackendAPI.CreateDocumentRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/document/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminDocument(
  body: BackendAPI.DeleteDocumentRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/document/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminDocumentBatch(
  body: BackendAPI.BatchDeleteDocumentRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/document/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminDocumentDetail(
  params: BackendAPI.getV1AdminDocumentDetailParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.Document }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/document/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminDocumentList(
  params: BackendAPI.getV1AdminDocumentListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetDocumentListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/document/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminGroupConfig(
  params: BackendAPI.getV1AdminGroupConfigParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetGroupConfigResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/config`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminGroupConfig(
  body: BackendAPI.UpdateGroupConfigRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminGroupOpenApiExport(
  params: BackendAPI.getV1AdminGroup_openAPI_exportParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/export`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminGroupHistory(
  params: BackendAPI.getV1AdminGroupHistoryParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetGroupHistoryResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/history`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminGroupHistoryDetail(
  params: BackendAPI.getV1AdminGroupHistoryDetailParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetGroupHistoryDetailResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/history/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1AdminGroupNode(
  body: BackendAPI.UpdateNodeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/node`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminGroupNode(
  body: BackendAPI.CreateNodeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/node`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminGroupNode(
  body: BackendAPI.DeleteNodeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/node`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminGroupNodeList(
  params: BackendAPI.getV1AdminGroupNodeListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetNodeGroupListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/node/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminGroupPreview(
  params: BackendAPI.getV1AdminGroupPreviewParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PreviewUserNodesResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/preview`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1AdminGroupRecalculate(
  body: BackendAPI.RecalculateGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/recalculate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminGroupRecalculationStatus(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.RecalculationState;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/group/recalculation/status`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1AdminGroupReset(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/reset`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function getV1AdminGroupSubscribeMapping(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscribeGroupMappingResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/group/subscribe/mapping`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogAdminActionList(
  params: BackendAPI.getV1AdminLogAdminActionListParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/admin-action/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogBalanceList(
  params: BackendAPI.getV1AdminLogBalanceListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterBalanceLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/balance/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogCommissionList(
  params: BackendAPI.getV1AdminLogCommissionListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterCommissionLogResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/commission/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogEmailList(
  params: BackendAPI.getV1AdminLogEmailListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterEmailLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/email/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogGiftList(
  params: BackendAPI.getV1AdminLogGiftListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterGiftLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/gift/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogLoginList(
  params: BackendAPI.getV1AdminLogLoginListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterLoginLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/login/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogMessageList(
  params: BackendAPI.getV1AdminLogMessageListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetMessageLogListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/message/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogMobileList(
  params: BackendAPI.getV1AdminLogMobileListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterMobileLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/mobile/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogOrderList(
  params: BackendAPI.getV1AdminLogOrderListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterOrderLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/order/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogRegisterList(
  params: BackendAPI.getV1AdminLogRegisterListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterRegisterLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/register/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminLogServerTrafficList(
  params: BackendAPI.getV1AdminLogServerTrafficListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterServerTrafficLogResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/server/traffic/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogSetting(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.LogSetting }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/setting`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1AdminLogSetting(
  body: BackendAPI.LogSetting,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/setting`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogSubscribeList(
  params: BackendAPI.getV1AdminLogSubscribeListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterSubscribeLogResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/subscribe/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogSubscribeResetList(
  params: BackendAPI.getV1AdminLogSubscribeResetListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterResetSubscribeLogResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/log/subscribe/reset/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogSubscribeTrafficList(
  params: BackendAPI.getV1AdminLogSubscribeTrafficListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterSubscribeTrafficResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/log/subscribe/traffic/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogTrafficDetails(
  params: BackendAPI.getV1AdminLogTrafficDetailsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterTrafficLogDetailsResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/log/traffic/details`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminLogUnmatchedPaymentList(
  params: BackendAPI.getV1AdminLogUnmatchedPaymentListParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/log/unmatched-payment/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminMarketingEmailBatchList(
  params: BackendAPI.getV1AdminMarketingEmailBatchListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetBatchSendEmailTaskListResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/marketing/email/batch/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AdminMarketingEmailBatchPreSendCount(
  body: BackendAPI.GetPreSendEmailCountRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetPreSendEmailCountResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/marketing/email/batch/pre-send-count`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminMarketingEmailBatchSend(
  body: BackendAPI.CreateBatchSendEmailTaskRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/marketing/email/batch/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminMarketingEmailBatchStatus(
  body: BackendAPI.GetBatchSendEmailTaskStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetBatchSendEmailTaskStatusResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/marketing/email/batch/status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminMarketingEmailBatchStop(
  body: BackendAPI.StopBatchSendEmailTaskRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/marketing/email/batch/stop`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminMarketingQuotaCreate(
  body: BackendAPI.CreateQuotaTaskRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/marketing/quota/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminMarketingQuotaList(
  params: BackendAPI.getV1AdminMarketingQuotaListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryQuotaTaskListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/marketing/quota/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AdminMarketingQuotaPreCount(
  body: BackendAPI.QueryQuotaTaskPreCountRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryQuotaTaskPreCountResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/marketing/quota/pre-count`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminOrder(
  body: BackendAPI.CreateOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/order/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminOrderList(
  params: BackendAPI.getV1AdminOrderListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetOrderListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/order/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminOrderStatus(
  body: BackendAPI.UpdateOrderStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/order/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1AdminPayment(
  body: BackendAPI.UpdatePaymentMethodRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PaymentConfig;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/payment/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AdminPayment(
  body: BackendAPI.CreatePaymentMethodRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PaymentConfig;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/payment/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteV1AdminPayment(
  body: BackendAPI.DeletePaymentMethodRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/payment/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminPaymentList(
  params: BackendAPI.getV1AdminPaymentListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetPaymentMethodListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/payment/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminPaymentPlatform(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PlatformResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/payment/platform`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminPluginDetail(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugin/detail`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginDisable(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugin/disable`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginEnable(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugin/enable`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginList(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugin/list`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginReload(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugin/reload`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function getV1AdminPlugins2(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugins`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminPlugins(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugins/`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginsName(
  params: BackendAPI.getV1AdminPluginsNameParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugins/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsNameDisable(
  params: BackendAPI.postV1AdminPluginsNameDisableParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/disable`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsNameEnable(
  params: BackendAPI.postV1AdminPluginsNameEnableParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/enable`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginsNameEvents(
  params: BackendAPI.getV1AdminPluginsNameEventsParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/events`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginsNameHealth(
  params: BackendAPI.getV1AdminPluginsNameHealthParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/health`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginsNameManifest(
  params: BackendAPI.getV1AdminPluginsNameManifestParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/manifest`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginsNameMiddlewares(
  params: BackendAPI.getV1AdminPluginsNameMiddlewaresParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/middlewares`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsNameReload(
  params: BackendAPI.postV1AdminPluginsNameReloadParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/reload`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsNameRestart(
  params: BackendAPI.postV1AdminPluginsNameRestartParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/restart`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function getV1AdminPluginsNameRoutes(
  params: BackendAPI.getV1AdminPluginsNameRoutesParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/routes`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsNameValidate(
  params: BackendAPI.postV1AdminPluginsNameValidateParams,
  options?: { [key: string]: any }
) {
  const { name: param0, ...queryParams } = params;
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/plugins/${param0}/validate`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsReloadAll(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugins/reload-all`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1AdminPluginsUpload(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/plugins/upload`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function putV1AdminRedemptionCode(
  body: BackendAPI.UpdateRedemptionCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/code`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminRedemptionCode(
  body: BackendAPI.CreateRedemptionCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/code`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminRedemptionCode(
  body: BackendAPI.DeleteRedemptionCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/code`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminRedemptionCodeBatch(
  body: BackendAPI.BatchDeleteRedemptionCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/code/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminRedemptionCodeList(
  params: BackendAPI.getV1AdminRedemptionCodeListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetRedemptionCodeListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/code/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1AdminRedemptionCodeStatus(
  body: BackendAPI.ToggleRedemptionCodeStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/code/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminRedemptionRecordList(
  params: BackendAPI.getV1AdminRedemptionRecordListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetRedemptionRecordListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/redemption/record/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerCreate(
  body: BackendAPI.CreateServerRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerOpenApiDelete(
  body: BackendAPI.DeleteServerRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerList(
  params: BackendAPI.getV1AdminServerListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterServerListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminServerNekoproxyBinding(
  body: BackendAPI.BindNekoproxyRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/nekoproxy/binding`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminServerNekoproxyBinding(
  body: BackendAPI.UnbindNekoproxyRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/nekoproxy/binding`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerNekoproxyConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.NekoproxyConfig;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/nekoproxy/config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminServerNekoproxyConfig(
  body: BackendAPI.UpdateNekoproxyConfigRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/nekoproxy/config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerNekoproxyState(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.NekoproxyState;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/nekoproxy/state`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerNekoproxySync(
  body: BackendAPI.SyncNekoproxyRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.NekoproxySyncResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/nekoproxy/sync`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerNodeConfig(
  params: BackendAPI.getV1AdminServerNodeConfigParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetServerNodeConfigResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node_config`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerNodeConfigUpdate(
  body: BackendAPI.UpdateServerNodeConfigRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/node_config/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerNodeCreate(
  body: BackendAPI.CreateNodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerNodeOpenApiDelete(
  body: BackendAPI.DeleteNodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerNodeList(
  params: BackendAPI.getV1AdminServerNodeListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.FilterNodeListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1AdminServerNodeSort(
  body: BackendAPI.ResetSortRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node/sort`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerNodeSortByName(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/node/sort-by-name`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerNodeStatusToggle(
  body: BackendAPI.ToggleNodeStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/node/status/toggle`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerNodeTags(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryNodeTagResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node/tags`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function postV1AdminServerNodeUpdate(
  body: BackendAPI.UpdateNodeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/node/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminServerProtocols(
  params: BackendAPI.getV1AdminServerProtocolsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetServerProtocolsResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/protocols`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1AdminServerServerSort(
  body: BackendAPI.ResetSortRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/server/sort`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerServerSortByName(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/server/server/sort-by-name`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1AdminServerUpdate(
  body: BackendAPI.UpdateServerRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/server/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1AdminSubscribe(
  body: BackendAPI.UpdateSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminSubscribe(
  body: BackendAPI.CreateSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminSubscribe(
  body: BackendAPI.DeleteSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminSubscribeBatch(
  body: BackendAPI.BatchDeleteSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSubscribeDetails(
  params: BackendAPI.getV1AdminSubscribeDetailsParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.Subscribe }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/details`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1AdminSubscribeGroup(
  body: BackendAPI.UpdateSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/group`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminSubscribeGroup(
  body: BackendAPI.CreateSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/group`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminSubscribeGroup(
  body: BackendAPI.DeleteSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/group`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminSubscribeGroupBatch(
  body: BackendAPI.BatchDeleteSubscribeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/group/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSubscribeGroupList(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscribeGroupListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/group/list`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminSubscribeList(
  params: BackendAPI.getV1AdminSubscribeListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscribeListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1AdminSubscribeResetAllToken(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.ResetAllSubscribeTokenResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/subscribe/reset_all_token`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1AdminSubscribeSort(
  body: BackendAPI.SubscribeSortRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/subscribe/sort`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemCurrencyConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.CurrencyConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/currency_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemCurrencyConfig(
  body: BackendAPI.CurrencyConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/currency_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemGetNodeMultiplier(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetNodeMultiplierResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/system/get_node_multiplier`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemInviteConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.InviteConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/invite_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemInviteConfig(
  body: BackendAPI.InviteConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/invite_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemModule(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.ModuleConfig;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/module`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminSystemNodeConfig(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.NodeConfig }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/node_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemNodeConfig(
  body: BackendAPI.NodeConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/node_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemNodeMultiplierPreview(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PreViewNodeMultiplierResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/system/node_multiplier/preview`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemPrivacy(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PrivacyPolicyConfig;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/privacy`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function putV1AdminSystemPrivacy(
  body: BackendAPI.PrivacyPolicyConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/privacy`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemRegisterConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.RegisterConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/register_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemRegisterConfig(
  body: BackendAPI.RegisterConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/register_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminSystemSetNodeMultiplier(
  body: BackendAPI.SetNodeMultiplierRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/system/set_node_multiplier`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminSystemSettingTelegramBot(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/system/setting_telegram_bot`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemSiteConfig(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.SiteConfig }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/site_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemSiteConfig(
  body: BackendAPI.SiteConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/site_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemSubscribeConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SubscribeConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/subscribe_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemSubscribeConfig(
  body: BackendAPI.SubscribeConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/subscribe_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemTosConfig(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.TosConfig }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/tos_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemTosConfig(
  body: BackendAPI.TosConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/tos_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemVerifyCodeConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.VerifyCodeConfig;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/system/verify_code_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemVerifyCodeConfig(
  body: BackendAPI.VerifyCodeConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/system/verify_code_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminSystemVerifyConfig(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.VerifyConfig;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/verify_config`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1AdminSystemVerifyConfig(
  body: BackendAPI.VerifyConfig,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/system/verify_config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1AdminTicket(
  body: BackendAPI.UpdateTicketStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ticket/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminTicketDetail(
  params: BackendAPI.getV1AdminTicketDetailParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.Ticket }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ticket/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AdminTicketFollow(
  body: BackendAPI.CreateTicketFollowRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ticket/follow`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminTicketList(
  params: BackendAPI.getV1AdminTicketListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetTicketListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/ticket/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminToolIpLocation(
  params: BackendAPI.getV1AdminToolIpLocationParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryIPLocationResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/tool/ip/location`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminToolLog(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/tool/log`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1AdminToolRestart(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/tool/restart`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminToolVersion(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.VersionResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/tool/version`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function postV1AdminUser(
  body: BackendAPI.CreateUserRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminUser(
  params: BackendAPI.deleteV1AdminUserParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/`,
    {
      method: "DELETE",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserAuthMethod(
  params: BackendAPI.getV1AdminUserAuthMethodParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserAuthMethodResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/auth_method`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminUserAuthMethod(
  body: BackendAPI.UpdateUserAuthMethodRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/auth_method`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminUserAuthMethod(
  body: BackendAPI.CreateUserAuthMethodRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/auth_method`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminUserAuthMethod(
  body: BackendAPI.DeleteUserAuthMethodRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/auth_method`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1AdminUserBasic(
  body: BackendAPI.UpdateUserBasiceInfoRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/basic`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminUserBatch(
  body: BackendAPI.BatchDeleteUserRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/batch`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserCurrent(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.User }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/current`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserDetail(
  params: BackendAPI.getV1AdminUserDetailParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.User }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1AdminUserDevice(
  body: BackendAPI.UserDevice,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/device`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminUserDevice(
  body: BackendAPI.DeleteUserDeivceRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/device`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1AdminUserDeviceKickOffline(
  body: BackendAPI.KickOfflineRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/user/device/kick_offline`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserList(
  params: BackendAPI.getV1AdminUserListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AdminUserLoginLogs(
  params: BackendAPI.getV1AdminUserLoginLogsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserLoginLogsResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/login/logs`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminUserNotify(
  body: BackendAPI.UpdateUserNotifySettingRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/notify`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserSubscribe(
  params: BackendAPI.getV1AdminUserSubscribeParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserSubscribeListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function putV1AdminUserSubscribe(
  body: BackendAPI.UpdateUserSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminUserSubscribe(
  body: BackendAPI.CreateUserSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1AdminUserSubscribe(
  body: BackendAPI.DeleteUserSubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserSubscribeDetail(
  params: BackendAPI.getV1AdminUserSubscribeDetailParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.UserSubscribeDetail;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserSubscribeDevice(
  params: BackendAPI.getV1AdminUserSubscribeDeviceParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserSubscribeDevicesResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe/device`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserSubscribeLogs(
  params: BackendAPI.getV1AdminUserSubscribeLogsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserSubscribeLogsResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe/logs`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserSubscribeResetLogs(
  params: BackendAPI.getV1AdminUserSubscribeResetLogsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserSubscribeResetTrafficLogsResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/user/subscribe/reset/logs`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AdminUserSubscribeResetToken(
  body: BackendAPI.ResetUserSubscribeTokenRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/user/subscribe/reset/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminUserSubscribeResetTraffic(
  body: BackendAPI.ResetUserSubscribeTrafficRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/user/subscribe/reset/traffic`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AdminUserSubscribeToggle(
  body: BackendAPI.ToggleUserSubscribeStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/admin/user/subscribe/toggle`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AdminUserSubscribeTrafficLogs(
  params: BackendAPI.getV1AdminUserSubscribeTrafficLogsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserSubscribeTrafficLogsResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/admin/user/subscribe/traffic_logs`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AuthAdminCaptchaGenerate(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GenerateCaptchaResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/admin/captcha/generate`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1AuthAdminCaptchaSliderVerify(
  body: BackendAPI.SliderVerifyCaptchaRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SliderVerifyCaptchaResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/auth/admin/captcha/slider/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1AuthAdminLogin(
  body: BackendAPI.UserLoginRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthAdminReset(
  body: BackendAPI.ResetPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/admin/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthCaptchaGenerate(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GenerateCaptchaResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/captcha/generate`, {
    method: "POST",
    ...(options || {}),
  });
}

export async function postV1AuthCaptchaSliderVerify(
  body: BackendAPI.SliderVerifyCaptchaRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SliderVerifyCaptchaResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/captcha/slider/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1AuthCheck(
  params: BackendAPI.getV1AuthCheckParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.CheckUserResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/check`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1AuthCheckTelephone(
  params: BackendAPI.getV1AuthCheckTelephoneParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.TelephoneCheckUserResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/check/telephone`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1AuthLogin(
  body: BackendAPI.UserLoginRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthLoginDevice(
  body: BackendAPI.DeviceLoginRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/login/device`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthLoginTelephone(
  body: BackendAPI.TelephoneLoginRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/login/telephone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthOauthCallbackApple(
  params: BackendAPI.postV1AuthOauthCallbackAppleParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/oauth/callback/apple`,
    {
      method: "POST",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1AuthOauthLogin(
  body: BackendAPI.OAthLoginRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.OAuthLoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/oauth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthOauthLoginToken(
  body: BackendAPI.OAuthLoginGetTokenRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/oauth/login/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthRegister(
  body: BackendAPI.UserRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthRegisterTelephone(
  body: BackendAPI.TelephoneRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/register/telephone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthReset(
  body: BackendAPI.ResetPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1AuthResetTelephone(
  body: BackendAPI.TelephoneResetPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.LoginResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/auth/reset/telephone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV1CommonAds(
  params: BackendAPI.getV1CommonAdsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetAdsResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/ads`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1CommonCheckVerificationCode(
  body: BackendAPI.CheckVerificationCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.CheckVerificationCodeRespone;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/common/check_verification_code`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1CommonClient(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscribeClientResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/client`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1CommonHeartbeat(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.HeartbeatResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/heartbeat`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function postV1CommonSendCode(
  body: BackendAPI.SendCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SendCodeResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/send_code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1CommonSendSmsCode(
  body: BackendAPI.SendSmsCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.SendCodeResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/send_sms_code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV1CommonSiteConfig(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetGlobalConfigResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/site/config`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1CommonSitePrivacy(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PrivacyPolicyConfig;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/site/privacy`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1CommonSiteStat(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetStatResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/site/stat`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1CommonSiteTos(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetTosResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/common/site/tos`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1PublicAnnouncementList(
  params: BackendAPI.getV1PublicAnnouncementListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryAnnouncementResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/announcement/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1PublicDocumentDetail(
  params: BackendAPI.getV1PublicDocumentDetailParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.Document }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/document/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1PublicDocumentList(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryDocumentListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/document/list`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function postV1PublicOrderClose(
  body: BackendAPI.CloseOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/close`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicOrderDetail(
  params: BackendAPI.getV1PublicOrderDetailParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.OrderDetail;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/detail`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1PublicOrderList(
  params: BackendAPI.getV1PublicOrderListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryOrderListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1PublicOrderPre(
  body: BackendAPI.PurchaseOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PreOrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/pre`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1PublicOrderPurchase(
  body: BackendAPI.PurchaseOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PurchaseOrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1PublicOrderRecharge(
  body: BackendAPI.RechargeOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.RechargeOrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/recharge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1PublicOrderRenewal(
  body: BackendAPI.RenewalOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.RenewalOrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/renewal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1PublicOrderReset(
  body: BackendAPI.ResetTrafficOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.ResetTrafficOrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/order/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV1PublicPaymentMethods(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetAvailablePaymentMethodsResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/payment/methods`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function postV1PublicPortalOrderCheckout(
  body: BackendAPI.CheckoutOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.CheckoutOrderResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/portal/order/checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicPortalOrderStatus(
  params: BackendAPI.getV1PublicPortalOrderStatusParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryPurchaseOrderResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/portal/order/status`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1PublicPortalPaymentMethod(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetAvailablePaymentMethodsResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/portal/payment-method`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function postV1PublicPortalPre(
  body: BackendAPI.PrePurchaseOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PrePurchaseOrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/portal/pre`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1PublicPortalPurchase(
  body: BackendAPI.PortalPurchaseRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PortalPurchaseResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/portal/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV1PublicPortalSubscribe(
  params: BackendAPI.getV1PublicPortalSubscribeParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscriptionResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/portal/subscribe`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1PublicRedemption(
  body: BackendAPI.RedeemCodeRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.RedeemCodeResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/redemption/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV1PublicServerList(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetServerNodeListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/server/list`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1PublicSubscribeList(
  params: BackendAPI.getV1PublicSubscribeListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QuerySubscribeListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/subscribe/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1PublicSubscribeNodeList(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryUserSubscribeNodeListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/subscribe/node/list`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1PublicTicket(
  body: BackendAPI.UpdateUserTicketStatusRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/ticket/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1PublicTicket(
  body: BackendAPI.CreateUserTicketRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/ticket/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicTicketDetail(
  params: BackendAPI.getV1PublicTicketDetailParams,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.Ticket }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/ticket/detail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1PublicTicketFollow(
  body: BackendAPI.CreateUserTicketFollowRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/ticket/follow`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicTicketList(
  params: BackendAPI.getV1PublicTicketListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserTicketListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/ticket/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getV1PublicUserAffiliateCount(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryUserAffiliateCountResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/affiliate/count`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserAffiliateList(
  params: BackendAPI.getV1PublicUserAffiliateListParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryUserAffiliateListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/affiliate/list`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserBalanceLog(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryUserBalanceLogListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/balance_log`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function putV1PublicUserBindEmail(
  body: BackendAPI.UpdateBindEmailRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/bind_email`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserBindMobile(
  body: BackendAPI.UpdateBindMobileRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/bind_mobile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserBindOauth(
  body: BackendAPI.BindOAuthRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.BindOAuthResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/bind_oauth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function postV1PublicUserBindOauthCallback(
  body: BackendAPI.BindOAuthCallbackRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/public/user/bind_oauth/callback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserBindTelegram(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.BindTelegramResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/bind_telegram`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserCommissionLog(
  params: BackendAPI.getV1PublicUserCommissionLogParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryUserCommissionLogListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/commission_log`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserCommissionWithdraw(
  body: BackendAPI.CommissionWithdrawRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.WithdrawalLog;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/public/user/commission_withdraw`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function deleteV1PublicUserCurrentUserAccount(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/public/user/current_user_account`,
    {
      method: "DELETE",
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserDeviceOnlineStatistics(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetDeviceOnlineStatsResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v1/public/user/device_online_statistics`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserDevices(options?: { [key: string]: any }) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetDeviceListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/devices`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1PublicUserInfo(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: BackendAPI.User }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/info`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserLoginLog(
  params: BackendAPI.getV1PublicUserLoginLogParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetLoginLogResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/login_log`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function postV1PublicUserLogout(options?: { [key: string]: any }) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/logout`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserNotify(
  body: BackendAPI.UpdateUserNotifyRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/notify`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserOauthMethods(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetOAuthMethodsResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/oauth_methods`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserPassword(
  body: BackendAPI.UpdateUserPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserRules(
  body: BackendAPI.UpdateUserRulesRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/rules`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserSubscribe(options?: {
  [key: string]: any;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryUserSubscribeListResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/subscribe`, {
    method: "GET",
    ...(options || {}),
  });
}

export async function getV1PublicUserSubscribeLog(
  params: BackendAPI.getV1PublicUserSubscribeLogParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetSubscribeLogResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/subscribe_log`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserSubscribeNote(
  body: BackendAPI.UpdateUserSubscribeNoteRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/subscribe_note`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserSubscribeToken(
  body: BackendAPI.ResetUserSubscribeTokenRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/subscribe_token`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserTrafficStats(
  params: BackendAPI.getV1PublicUserTrafficStatsParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.GetUserTrafficStatsResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/traffic_stats`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function putV1PublicUserUnbindDevice(
  body: BackendAPI.UnbindDeviceRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/unbind_device`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserUnbindOauth(
  body: BackendAPI.UnbindOAuthRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/unbind_oauth`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserUnbindTelegram(options?: {
  [key: string]: any;
}) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/unbind_telegram`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserUnsubscribe(
  body: BackendAPI.UnsubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/unsubscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserUnsubscribePre(
  body: BackendAPI.PreUnsubscribeRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.PreUnsubscribeResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/unsubscribe/pre`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV1PublicUserVerifyEmail(
  body: BackendAPI.VerifyEmailRequest,
  options?: { [key: string]: any }
) {
  return request<{ code?: number; msg?: string; data?: any }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/verify_email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV1PublicUserWithdrawalLog(
  params: BackendAPI.getV1PublicUserWithdrawalLogParams,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.QueryWithdrawalLogListResponse;
  }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v1/public/user/withdrawal_log`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

export async function postV2PublicOrders(
  body: BackendAPI.V2CreateOrderRequest,
  options?: { [key: string]: any }
) {
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.V2OrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v2/public/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getV2PublicOrdersOrderNo(
  params: BackendAPI.getV2PublicOrdersOrderNoParams,
  options?: { [key: string]: any }
) {
  const { orderNo: param0, ...queryParams } = params;
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.V2OrderResponse;
  }>(`${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v2/public/orders/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

export async function postV2PublicOrdersOrderNoCheckout(
  params: BackendAPI.postV2PublicOrdersOrderNoCheckoutParams,
  body: BackendAPI.V2CheckoutOrderRequest,
  options?: { [key: string]: any }
) {
  const { orderNo: param0, ...queryParams } = params;
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.V2OrderResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v2/public/orders/${param0}/checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

export async function postV2PublicOrdersOrderNoEventTicket(
  params: BackendAPI.postV2PublicOrdersOrderNoEventTicketParams,
  body: BackendAPI.V2EventTicketRequest,
  options?: { [key: string]: any }
) {
  const { orderNo: param0, ...queryParams } = params;
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.V2EventTicketResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v2/public/orders/${param0}/event-ticket`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

export async function getV2PublicOrdersOrderNoEvents(
  params: BackendAPI.getV2PublicOrdersOrderNoEventsParams,
  options?: { [key: string]: any }
) {
  const { orderNo: param0, ...queryParams } = params;
  return request<string>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v2/public/orders/${param0}/events`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

export async function postV2PublicOrdersOrderNoSession(
  params: BackendAPI.postV2PublicOrdersOrderNoSessionParams,
  body: BackendAPI.V2OrderSessionRequest,
  options?: { [key: string]: any }
) {
  const { orderNo: param0, ...queryParams } = params;
  return request<{
    code?: number;
    msg?: string;
    data?: BackendAPI.V2OrderSessionResponse;
  }>(
    `${
      process.env.NEXT_PUBLIC_API_PREFIX || ""
    }/v2/public/orders/${param0}/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}
