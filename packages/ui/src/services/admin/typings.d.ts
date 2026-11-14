declare namespace API {
  type AdminActionLog = {
    action: string;
    client_ip: string;
    created_at: number;
    detail: string;
    id: number;
    ip_as_organization: string;
    ip_asn: number;
    ip_city: string;
    ip_country: string;
    ip_country_code: string;
    ip_region: string;
    object: string;
    object_id: number;
    source: string;
    telegram_sender_id: number;
    timestamp: number;
    user_agent: string;
    user_id: number;
  };

  type Ads = {
    id: string;
    title: string;
    type: string;
    content: string;
    description: string;
    target_url: string;
    start_time: number;
    end_time: number;
    status: number;
    created_at: number;
    updated_at: number;
  };

  type Announcement = {
    id: string;
    title: string;
    content: string;
    show: boolean;
    pinned: boolean;
    popup: boolean;
    created_at: number;
    updated_at: number;
  };

  type AuthMethodConfig = {
    id: string;
    method: string;
    config: Record<string, any>;
    enabled: boolean;
  };

  type BalanceLog = {
    type: number;
    user_id: string;
    amount: number;
    order_no?: string;
    balance: number;
    timestamp: number;
    actor_id?: number;
    client_ip?: string;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
    user_agent?: string;
  };

  type BatchDeleteCouponRequest = {
    ids: string[];
  };

  type BatchDeleteDocumentRequest = {
    ids: string[];
  };

  type BatchDeleteSubscribeGroupRequest = {
    ids: string[];
  };

  type BatchDeleteSubscribeRequest = {
    ids: string[];
  };

  type BatchDeleteUserRequest = {
    ids: string[];
  };

  type BatchSendEmailTask = {
    id: string;
    subject: string;
    content: string;
    recipients: string;
    scope: number;
    register_start_time: number;
    register_end_time: number;
    additional: string;
    scheduled: number;
    interval: number;
    limit: number;
    status: number;
    errors: string;
    total: number;
    current: number;
    created_at: number;
    updated_at: number;
    recipient_count?: number;
  };

  type CommissionLog = {
    type: number;
    user_id: string;
    amount: number;
    order_no: string;
    timestamp: number;
    actor_id?: number;
    client_ip?: string;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
    user_agent?: string;
  };

  type Coupon = {
    id: string;
    name: string;
    code: string;
    count: number;
    type: number;
    discount: number;
    start_time: number;
    expire_time: number;
    user_limit: number;
    subscribe: string[];
    used_count: number;
    enable: boolean;
    created_at: number;
    updated_at: number;
  };

  type CreateAdsRequest = {
    title: string;
    type: string;
    content: string;
    description: string;
    target_url: string;
    start_time: number;
    end_time: number;
    status: number;
  };

  type CreateAnnouncementRequest = {
    title: string;
    content: string;
  };

  type CreateBatchSendEmailTaskRequest = {
    subject: string;
    content: string;
    scope: number;
    register_start_time?: number;
    register_end_time?: number;
    additional?: string;
    scheduled?: number;
    interval?: number;
    limit?: number;
  };

  type CreateCouponRequest = {
    name: string;
    code?: string;
    count?: number;
    type: number;
    discount: number;
    start_time: number;
    expire_time: number;
    user_limit?: number;
    subscribe?: string[];
    used_count?: number;
    enable?: boolean;
  };

  type CreateDocumentRequest = {
    title: string;
    content: string;
    tags?: string[];
    show: boolean;
  };

  type CreateNodeRequest = {
    name: string;
    tags?: string[];
    port: number;
    address: string;
    server_id?: string;
    protocol?: string;
    protocol_id?: string;
    enabled?: boolean;
    node_type?: string;
    is_hidden?: boolean;
    node_group_ids?: string[];
  };

  type CreateOrderRequest = {
    user_id: string;
    type: number;
    quantity?: number;
    price: number;
    amount: number;
    discount?: number;
    coupon?: string;
    coupon_discount?: number;
    commission: number;
    fee_amount: number;
    payment_id: string;
    trade_no?: string;
    status?: number;
    subscribe_id?: string;
    user_subscribe_id?: number;
  };

  type CreatePaymentMethodRequest = {
    name: string;
    platform: string;
    description: string;
    icon?: string;
    domain?: string;
    config: Record<string, any>;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    sort?: number;
    enable: boolean;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
  };

  type CreateQuotaTaskRequest = {
    subscribers: string[];
    is_active: boolean;
    start_time: number;
    end_time: number;
    reset_traffic: boolean;
    days: number;
    gift_type: number;
    gift_value: number;
  };

  type CreateServerRequest = {
    name: string;
    country?: string;
    city?: string;
    address: string;
    sort?: number;
    protocols: Protocol[];
  };

  type CreateSubscribeApplicationRequest = {
    name: string;
    description?: string;
    icon?: string;
    scheme?: string;
    user_agent: string;
    is_default: boolean;
    template: string;
    output_format: string;
    download_link: DownloadLink;
    default_params?: string;
  };

  type CreateSubscribeGroupRequest = {
    name: string;
    description: string;
  };

  type CreateSubscribeRequest = {
    name: string;
    language: string;
    description: string;
    unit_price: number;
    unit_time: string;
    discount: SubscribeDiscount[];
    replacement: number;
    inventory: number;
    traffic: number;
    traffic_unlimited: boolean;
    speed_limit: number;
    device_limit: number;
    quota: number;
    nodes: number[];
    node_tags: string[];
    show: boolean;
    sell: boolean;
    deduction_ratio: number;
    allow_deduction: boolean;
    reset_cycle: number;
    renewal_reset: boolean;
    show_original_price: boolean;
  };

  type CreateTicketFollowRequest = {
    ticket_id: string;
    from: string;
    type: number;
    content: string;
  };

  type CreateUserAuthMethodRequest = {
    user_id: string;
    auth_type: string;
    auth_identifier: string;
  };

  type CreateUserRequest = {
    email: string;
    telephone: string;
    telephone_area_code: string;
    password: string;
    product_id: string;
    duration: number;
    referral_percentage: number;
    only_first_purchase: boolean;
    referer_user: string;
    refer_code: string;
    balance: number;
    commission: number;
    gift_amount: number;
    is_admin: boolean;
  };

  type CreateUserSubscribeRequest = {
    user_id: string;
    expired_at: number;
    traffic: number;
    traffic_unlimited: boolean;
    subscribe_id: string;
  };

  type CurrencyConfig = {
    access_key: string;
    currency_unit: string;
    currency_symbol: string;
  };

  type DeleteAdsRequest = {
    id: string;
  };

  type DeleteAnnouncementRequest = {
    id: string;
  };

  type DeleteCouponRequest = {
    id: string;
  };

  type DeleteDocumentRequest = {
    id: string;
  };

  type DeleteNodeRequest = {
    id: string;
  };

  type DeletePaymentMethodRequest = {
    id: string;
  };

  type DeleteServerRequest = {
    id: string;
  };

  type DeleteSubscribeApplicationRequest = {
    id: string;
  };

  type DeleteSubscribeGroupRequest = {
    id: string;
  };

  type DeleteSubscribeRequest = {
    id: string;
  };

  type DeleteUserAuthMethodRequest = {
    user_id: string;
    auth_type: string;
  };

  type DeleteUserDeivceRequest = {
    id: string;
  };

  type DeleteUserSubscribeRequest = {
    user_subscribe_id: string;
  };

  type Document = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    show: boolean;
    created_at: number;
    updated_at: number;
  };

  type DownloadLink = {
    ios?: string;
    android?: string;
    windows?: string;
    mac?: string;
    linux?: string;
    harmony?: string;
  };

  type FilterAdminActionLogResponse = {
    list: AdminActionLog[];
    total: number;
  };

  type FilterBalanceLogResponse = {
    total: number;
    list: BalanceLog[];
  };

  type FilterCommissionLogResponse = {
    total: number;
    list: CommissionLog[];
  };

  type FilterEmailLogResponse = {
    total: number;
    list: MessageLog[];
  };

  type FilterGiftLogResponse = {
    total: number;
    list: GiftLog[];
  };

  type FilterLoginLogResponse = {
    total: number;
    list: LoginLog[];
  };

  type FilterMobileLogResponse = {
    total: number;
    list: MessageLog[];
  };

  type FilterNodeListResponse = {
    total: number;
    list: Node[];
  };

  type FilterOrderLogResponse = {
    list: OrderLog[];
    total: number;
  };

  type FilterRegisterLogResponse = {
    total: number;
    list: RegisterLog[];
  };

  type FilterResetSubscribeLogResponse = {
    total: number;
    list: ResetSubscribeLog[];
  };

  type FilterServerListResponse = {
    total: number;
    list: Server[];
  };

  type FilterServerTrafficLogResponse = {
    total: number;
    list: ServerTrafficLog[];
  };

  type FilterSubscribeLogResponse = {
    total: number;
    list: SubscribeLog[];
  };

  type FilterSubscribeTrafficResponse = {
    total: number;
    list: UserSubscribeTrafficLog[];
  };

  type FilterTrafficLogDetailsResponse = {
    total: number;
    list: TrafficLogDetails[];
  };

  type FilterUnmatchedPaymentLogResponse = {
    list: UnmatchedPaymentLog[];
    total: number;
  };

  type Follow = {
    id: string;
    ticket_id: string;
    from: string;
    type: number;
    content: string;
    created_at: number;
  };

  type getAdsDetailParams = {
    id?: number;
  };

  type getAdsListParams = {
    page: number;
    search?: string;
    size: number;
    status?: number;
  };

  type GetAdsListResponse = {
    total: number;
    list: Ads[];
  };

  type getAnnouncementDetailParams = {
    id: number;
  };

  type getAnnouncementListParams = {
    page: number;
    pinned?: boolean;
    popup?: boolean;
    search?: string;
    show?: boolean;
    size: number;
  };

  type GetAnnouncementListResponse = {
    total: number;
    list: Announcement[];
  };

  type getApplicationPreviewParams = {
    id?: string | number;
  };

  type getApplicationSubscribeApplicationListParams = {
    page: number;
    size: number;
  };

  type getAuthMethodConfigParams = {
    method?: string;
  };

  type GetAuthMethodListResponse = {
    list: AuthMethodConfig[];
  };

  type GetBatchSendEmailTaskListResponse = {
    total: number;
    list: BatchSendEmailTask[];
  };

  type GetBatchSendEmailTaskStatusRequest = {
    id: string;
  };

  type GetBatchSendEmailTaskStatusResponse = {
    status: number;
    current: number;
    total: number;
    errors: string;
  };

  type getCouponListParams = {
    page: number;
    search?: string;
    size: number;
    subscribe?: number;
  };

  type GetCouponListResponse = {
    total: number;
    list: Coupon[];
  };

  type GetDetailRequest = {
    id: string;
  };

  type getDocumentDetailParams = {
    id: number;
  };

  type getDocumentListParams = {
    page: number;
    search?: string;
    size: number;
    tag?: string;
  };

  type GetDocumentListResponse = {
    total: number;
    list: Document[];
  };

  type getLogAdminListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    /** UserId narrows the trail to one administrator. */
    user_id?: number;
  };

  type getLogBalanceListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
  };

  type getLogCommissionListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
  };

  type getLogEmailListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
  };

  type getLogGiftListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
  };

  type getLogLoginListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
  };

  type getLogMessageListParams = {
    page: number;
    search?: string;
    size: number;
    type: 10 | 11;
  };

  type getLogMobileListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
  };

  type getLogOrderListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
  };

  type getLogPaymentUnmatchedListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    /** UserId narrows the list to one payer. */
    user_id?: number;
  };

  type getLogRegisterListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
  };

  type getLogServerTrafficListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    server_id?: number;
    size: number;
    start_date?: string;
  };

  type getLogSubscribeListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
    user_subscribe_id?: number;
  };

  type getLogSubscribeResetListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_subscribe_id?: number;
  };

  type getLogSubscribeTrafficListParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    size: number;
    start_date?: string;
    user_id?: number;
    user_subscribe_id?: number;
  };

  type getLogTrafficDetailsParams = {
    date?: string;
    end_date?: string;
    page: number;
    search?: string;
    server_id?: number;
    size: number;
    start_date?: string;
    subscribe_id?: number;
    user_id?: number;
  };

  type getMarketingEmailBatchListParams = {
    page?: number;
    scope?: 1 | 2 | 3 | 4 | 5;
    size?: number;
    status?: 0 | 1 | 2 | 3 | 4 | 5;
  };

  type getMarketingQuotaListParams = {
    page?: number;
    size?: number;
    status?: 0 | 1 | 2 | 3 | 4 | 5;
  };

  type GetMessageLogListResponse = {
    total: number;
    list: MessageLog[];
  };

  type GetNodeMultiplierResponse = {
    periods: TimePeriod[];
  };

  type getOrderListParams = {
    page: number;
    search?: string;
    size: number;
    status?: number;
    subscribe_id?: string | number;
    user_id?: string | number;
  };

  type GetOrderListResponse = {
    total: number;
    list: Order[];
  };

  type getPaymentListParams = {
    enable?: boolean;
    page: number;
    platform?: string;
    search?: string;
    size: number;
  };

  type GetPaymentMethodListResponse = {
    total: number;
    list: PaymentMethodDetail[];
  };

  type GetPreSendEmailCountRequest = {
    scope: number;
    register_start_time?: number;
    register_end_time?: number;
    additional?: string;
  };

  type GetPreSendEmailCountResponse = {
    count: number;
  };

  type getServerListParams = {
    page: number;
    search?: string;
    size: number;
  };

  type getServerNodeConfigParams = {
    server_id: number;
  };

  type GetServerNodeConfigResponse = {
    global: ServerNodeConfigValues;
    override: ServerNodeConfigOverride;
    effective: ServerNodeConfigValues;
  };

  type getServerNodeListParams = {
    page: number;
    search?: string;
    size: number;
  };

  type getServerProtocolsParams = {
    id?: number;
  };

  type GetServerProtocolsResponse = {
    protocols: Protocol[];
  };

  type GetSubscribeApplicationListResponse = {
    total: number;
    list: SubscribeApplication[];
  };

  type getSubscribeDetailsParams = {
    id: number;
  };

  type GetSubscribeGroupListResponse = {
    list: SubscribeGroup[];
    total: number;
  };

  type getSubscribeListParams = {
    language?: string;
    page: number;
    search?: string;
    size: number;
  };

  type GetSubscribeListResponse = {
    list: SubscribeItem[];
    total: number;
  };

  type getTicketDetailParams = {
    id: number;
  };

  type getTicketListParams = {
    page: number;
    search?: string;
    size: number;
    status?: number;
    user_id?: number;
  };

  type GetTicketListResponse = {
    total: number;
    list: Ticket[];
  };

  type getToolIpLocationParams = {
    ip: string;
  };

  type getUserAuthMethodParams = {
    user_id?: number;
  };

  type GetUserAuthMethodResponse = {
    auth_methods: UserAuthMethod[];
  };

  type getUserDetailParams = {
    id: number;
  };

  type getUserListParams = {
    page: number;
    search?: string;
    size: number;
    subscribe_id?: number;
    unscoped?: boolean;
    user_id?: number;
    user_subscribe_id?: number;
    user_subscribe_token?: string;
  };

  type GetUserListResponse = {
    total: number;
    list: User[];
  };

  type getUserLoginLogsParams = {
    page: number;
    size: number;
    user_id?: number;
  };

  type GetUserLoginLogsResponse = {
    list: UserLoginLog[];
    total: number;
  };

  type getUserSubscribeDetailParams = {
    id: string | number;
  };

  type getUserSubscribeDeviceParams = {
    page: number;
    size: number;
    subscribe_id?: number;
    user_id?: number;
  };

  type GetUserSubscribeDevicesResponse = {
    list: UserDevice[];
    total: number;
  };

  type GetUserSubscribeListResponse = {
    list: UserSubscribe[];
    total: number;
  };

  type getUserSubscribeLogsParams = {
    page: number;
    size: number;
    subscribe_id?: number;
    user_id?: number;
  };

  type GetUserSubscribeLogsResponse = {
    list: UserSubscribeLog[];
    total: number;
  };

  type getUserSubscribeParams = {
    page: number;
    size: number;
    user_id?: number;
  };

  type getUserSubscribeResetLogsParams = {
    page: number;
    size: number;
    user_subscribe_id?: number;
  };

  type GetUserSubscribeResetTrafficLogsResponse = {
    list: ResetSubscribeTrafficLog[];
    total: number;
  };

  type getUserSubscribeTrafficLogsParams = {
    end_time?: number;
    page: number;
    size: number;
    start_time?: number;
    subscribe_id?: number;
    user_id?: number;
  };

  type GetUserSubscribeTrafficLogsResponse = {
    list: TrafficLog[];
    total: number;
  };

  type getWithdrawalListParams = {
    page: number;
    size: number;
    status?: 0 | 1 | 2;
    user_id?: number;
  };

  type GetWithdrawalListResponse = {
    list: WithdrawalLog[];
    total: number;
  };

  type GiftLog = {
    type: number;
    user_id: string;
    order_no: string;
    subscribe_id: string;
    amount: number;
    balance: number;
    remark?: string;
    timestamp: number;
    actor_id?: number;
    client_ip?: string;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
    user_agent?: string;
  };

  type InviteConfig = {
    forced_invite: boolean;
    referral_percentage: number;
    only_first_purchase: boolean;
    withdrawal_method?: string;
  };

  type KickOfflineRequest = {
    id: string;
  };

  type LoginLog = {
    user_id: string;
    method: string;
    login_ip: string;
    user_agent: string;
    success: boolean;
    timestamp: number;
    actor_id?: number;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
  };

  type LogResponse = {
    list: Record<string, any>;
  };

  type LogSetting = {
    auto_clear: boolean;
    clear_days: number;
  };

  type MessageLog = {
    id: string;
    type: number;
    platform: string;
    to: string;
    subject: string;
    content: Record<string, any>;
    status: number;
    created_at: number;
    actor_id?: number;
    client_ip?: string;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
    user_agent?: string;
  };

  type Node = {
    id: string;
    name: string;
    tags: string[];
    port: number;
    address: string;
    server_id: string;
    protocol: string;
    protocol_id: string;
    enabled: boolean;
    node_type?: string;
    is_hidden?: boolean;
    sort?: number;
    node_group_id?: string;
    node_group_ids?: string[];
    created_at: number;
    updated_at: number;
  };

  type NodeConfig = {
    node_secret: string;
    node_pull_interval: number;
    node_push_interval: number;
    traffic_report_threshold: number;
    ip_strategy: string;
    dns: NodeDNS[];
    block: string[];
    outbound: NodeOutbound[];
  };

  type NodeDNS = {
    proto: string;
    address: string;
    domains: string[];
    server_name?: string;
  };

  type NodeOutbound = {
    name: string;
    protocol: string;
    address: string;
    port: number;
    user?: string;
    password: string;
    uuid?: string;
    cipher?: string;
    security?: string;
    sni?: string;
    allow_insecure?: boolean;
    fingerprint?: string;
    transport?: string;
    host?: string;
    path?: string;
    service_name?: string;
    flow?: string;
    uot?: boolean;
    uot_version?: number;
    congestion_controller?: string;
    udp_stream?: boolean;
    reduce_rtt?: boolean;
    heartbeat?: number;
    reality_public_key?: string;
    reality_short_id?: string;
    spider_x?: string;
    settings?: string;
    stream_settings?: string;
    rules: string[];
    alpn?: string[];
    encryption?: string;
    encryption_client_padding?: string;
    encryption_mode?: string;
    encryption_password?: string;
    encryption_rtt?: string;
    encryption_ticket?: string;
    multiplex?: string;
    plugin?: string;
    plugin_opts?: any;
    xhttp_extra?: string;
    xhttp_mode?: string;
  };

  type Order = {
    id: string;
    user_id: string;
    order_no: string;
    type: number;
    quantity: number;
    price: number;
    amount: number;
    gift_amount: number;
    discount: number;
    coupon: string;
    coupon_discount: number;
    commission?: number;
    payment: PaymentMethod;
    fee_amount: number;
    trade_no: string;
    status: number;
    subscribe_id: string;
    created_at: number;
    updated_at: number;
    user_subscribe_id?: number;
  };

  type OrderLog = {
    actor_id: number;
    amount: number;
    client_ip: string;
    coupon_discount: number;
    discount: number;
    fee_amount: number;
    gift_amount: number;
    id: number;
    ip_as_organization: string;
    ip_asn: number;
    ip_city: string;
    ip_country: string;
    ip_country_code: string;
    ip_region: string;
    method: string;
    order_no: string;
    order_type: number;
    payment_id: number;
    price: number;
    quantity: number;
    source: string;
    subscribe_id: number;
    timestamp: number;
    user_agent: string;
    user_id: number;
  };

  type OrdersStatistics = {
    date?: string;
    amount_total: number;
    new_order_amount: number;
    renewal_order_amount: number;
    list?: OrdersStatistics[];
  };

  type PaymentConfig = {
    id: string;
    name: string;
    platform: string;
    description: string;
    icon?: string;
    domain?: string;
    config: Record<string, any>;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    sort?: number;
    enable: boolean;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
  };

  type PaymentMethod = {
    id: string;
    name: string;
    platform: string;
    description: string;
    icon: string;
    fee_mode: number;
    fee_percent: number;
    fee_amount: number;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
    sort?: number;
  };

  type PaymentMethodDetail = {
    id: string;
    name: string;
    platform: string;
    description: string;
    icon: string;
    domain: string;
    config: Record<string, any>;
    fee_mode: number;
    fee_percent: number;
    fee_amount: number;
    sort?: number;
    enable: boolean;
    notify_url: string;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
  };

  type PlatformInfo = {
    platform: string;
    platform_url: string;
    platform_field_description: Record<string, any>;
  };

  type PlatformResponse = {
    list: PlatformInfo[];
  };

  type PreViewNodeMultiplierResponse = {
    current_time: string;
    ratio: number;
  };

  type PreviewSubscribeTemplateResponse = {
    template: string;
  };

  type PrivacyPolicyConfig = {
    privacy_policy: string;
  };

  type Protocol = {
    id?: string;
    name?: string;
    ssr_protocol?: string;
    cert_pin_sha256?: string;
    type: string;
    port: number;
    enable: boolean;
    security?: string;
    sni?: string;
    allow_insecure?: boolean;
    fingerprint?: string;
    reality_server_addr?: string;
    reality_server_port?: number;
    reality_private_key?: string;
    reality_public_key?: string;
    reality_short_id?: string;
    transport?: string;
    host?: string;
    path?: string;
    service_name?: string;
    cipher?: string;
    server_key?: string;
    flow?: string;
    hop_ports?: string;
    hop_interval?: number;
    obfs_password?: string;
    disable_sni?: boolean;
    reduce_rtt?: boolean;
    udp_relay_mode?: string;
    congestion_controller?: string;
    multiplex?: string;
    padding_scheme?: string;
    up_mbps?: number;
    down_mbps?: number;
    obfs?: string;
    obfs_host?: string;
    obfs_path?: string;
    xhttp_mode?: string;
    xhttp_extra?: string;
    encryption?: string;
    encryption_mode?: string;
    encryption_rtt?: string;
    encryption_ticket?: string;
    encryption_server_padding?: string;
    encryption_private_key?: string;
    encryption_client_padding?: string;
    encryption_password?: string;
    ratio?: number;
    cert_mode?: string;
    cert_dns_provider?: string;
    cert_dns_env?: string;
    accept_proxy_protocol?: boolean;
    alpn?: string[];
    ech_enable?: boolean;
    ech_server_name?: string;
    heartbeat?: number;
    mode?: string;
    network?: string;
    obfs_param?: string;
    plugin?: string;
    plugin_opts?: any;
    protocol?: string;
    protocol_param?: string;
    quic_congestion_control?: string;
    traffic_pattern?: string;
    uot?: boolean;
    uot_version?: number;
    user_hint_is_mandatory?: boolean;
    version?: number;
  };

  type QueryIPLocationResponse = {
    country: string;
    region?: string;
    city: string;
  };

  type QueryNodeTagResponse = {
    tags: string[];
  };

  type QueryQuotaTaskListResponse = {
    total: number;
    list: QuotaTask[];
  };

  type QueryQuotaTaskPreCountRequest = {
    subscribers: string[];
    is_active: boolean;
    start_time: number;
    end_time: number;
  };

  type QueryQuotaTaskPreCountResponse = {
    count: number;
  };

  type QuotaTask = {
    id: string;
    subscribers: string[];
    is_active: boolean;
    start_time: number;
    end_time: number;
    reset_traffic: boolean;
    days: number;
    gift_type: number;
    gift_value: number;
    objects: string[];
    status: number;
    total: number;
    current: number;
    errors: string;
    created_at: number;
    updated_at: number;
  };

  type RegisterConfig = {
    stop_register: boolean;
    enable_trial: boolean;
    trial_subscribe: string;
    trial_time: number;
    trial_time_unit: string;
    enable_ip_register_limit: boolean;
    ip_register_limit: number;
    ip_register_limit_duration: number;
    device_limit: number;
  };

  type RegisterLog = {
    user_id: string;
    auth_method: string;
    identifier: string;
    register_ip: string;
    user_agent: string;
    timestamp: number;
    actor_id?: number;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
  };

  type ResetAllSubscribeTokenResponse = {
    success: boolean;
  };

  type ResetSortRequest = {
    sort: SortItem[];
  };

  type ResetSubscribeLog = {
    type: number;
    user_id: string;
    user_subscribe_id: string;
    order_no?: string;
    timestamp: number;
    actor_id?: number;
    client_ip?: string;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
    user_agent?: string;
  };

  type ResetSubscribeTrafficLog = {
    id: string;
    type: number;
    user_subscribe_id: string;
    order_no?: string;
    timestamp: number;
    actor_id?: number;
    client_ip?: string;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
    user_agent?: string;
  };

  type ResetUserSubscribeTokenRequest = {
    user_subscribe_id: any;
  };

  type ResetUserSubscribeTrafficRequest = {
    user_subscribe_id: string;
  };

  type ResponseSuccessBean = {
    code: number;
    msg: string;
  };

  type RevenueStatisticsResponse = {
    today: OrdersStatistics;
    monthly: OrdersStatistics;
    all: OrdersStatistics;
  };

  type ReviewWithdrawalRequest = {
    id: number;
    reason?: string;
    status?: 1 | 2;
  };

  type Server = {
    id: string;
    name: string;
    country: string;
    city: string;
    address: string;
    sort: number;
    protocols: Protocol[];
    last_reported_at: number;
    status: ServerStatus;
    created_at: number;
    updated_at: number;
  };

  type ServerNodeConfigOverride = {
    inherit_ip_strategy: boolean;
    ip_strategy: string;
    inherit_dns: boolean;
    dns: NodeDNS[];
    inherit_block: boolean;
    block: string[];
    inherit_outbound: boolean;
    outbound: NodeOutbound[];
  };

  type ServerNodeConfigValues = {
    ip_strategy: string;
    dns: NodeDNS[];
    block: string[];
    outbound: NodeOutbound[];
  };

  type ServerOnlineIP = {
    ip: string;
    protocol: string;
  };

  type ServerOnlineUser = {
    ip: ServerOnlineIP[];
    user_id: string;
    subscribe: string;
    subscribe_id: string;
    traffic: number;
    expired_at: number;
  };

  type ServerStatus = {
    cpu: number;
    mem: number;
    disk: number;
    protocol: string;
    online: ServerOnlineUser[];
    status: string;
  };

  type ServerTotalDataResponse = {
    online_users: number;
    online_servers: number;
    offline_servers: number;
    today_upload: number;
    today_download: number;
    monthly_upload: number;
    monthly_download: number;
    updated_at: number;
    server_traffic_ranking_today: ServerTrafficData[];
    server_traffic_ranking_yesterday: ServerTrafficData[];
    user_traffic_ranking_today: UserTrafficData[];
    user_traffic_ranking_yesterday: UserTrafficData[];
  };

  type ServerTrafficData = {
    server_id: string;
    name: string;
    upload: number;
    download: number;
  };

  type ServerTrafficLog = {
    server_id: string;
    upload: number;
    download: number;
    total: number;
    date: string;
    details: boolean;
  };

  type SetNodeMultiplierRequest = {
    periods: TimePeriod[];
  };

  type SiteConfig = {
    host: string;
    site_name: string;
    site_desc: string;
    site_logo: string;
    keywords: string;
    custom_html: string;
    custom_data: string;
  };

  type SortItem = {
    id: string;
    sort: number;
  };

  type StopBatchSendEmailTaskRequest = {
    id: string;
  };

  type Subscribe = {
    id: string;
    name: string;
    language: string;
    description: string;
    unit_price: number;
    unit_time: string;
    discount: SubscribeDiscount[];
    replacement: number;
    inventory: number;
    traffic: number;
    traffic_unlimited: boolean;
    speed_limit: number;
    device_limit: number;
    quota: number;
    nodes: number[];
    node_tags: string[];
    node_group_ids?: string[];
    node_group_id?: string;
    show: boolean;
    sell: boolean;
    sort: number;
    deduction_ratio: number;
    allow_deduction: boolean;
    reset_cycle: number;
    renewal_reset: boolean;
    show_original_price: boolean;
    created_at: number;
    updated_at: number;
  };

  type SubscribeApplication = {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    scheme?: string;
    user_agent: string;
    is_default: boolean;
    template: string;
    output_format: string;
    download_link?: DownloadLink;
    created_at: number;
    updated_at: number;
    default_params?: string;
  };

  type SubscribeConfig = {
    single_model: boolean;
    subscribe_path: string;
    subscribe_domain: string;
    pan_domain: boolean;
    user_agent_limit: boolean;
    user_agent_list: string;
    show_tutorial?: boolean;
    profile_update_interval?: number;
    profile_web_page_url?: string;
  };

  type SubscribeDiscount = {
    quantity: number;
    discount: number;
  };

  type SubscribeGroup = {
    id: string;
    name: string;
    description: string;
    created_at: number;
    updated_at: number;
  };

  type SubscribeItem = {
    id?: string;
    name?: string;
    language?: string;
    description?: string;
    unit_price?: number;
    unit_time?: string;
    discount?: SubscribeDiscount[];
    replacement?: number;
    inventory?: number;
    traffic?: number;
    traffic_unlimited?: boolean;
    speed_limit?: number;
    device_limit?: number;
    quota?: number;
    nodes?: number[];
    node_tags?: string[];
    node_group_ids?: string[];
    node_group_id?: string;
    show?: boolean;
    sell?: boolean;
    sort?: number;
    deduction_ratio?: number;
    allow_deduction?: boolean;
    reset_cycle?: number;
    renewal_reset?: boolean;
    show_original_price?: boolean;
    created_at?: number;
    updated_at?: number;
    sold: number;
  };

  type SubscribeLog = {
    user_id: string;
    token: string;
    user_agent: string;
    client_ip: string;
    user_subscribe_id: string;
    timestamp: number;
    actor_id?: number;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
  };

  type SubscribeSortRequest = {
    sort: SortItem[];
  };

  type TestEmailSendRequest = {
    email: string;
  };

  type TestSmsSendRequest = {
    area_code: string;
    telephone: string;
  };

  type Ticket = {
    id: string;
    title: string;
    description: string;
    user_id: string;
    follow?: Follow[];
    status: number;
    created_at: number;
    updated_at: number;
  };

  type TicketWaitRelpyResponse = {
    count: number;
  };

  type TimePeriod = {
    start_time: string;
    end_time: string;
    multiplier: number;
  };

  type ToggleNodeStatusRequest = {
    id: string;
    enable: boolean;
  };

  type ToggleUserSubscribeStatusRequest = {
    user_subscribe_id: any;
  };

  type TosConfig = {
    tos_content: string;
  };

  type TrafficLog = {
    id: string;
    server_id: string;
    user_id: string;
    subscribe_id: string;
    download: number;
    upload: number;
    timestamp: number;
  };

  type TrafficLogDetails = {
    id: string;
    server_id: string;
    user_id: string;
    subscribe_id: string;
    download: number;
    upload: number;
    timestamp: number;
  };

  type UnmatchedPaymentLog = {
    actor_id: number;
    amount: number;
    client_ip: string;
    created_at: number;
    currency: string;
    id: number;
    ip_as_organization: string;
    ip_asn: number;
    ip_city: string;
    ip_country: string;
    ip_country_code: string;
    ip_region: string;
    order_no: string;
    platform: string;
    reason: string;
    timestamp: number;
    trade_no: string;
    user_agent: string;
    user_id: number;
  };

  type UpdateAdsRequest = {
    id: string;
    title: string;
    type: string;
    content: string;
    description: string;
    target_url: string;
    start_time: number;
    end_time: number;
    status: number;
  };

  type UpdateAnnouncementRequest = {
    id: string;
    title: string;
    content: string;
    show: boolean;
    pinned: boolean;
    popup: boolean;
  };

  type UpdateAuthMethodConfigRequest = {
    id: string;
    method: string;
    config: Record<string, any>;
    enabled: boolean;
  };

  type UpdateCouponRequest = {
    id: string;
    name: string;
    code?: string;
    count?: number;
    type: number;
    discount: number;
    start_time: number;
    expire_time: number;
    user_limit?: number;
    subscribe?: string[];
    used_count?: number;
    enable?: boolean;
  };

  type UpdateDocumentRequest = {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    show: boolean;
  };

  type UpdateNodeRequest = {
    id: string;
    name: string;
    tags?: string[];
    port: number;
    address: string;
    server_id?: string;
    protocol?: string;
    protocol_id?: string;
    enabled?: boolean;
    node_type?: string;
    is_hidden?: boolean;
    node_group_ids?: string[];
  };

  type UpdateOrderStatusRequest = {
    id: string;
    status: number;
    payment_id?: string;
    trade_no?: string;
  };

  type UpdatePaymentMethodRequest = {
    id: string;
    name: string;
    platform: string;
    description: string;
    icon?: string;
    domain?: string;
    config: Record<string, any>;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    sort?: number;
    enable: boolean;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
  };

  type UpdateServerNodeConfigRequest = {
    server_id: number;
    inherit_ip_strategy: boolean;
    ip_strategy: string;
    inherit_dns: boolean;
    dns: NodeDNS[];
    inherit_block: boolean;
    block: string[];
    inherit_outbound: boolean;
    outbound: NodeOutbound[];
  };

  type UpdateServerRequest = {
    id: string;
    name: string;
    country?: string;
    city?: string;
    address: string;
    sort?: number;
    protocols: Protocol[];
  };

  type UpdateSubscribeApplicationRequest = {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    scheme?: string;
    user_agent: string;
    is_default: boolean;
    template: string;
    output_format: string;
    download_link?: DownloadLink;
    default_params?: string;
  };

  type UpdateSubscribeGroupRequest = {
    id: string;
    name: string;
    description: string;
  };

  type UpdateSubscribeRequest = {
    id: string;
    name: string;
    language: string;
    description: string;
    unit_price: number;
    unit_time: string;
    discount: SubscribeDiscount[];
    replacement: number;
    inventory: number;
    traffic: number;
    traffic_unlimited: boolean;
    speed_limit: number;
    device_limit: number;
    quota: number;
    nodes: number[];
    node_tags: string[];
    show: boolean;
    sell: boolean;
    sort: number;
    deduction_ratio: number;
    allow_deduction: boolean;
    reset_cycle: number;
    renewal_reset: boolean;
    show_original_price: boolean;
  };

  type UpdateTicketStatusRequest = {
    id: string;
    status: number;
  };

  type UpdateUserAuthMethodRequest = {
    user_id: string;
    auth_type: string;
    auth_identifier: string;
  };

  type UpdateUserBasiceInfoRequest = {
    user_id: string;
    password: string;
    avatar: string;
    balance: number;
    commission: number;
    referral_percentage: number;
    only_first_purchase: boolean;
    gift_amount: number;
    telegram: number;
    refer_code: string;
    referer_id: string;
    enable: boolean;
    is_admin: boolean;
  };

  type UpdateUserNotifySettingRequest = {
    user_id: string;
    enable_balance_notify: boolean;
    enable_login_notify: boolean;
    enable_subscribe_notify: boolean;
    enable_trade_notify: boolean;
  };

  type UpdateUserSubscribeRequest = {
    user_subscribe_id: string;
    subscribe_id: string;
    traffic: number;
    traffic_unlimited: boolean;
    expired_at: number;
    upload: number;
    download: number;
  };

  type User = {
    id: string;
    avatar: string;
    balance: number;
    commission: number;
    referral_percentage: number;
    only_first_purchase: boolean;
    gift_amount: number;
    telegram: number;
    refer_code: string;
    referer_id: string;
    enable: boolean;
    is_admin?: boolean;
    enable_balance_notify: boolean;
    enable_login_notify: boolean;
    enable_subscribe_notify: boolean;
    enable_trade_notify: boolean;
    user_group_id: string;
    group_locked: boolean;
    auth_methods: UserAuthMethod[];
    user_devices: UserDevice[];
    rules: string[];
    created_at: number;
    updated_at: number;
    deleted_at?: number;
  };

  type UserAuthMethod = {
    auth_type: string;
    auth_identifier: string;
    verified: boolean;
  };

  type UserDevice = {
    id: string;
    ip: string;
    identifier: string;
    user_agent: string;
    online: boolean;
    enabled: boolean;
    created_at: number;
    updated_at: number;
  };

  type UserLoginLog = {
    id: string;
    user_id: string;
    login_ip: string;
    user_agent: string;
    success: boolean;
    timestamp: number;
    actor_id?: number;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
  };

  type UserStatistics = {
    date?: string;
    register: number;
    new_order_users: number;
    renewal_order_users: number;
    list?: UserStatistics[];
  };

  type UserStatisticsResponse = {
    today: UserStatistics;
    monthly: UserStatistics;
    all: UserStatistics;
  };

  type UserSubscribe = {
    id: string;
    user_id: string;
    order_id: string;
    subscribe_id: string;
    subscribe: Subscribe;
    start_time: number;
    expire_time: number;
    finished_at: number;
    reset_time: number;
    traffic: number;
    traffic_unlimited: boolean;
    download: number;
    upload: number;
    token: string;
    status: number;
    short: string;
    created_at: number;
    updated_at: number;
    entitlement_source?: string;
  };

  type UserSubscribeDetail = {
    id: string;
    user_id: string;
    user: User;
    order_id: string;
    subscribe_id: string;
    subscribe: Subscribe;
    start_time: number;
    expire_time: number;
    reset_time: number;
    traffic: number;
    traffic_unlimited: boolean;
    download: number;
    upload: number;
    token: string;
    status: number;
    created_at: number;
    updated_at: number;
    entitlement_source?: string;
  };

  type UserSubscribeLog = {
    id: string;
    user_id: string;
    user_subscribe_id: string;
    token: string;
    ip: string;
    user_agent: string;
    timestamp: number;
    actor_id?: number;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
  };

  type UserSubscribeTrafficLog = {
    subscribe_id: string;
    user_id: string;
    upload: number;
    download: number;
    total: number;
    date: string;
    details: boolean;
  };

  type UserTrafficData = {
    sid: number;
    upload: number;
    download: number;
    uid?: number;
  };

  type VerifyCodeConfig = {
    verify_code_expire_time: number;
    verify_code_limit: number;
    verify_code_interval: number;
  };

  type VerifyConfig = {
    turnstile_site_key: string;
    turnstile_secret: string;
    enable_login_verify: boolean;
    enable_register_verify: boolean;
    enable_reset_password_verify: boolean;
  };

  type VersionResponse = {
    version: string;
  };

  type WithdrawalLog = {
    amount: number;
    content: string;
    created_at: number;
    id: number;
    reason: string;
    status: number;
    updated_at: number;
    user_id: number;
  };

  type AlipayNotifyResponse = {
    return_code: string;
  };

  type AnyTLS = {
    port: number;
    security_config: SecurityConfig;
  };

  type Application = {
    id: string;
    icon: string;
    name: string;
    description: string;
    subscribe_type: string;
  };

  type ApplicationPlatform = {
    ios?: ApplicationVersion[];
    macos?: ApplicationVersion[];
    linux?: ApplicationVersion[];
    android?: ApplicationVersion[];
    windows?: ApplicationVersion[];
    harmony?: ApplicationVersion[];
  };

  type ApplicationResponse = {
    applications: ApplicationResponseInfo[];
  };

  type ApplicationResponseInfo = {
    id: string;
    name: string;
    icon: string;
    description: string;
    subscribe_type: string;
    platform: ApplicationPlatform;
  };

  type ApplicationVersion = {
    id: string;
    url: string;
    version: string;
    description: string;
    is_default: boolean;
  };

  type AppUserSubcbribe = {
    id: string;
    name: string;
    upload: number;
    traffic: number;
    download: number;
    device_limit: number;
    start_time: string;
    expire_time: string;
    list: AppUserSubscbribeNode[];
  };

  type AppUserSubscbribeNode = {
    id: string;
    name: string;
    uuid: string;
    protocol: string;
    relay_mode: string;
    relay_node: string;
    server_addr: string;
    speed_limit: number;
    tags: string[];
    traffic: number;
    traffic_ratio: number;
    upload: number;
    config: string;
    country: string;
    city: string;
    latitude: string;
    longitude: string;
    created_at: number;
    download: number;
    port: number;
  };

  type AuthConfig = {
    mobile: MobileAuthenticateConfig;
    email: EmailAuthticateConfig;
    device: DeviceAuthticateConfig;
    register: PubilcRegisterConfig;
  };

  type CheckoutOrderRequest = {
    orderNo: string;
    returnUrl?: string;
  };

  type CheckoutOrderResponse = {
    type: string;
    checkout_url?: string;
    stripe?: StripePayment;
  };

  type CloseOrderRequest = {
    orderNo: string;
  };

  type CreateRedemptionCodeRequest = {
    total_count: number;
    subscribe_plan: string;
    unit_time: string;
    quantity: number;
    batch_count: number;
  };

  type UpdateRedemptionCodeRequest = {
    id: string;
    total_count?: number;
    subscribe_plan?: string;
    unit_time?: string;
    quantity?: number;
    status?: number;
  };

  type ToggleRedemptionCodeStatusRequest = {
    id: string;
    status: number;
  };

  type DeleteRedemptionCodeRequest = {
    id: string;
  };

  type BatchDeleteRedemptionCodeRequest = {
    ids: string[];
  };

  type GetRedemptionCodeListRequest = {
    page: number;
    size: number;
    subscribe_plan?: string;
    unit_time?: string;
    code?: string;
  };

  type GetRedemptionCodeListResponse = {
    total: number;
    list: RedemptionCode[];
  };

  type GetRedemptionRecordListRequest = {
    page: number;
    size: number;
    user_id?: string;
    code_id?: string;
  };

  type GetRedemptionRecordListResponse = {
    total: number;
    list: RedemptionRecord[];
  };

  type RedemptionCode = {
    id: string;
    code: string;
    total_count: number;
    used_count: number;
    subscribe_plan: string;
    unit_time: string;
    quantity: number;
    status: number;
    created_at: number;
    updated_at: number;
  };

  type RedemptionRecord = {
    id: string;
    redemption_code_id: string;
    user_id: string;
    subscribe_id: string;
    unit_time: string;
    quantity: number;
    redeemed_at: number;
    created_at: number;
  };

  type DeleteUserParams = {
    id: string;
  };

  type DeviceAuthticateConfig = {
    enable: boolean;
    show_ads: boolean;
    enable_security: boolean;
    only_real_device: boolean;
  };

  type EmailAuthticateConfig = {
    enable: boolean;
    enable_verify: boolean;
    enable_domain_suffix: boolean;
    domain_suffix_list: string;
  };

  type EPayNotifyRequest = {
    pid: number;
    trade_no: string;
    out_trade_no: string;
    type: string;
    name: string;
    money: string;
    trade_status: string;
    param: string;
    sign: string;
    sign_type: string;
  };

  type FilterBalanceLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterBalanceLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterCommissionLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterCommissionLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterEmailLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
  };

  type FilterGiftLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterGiftLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterLoginLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterLoginLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
  };

  type FilterMobileLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
  };

  type FilterNodeListParams = {
    page: number;
    size: number;
    search?: string;
    node_group_id?: string;
  };

  type FilterNodeListRequest = {
    page: number;
    size: number;
    search?: string;
    node_group_id?: string;
  };

  type FilterRegisterLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterRegisterLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
  };

  type FilterResetSubscribeLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_subscribe_id?: string;
  };

  type FilterResetSubscribeLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_subscribe_id?: string;
  };

  type FilterServerListParams = {
    page: number;
    size: number;
    search?: string;
  };

  type FilterServerListRequest = {
    page: number;
    size: number;
    search?: string;
  };

  type FilterServerTrafficLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    server_id?: string;
  };

  type FilterServerTrafficLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    server_id?: string;
  };

  type FilterSubscribeLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
    user_subscribe_id?: string;
  };

  type FilterSubscribeLogRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
    user_subscribe_id?: string;
  };

  type FilterSubscribeTrafficRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    user_id?: string;
    user_subscribe_id?: string;
  };

  type FilterTrafficLogDetailsParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    server_id?: string;
    subscribe_id?: string;
    user_id?: string;
  };

  type FilterTrafficLogDetailsRequest = {
    page?: number;
    size?: number;
    date?: string;
    search?: string;
    server_id?: string;
    subscribe_id?: string;
    user_id?: string;
  };

  type FilterUserSubscribeTrafficLogParams = {
    page: number;
    size: number;
    date?: string;
    search?: string;
    user_id?: string;
    user_subscribe_id?: string;
  };

  type GetAdsDetailParams = {
    id: string;
  };

  type GetAdsDetailRequest = {
    id: string;
  };

  type GetAdsListParams = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type GetAdsListRequest = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type GetAnnouncementListParams = {
    page: number;
    size: number;
    show?: boolean;
    pinned?: boolean;
    popup?: boolean;
    search?: string;
  };

  type GetAnnouncementListRequest = {
    page: number;
    size: number;
    show?: boolean;
    pinned?: boolean;
    popup?: boolean;
    search?: string;
  };

  type GetAnnouncementParams = {
    id: string;
  };

  type GetAnnouncementRequest = {
    id: string;
  };

  type GetAuthMethodConfigParams = {
    method: string;
  };

  type GetAuthMethodConfigRequest = {
    method: string;
  };

  type GetAvailablePaymentMethodsResponse = {
    list: PaymentMethod[];
  };

  type GetBatchSendEmailTaskListParams = {
    page: number;
    size: number;
    scope?: number;
    status?: number;
  };

  type GetBatchSendEmailTaskListRequest = {
    page: number;
    size: number;
    scope?: number;
    status?: number;
  };

  type GetCouponListParams = {
    page: number;
    size: number;
    subscribe?: number;
    search?: string;
  };

  type GetCouponListRequest = {
    page: number;
    size: number;
    subscribe?: number;
    search?: string;
  };

  type GetDocumentDetailRequest = {
    id: string;
  };

  type GetDocumentListParams = {
    page: number;
    size: number;
    tag?: string;
    search?: string;
  };

  type GetDocumentListRequest = {
    page: number;
    size: number;
    tag?: string;
    search?: string;
  };

  type GetMessageLogListParams = {
    page: number;
    size: number;
    type: number;
    search?: string;
  };

  type GetMessageLogListRequest = {
    page: number;
    size: number;
    type: number;
    search?: string;
  };

  type GetOrderListParams = {
    page: number;
    size: number;
    user_id?: string;
    status?: number;
    subscribe_id?: string;
    search?: string;
  };

  type GetOrderListRequest = {
    page: number;
    size: number;
    user_id?: string;
    status?: number;
    subscribe_id?: string;
    search?: string;
  };

  type GetPaymentMethodListParams = {
    page: number;
    size: number;
    platform?: string;
    search?: string;
    enable?: boolean;
  };

  type GetPaymentMethodListRequest = {
    page: number;
    size: number;
    platform?: string;
    search?: string;
    enable?: boolean;
  };

  type GetServerProtocolsParams = {
    id: string;
  };

  type GetServerProtocolsRequest = {
    id: string;
  };

  type GetServerNodeConfigParams = {
    server_id: number;
  };

  type GetServerNodeConfigRequest = {
    server_id: number;
  };

  type GetSubscribeApplicationListParams = {
    page: number;
    size: number;
  };

  type GetSubscribeApplicationListRequest = {
    page: number;
    size: number;
  };

  type GetSubscribeDetailsParams = {
    id: string;
  };

  type GetSubscribeDetailsRequest = {
    id: string;
  };

  type GetSubscribeListParams = {
    page: number;
    size: number;
    language?: string;
    search?: string;
    node_group_id?: string;
  };

  type GetSubscribeListRequest = {
    page: number;
    size: number;
    language?: string;
    search?: string;
    node_group_id?: string;
  };

  type GetTicketListParams = {
    page: number;
    size: number;
    user_id?: string;
    status?: number;
    search?: string;
  };

  type GetTicketListRequest = {
    page: number;
    size: number;
    user_id?: string;
    status?: number;
    search?: string;
  };

  type GetTicketParams = {
    id: string;
  };

  type GetTicketRequest = {
    id: string;
  };

  type GetUserAuthMethodRequest = {
    user_id: string;
  };

  type GetUserDetailParams = {
    id: string;
  };

  type GetUserListParams = {
    page: number;
    size: number;
    search?: string;
    user_id?: string;
    unscoped?: boolean;
    subscribe_id?: string;
    user_subscribe_id?: string;
    user_group_id?: number;
  };

  type GetUserListRequest = {
    page: number;
    size: number;
    search?: string;
    user_id?: string;
    unscoped?: boolean;
    subscribe_id?: string;
    user_subscribe_id?: string;
  };

  type GetUserLoginLogsParams = {
    page: number;
    size: number;
    user_id: string;
  };

  type GetUserLoginLogsRequest = {
    page: number;
    size: number;
    user_id: string;
  };

  type GetUserSubscribeByIdParams = {
    id: string;
  };

  type GetUserSubscribeByIdRequest = {
    id: string;
  };

  type GetUserSubscribeDevicesParams = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id: string;
  };

  type GetUserSubscribeDevicesRequest = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id: string;
  };

  type GetUserSubscribeListRequest = {
    page: number;
    size: number;
    user_id: string;
  };

  type GetUserSubscribeLogsParams = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id?: string;
  };

  type GetUserSubscribeLogsRequest = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id?: string;
  };

  type GetUserSubscribeParams = {
    page: number;
    size: number;
    user_id: string;
  };

  type GetUserSubscribeResetTrafficLogsParams = {
    page: number;
    size: number;
    user_subscribe_id: string;
  };

  type GetUserSubscribeResetTrafficLogsRequest = {
    page: number;
    size: number;
    user_subscribe_id: string;
  };

  type GetUserSubscribeTrafficLogsParams = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id: string;
    start_time: number;
    end_time: number;
  };

  type GetUserSubscribeTrafficLogsRequest = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id: string;
    start_time: number;
    end_time: number;
  };

  type HasMigrateSeverNodeResponse = {
    has_migrate: boolean;
  };

  type Hysteria2 = {
    port: number;
    hop_ports: string;
    hop_interval: number;
    obfs_password: string;
    security_config: SecurityConfig;
  };

  type MigrateServerNodeResponse = {
    succee: number;
    fail: number;
    message?: string;
  };

  type MobileAuthenticateConfig = {
    enable: boolean;
    enable_whitelist: boolean;
    whitelist: string[];
  };

  type ModuleConfig = {
    /** 通讯密钥 */
    secret: string;
    /** 服务名称 */
    service_name: string;
    /** 服务版本 */
    service_version: string;
  };

  type NodeRelay = {
    host: string;
    port: number;
    prefix: string;
  };

  type OrderDetail = {
    id: string;
    user_id: string;
    order_no: string;
    type: number;
    quantity: number;
    price: number;
    amount: number;
    gift_amount: number;
    discount: number;
    coupon: string;
    coupon_discount: number;
    commission?: number;
    payment: PaymentMethod;
    method: string;
    fee_amount: number;
    trade_no: string;
    status: number;
    subscribe_id: string;
    subscribe: Subscribe;
    created_at: number;
    updated_at: number;
  };

  type PreOrderResponse = {
    price: number;
    amount: number;
    discount: number;
    gift_amount: number;
    coupon: string;
    coupon_discount: number;
    fee_amount: number;
  };

  type PreRenewalOrderResponse = {
    orderNo: string;
  };

  type PreviewSubscribeTemplateParams = {
    id: string;
  };

  type PreviewSubscribeTemplateRequest = {
    id: string;
  };

  type PubilcRegisterConfig = {
    stop_register: boolean;
    enable_ip_register_limit: boolean;
    ip_register_limit: number;
    ip_register_limit_duration: number;
  };

  type PubilcVerifyCodeConfig = {
    verify_code_interval: number;
  };

  type PurchaseOrderRequest = {
    subscribe_id: string;
    quantity: number;
    payment?: string;
    coupon?: string;
  };

  type PurchaseOrderResponse = {
    order_no: string;
  };

  type QueryAnnouncementRequest = {
    page: number;
    size: number;
    pinned: boolean;
    popup: boolean;
  };

  type QueryAnnouncementResponse = {
    total: number;
    announcements: Announcement[];
  };

  type QueryDocumentDetailRequest = {
    id: string;
  };

  type QueryDocumentListResponse = {
    total: number;
    list: Document[];
  };

  type QueryIPLocationParams = {
    ip: string;
  };

  type QueryIPLocationRequest = {
    ip: string;
  };

  type QueryOrderDetailRequest = {
    order_no: string;
  };

  type QueryOrderListRequest = {
    page: number;
    size: number;
  };

  type QueryOrderListResponse = {
    total: number;
    list: OrderDetail[];
  };

  type QueryQuotaTaskListParams = {
    page: number;
    size: number;
    status?: number;
  };

  type QueryQuotaTaskListRequest = {
    page: number;
    size: number;
    status?: number;
  };

  type QueryQuotaTaskStatusRequest = {
    id: string;
  };

  type QueryQuotaTaskStatusResponse = {
    status: number;
    current: number;
    total: number;
    errors: string;
  };

  type QuerySubscribeGroupListResponse = {
    list: SubscribeGroup[];
    total: number;
  };

  type QuerySubscribeListResponse = {
    list: Subscribe[];
    total: number;
  };

  type QueryUserAffiliateCountResponse = {
    registers: number;
    total_commission: number;
  };

  type QueryUserAffiliateListRequest = {
    page: number;
    size: number;
  };

  type QueryUserAffiliateListResponse = {
    list: UserAffiliate[];
    total: number;
  };

  type RechargeOrderRequest = {
    amount: number;
    payment: string;
  };

  type RechargeOrderResponse = {
    order_no: string;
  };

  type RenewalOrderRequest = {
    user_subscribe_id: string;
    quantity: number;
    payment: string;
    coupon?: string;
  };

  type RenewalOrderResponse = {
    order_no: string;
  };

  type ResetTrafficOrderRequest = {
    user_subscribe_id: string;
    payment: string;
  };

  type ResetTrafficOrderResponse = {
    order_no: string;
  };

  type Response = {
    /** 状态码 */
    code?: number;
    /** 消息 */
    msg?: string;
    /** 数据 */
    data?: Record<string, any>;
  };

  type SecurityConfig = {
    sni: string;
    allow_insecure: boolean;
    fingerprint: string;
    reality_server_addr: string;
    reality_server_port: number;
    reality_private_key: string;
    reality_public_key: string;
    reality_short_id: string;
  };

  type ServerGroup = {
    id: string;
    name: string;
    description: string;
    created_at: number;
    updated_at: number;
  };

  type ServerRuleGroup = {
    id: string;
    icon: string;
    name: string;
    type: string;
    tags: string[];
    rules: string;
    enable: boolean;
    default: boolean;
    created_at: number;
    updated_at: number;
  };

  type Shadowsocks = {
    method: string;
    port: number;
    server_key: string;
  };

  type SiteCustomDataContacts = {
    email: string;
    telephone: string;
    address: string;
  };

  type StripePayment = {
    method: string;
    client_secret: string;
    publishable_key: string;
  };

  type SubscribeType = {
    subscribe_types: string[];
  };

  type TelegramConfig = {
    telegram_bot_token: string;
    telegram_group_url: string;
    telegram_notify: boolean;
    telegram_web_hook_domain: string;
  };

  type TransportConfig = {
    path: string;
    host: string;
    service_name: string;
  };

  type Trojan = {
    port: number;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type Tuic = {
    port: number;
    disable_sni: boolean;
    reduce_rtt: boolean;
    udp_relay_mode: string;
    congestion_controller: string;
    security_config: SecurityConfig;
  };

  type UpdateAnnouncementEnableRequest = {
    id: string;
    enable: boolean;
  };

  type UserAffiliate = {
    avatar: string;
    identifier: string;
    registered_at: number;
    enable: boolean;
  };

  type Vless = {
    port: number;
    flow: string;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type Vmess = {
    port: number;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type UserGroup = {
    id: string;
    name: string;
    description: string;
    sort: number;
    node_group_id?: number | null;
    for_calculation?: boolean;
    created_at: number;
    updated_at: number;
  };

  type NodeGroup = {
    id: string;
    name: string;
    type: string;
    description: string;
    sort: number;
    for_calculation: boolean;
    is_expired_group: boolean;
    expired_days_limit: number;
    max_traffic_gb_expired?: number;
    speed_limit: number;
    min_traffic_gb?: number;
    max_traffic_gb?: number;
    node_count?: number;
    created_at: number;
    updated_at: number;
  };

  type SubscribeGroupMapping = {
    subscribe_id: string;
    user_group_id: string;
    created_at: number;
    updated_at: number;
  };

  type SubscribeGroupMappingInfo = {
    id: string;
    subscribe_id: string;
    user_group_id: number;
    subscribe?: Subscribe;
    user_group?: UserGroup;
    created_at: number;
    updated_at: number;
  };

  type GroupHistory = {
    id: string;
    group_mode: string;
    trigger_type: string;
    total_users: number;
    success_count: number;
    failed_count: number;
    start_time?: number;
    end_time?: number;
    operator?: string;
    error_log?: string;
    created_at: number;
  };

  type GroupHistoryDetailItem = {
    id: string;
    history_id: string;
    user_group_id: string;
    node_group_id: string;
    user_count: number;
    node_count: number;
    user_data?: string;
    created_at: number;
  };

  type GroupHistoryDetail = {
    id: string;
    group_mode: string;
    trigger_type: string;
    total_users: number;
    success_count: number;
    failed_count: number;
    start_time?: number;
    end_time?: number;
    operator?: string;
    error_log?: string;
    created_at: number;
    config_snapshot?: {
      group_details?: GroupHistoryDetailItem[];
      config?: Record<string, unknown>;
    };
  };

  type RecalculationState = {
    state: string;
    progress: number;
    total: number;
  };

  type GetUserGroupListRequest = {
    page: number;
    size: number;
    group_id?: string;
  };

  type GetUserGroupListResponse = {
    total: number;
    list: UserGroup[];
  };

  type CreateUserGroupRequest = {
    name: string;
    description?: string;
    sort?: number;
    node_group_id?: number | null;
    for_calculation?: boolean | null;
  };

  type UpdateUserGroupRequest = {
    id: string;
    name?: string;
    description?: string;
    sort?: number;
    node_group_id?: number | null;
    for_calculation?: boolean | null;
  };

  type DeleteUserGroupRequest = {
    id: string;
  };

  type BindNodeGroupsRequest = {
    user_group_ids: number[];
    node_group_id?: number | null;
  };

  type GetNodeGroupListRequest = {
    page: number;
    size: number;
    group_id?: string;
  };

  type GetNodeGroupListResponse = {
    total: number;
    list: NodeGroup[];
  };

  type CreateNodeGroupRequest = {
    name: string;
    type?: string;
    description?: string;
    sort?: number;
    for_calculation?: boolean;
    is_expired_group?: boolean;
    expired_days_limit?: number;
    max_traffic_gb_expired?: number;
    speed_limit?: number;
    min_traffic_gb?: number;
    max_traffic_gb?: number;
  };

  type UpdateNodeGroupRequest = {
    id: string;
    name?: string;
    type?: string;
    description?: string;
    sort?: number;
    for_calculation?: boolean;
    is_expired_group?: boolean;
    expired_days_limit?: number;
    max_traffic_gb_expired?: number;
    speed_limit?: number;
    min_traffic_gb?: number;
    max_traffic_gb?: number;
  };

  type DeleteNodeGroupRequest = {
    id: string;
  };

  type GetSubscribeMappingRequest = {
    page: number;
    size: number;
    subscribe_id?: string;
    user_group_id?: number;
  };

  type GetSubscribeMappingResponse = {
    total: number;
    list: SubscribeGroupMappingInfo[];
  };

  type UpdateSubscribeMappingRequest = {
    subscribe_id: string;
    user_group_id: number;
  };

  type GetGroupConfigResponse = {
    enabled: boolean;
    mode: string;
  };

  type UpdateGroupConfigRequest = {
    enabled?: boolean;
    mode?: string;
  };

  type RecalculateGroupRequest = {
    mode: string;
  };

  type GetGroupHistoryRequest = {
    page: number;
    size: number;
    group_mode?: string;
    trigger_type?: string;
  };

  type GetGroupHistoryResponse = {
    total: number;
    list: GroupHistory[];
  };

  type GetGroupHistoryDetailRequest = {
    id: string;
  };

  type GetGroupHistoryDetailResponse = GroupHistoryDetail;

  type ExportGroupResultRequest = {
    history_id?: string;
  };

  type MigrateUsersRequest = {
    from_user_group_id: number;
    to_user_group_id: number;
    include_locked?: boolean;
  };

  type MigrateUsersResponse = {
    success_count: number;
    failed_count: number;
  };

  type ResetGroupsRequest = {
    confirm: boolean;
  };

  type PreviewUserNodesRequest = {
    user_id: string;
  };

  type PreviewUserNodesResponse = {
    user_id: string;
    node_groups: Array<{
      id: string;
      name: string;
      nodes: Array<{
        id: string;
        name: string;
        address: string;
        port: number;
      }>;
    }>;
  };
}
