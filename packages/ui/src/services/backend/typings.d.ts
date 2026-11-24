declare namespace BackendAPI {
  type AdminActionLog = {
    id: string;
    user_id: string;
    action: string;
    object?: string;
    object_id?: string;
    detail?: string;
    source: string;
    telegram_sender_id?: string;
    timestamp: number;
    created_at: number;
  };

  type Ads = {
    id: number;
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

  type AlipayNotifyResponse = {
    return_code: string;
  };

  type Announcement = {
    id: string;
    title: string;
    content: string;
    show?: boolean;
    pinned?: boolean;
    popup?: boolean;
    created_at: number;
    updated_at: number;
  };

  type AnyTLS = {
    port: number;
    security_config: SecurityConfig;
  };

  type AppleLoginCallbackRequest = {
    code: string;
    id_token: string;
    state: string;
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
  };

  type AuthConfig = {
    mobile: MobileAuthenticateConfig;
    email: EmailAuthticateConfig;
    device: DeviceAuthticateConfig;
    register: PubilcRegisterConfig;
  };

  type AuthMethodConfig = {
    id: string;
    method: string;
    config: any;
    enabled: boolean;
  };

  type BalanceLog = {
    type: number;
    user_id: string;
    amount: number;
    order_no?: string;
    balance: number;
    timestamp: number;
  };

  type BatchDeleteCouponRequest = {
    ids: string[];
  };

  type BatchDeleteDocumentRequest = {
    ids: string[];
  };

  type BatchDeleteRedemptionCodeRequest = {
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
  };

  type BindNekoproxyRequest = {
    node_id: string;
    forward_id: string;
    session_id: string;
  };

  type BindOAuthCallbackRequest = {
    method: string;
    callback: any;
  };

  type BindOAuthRequest = {
    method: string;
    redirect: string;
  };

  type BindOAuthResponse = {
    redirect: string;
  };

  type BindTelegramResponse = {
    url: string;
    expired_at: number;
  };

  type CheckoutOrderRequest = {
    orderNo: string;
    returnUrl?: string;
  };

  type CheckoutOrderResponse = {
    type: string;
    checkout_url?: string;
  };

  type CheckUserRequest = {
    email: string;
  };

  type CheckUserResponse = {
    exist: boolean;
  };

  type CheckVerificationCodeRequest = {
    method: string;
    account: string;
    code: string;
    type: number;
  };

  type CheckVerificationCodeRespone = {
    status: boolean;
  };

  type ClaimServerDeviceRequest = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
    uid: number;
    ip: string;
  };

  type ClaimServerDeviceResponse = {
    allowed: boolean;
    ttl_seconds: number;
  };

  type CloseOrderRequest = {
    orderNo: string;
  };

  type CommissionLog = {
    type: number;
    user_id: string;
    amount: number;
    order_no: string;
    timestamp: number;
  };

  type CommissionWithdrawRequest = {
    amount: number;
    content: string;
  };

  type ConnectionRecords = {
    current_continuous_days: number;
    history_continuous_days: number;
    longest_single_connection: number;
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
    show?: boolean;
  };

  type CreateNekoproxyForward = {
    chain_id: string;
    entry_group_id: string;
    protocol: string;
    target_host: string;
    target_port: number;
    target_port_manual?: boolean;
    requested_port: number;
  };

  type CreateNodeGroupRequest = {
    name: string;
    type?: string;
    description: string;
    sort: number;
    for_calculation?: boolean;
    is_expired_group?: boolean;
    expired_days_limit?: number;
    max_traffic_gb_expired?: number;
    speed_limit?: number;
    min_traffic_gb?: number;
    max_traffic_gb?: number;
  };

  type CreateNodeRequest = {
    nekoproxy?: NekoproxyNodeOptions;
    name: string;
    tags?: string[];
    port: number;
    address: string;
    server_id: string;
    protocol: string;
    protocol_id: string;
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
    user_subscribe_id?: string;
  };

  type CreatePaymentMethodRequest = {
    name: string;
    platform: string;
    description: string;
    icon?: string;
    domain?: string;
    config: any;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    sort?: number;
    enable?: boolean;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
  };

  type CreateQuotaTaskRequest = {
    subscribers: string[];
    is_active?: boolean;
    start_time: number;
    end_time: number;
    reset_traffic: boolean;
    days: number;
    gift_type: number;
    gift_value: number;
  };

  type CreateRedemptionCodeRequest = {
    total_count: number;
    subscribe_plan: string;
    unit_time: string;
    quantity: number;
    batch_count: number;
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
    default_params?: string;
    download_link: DownloadLink;
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
    nodes: any;
    node_tags: string[];
    node_group_ids?: string[];
    node_group_id: string;
    traffic_limit: TrafficLimit[];
    show?: boolean;
    sell?: boolean;
    deduction_ratio: number;
    allow_deduction?: boolean;
    reset_cycle: number;
    renewal_reset?: boolean;
    show_original_price: boolean;
    auto_create_group: boolean;
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

  type CreateUserTicketFollowRequest = {
    ticket_id: string;
    from: string;
    type: number;
    content: string;
  };

  type CreateUserTicketRequest = {
    title: string;
    description: string;
  };

  type Currency = {
    currency_unit: string;
    currency_symbol: string;
  };

  type CurrencyConfig = {
    access_key: string;
    currency_unit: string;
    currency_symbol: string;
  };

  type DailyTrafficStats = {
    date: string;
    upload: number;
    download: number;
    total: number;
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

  type DeleteNodeGroupRequest = {
    id: string;
  };

  type DeleteNodeRequest = {
    id: string;
  };

  type DeletePaymentMethodRequest = {
    id: string;
  };

  type DeleteRedemptionCodeRequest = {
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

  type deleteV1AdminUserParams = {
    id: number;
  };

  type DeviceAuthticateConfig = {
    enable: boolean;
    show_ads: boolean;
    enable_security: boolean;
    only_real_device: boolean;
  };

  type DeviceLoginRequest = {
    identifier: string;
    IP: string;
    user_agent: string;
    cf_token?: string;
    short_code?: string;
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

  type EdgeManifestProxy = {
    name: string;
    protocol: string;
    server: string;
    port: number;
    uuid?: string;
    password?: string;
    cipher?: string;
    flow?: string;
    udp: boolean;
    tls?: EdgeManifestTLS;
    transport?: EdgeManifestTransport;
    tags?: string[];
    sort: number;
  };

  type EdgeManifestResponse = {
    schema_version: string;
    revision: string;
    generated_at: string;
    subscription: EdgeManifestSubscription;
    proxies: EdgeManifestProxy[];
    notices: string[];
  };

  type EdgeManifestSubscription = {
    name: string;
    state: string;
    expires_at?: string;
    traffic_limit: number;
    upload: number;
    download: number;
    update_interval_hours?: number;
    web_page_url?: string;
  };

  type EdgeManifestTLS = {
    enabled: boolean;
    server_name?: string;
    insecure?: boolean;
    alpn?: string[];
    fingerprint?: string;
  };

  type EdgeManifestTransport = {
    type: string;
    path?: string;
    host?: string;
    service_name?: string;
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

  type ExportGroupResultRequest = {
    history_id?: number;
  };

  type FilterAdminActionLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterAdminActionLogResponse = {
    total: number;
    list: AdminActionLog[];
  };

  type FilterBalanceLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterBalanceLogResponse = {
    total: number;
    list: BalanceLog[];
  };

  type FilterCommissionLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterCommissionLogResponse = {
    total: number;
    list: CommissionLog[];
  };

  type FilterEmailLogResponse = {
    total: number;
    list: MessageLog[];
  };

  type FilterGiftLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterGiftLogResponse = {
    total: number;
    list: GiftLog[];
  };

  type FilterLoginLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterLoginLogResponse = {
    total: number;
    list: LoginLog[];
  };

  type FilterLogParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  };

  type FilterMobileLogResponse = {
    total: number;
    list: MessageLog[];
  };

  type FilterNodeListRequest = {
    page: number;
    size: number;
    search?: string;
    node_group_id?: number;
  };

  type FilterNodeListResponse = {
    total: number;
    list: Node[];
  };

  type FilterOrderLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterOrderLogResponse = {
    total: number;
    list: OrderLog[];
  };

  type FilterRegisterLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterRegisterLogResponse = {
    total: number;
    list: RegisterLog[];
  };

  type FilterResetSubscribeLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_subscribe_id?: number;
  };

  type FilterResetSubscribeLogResponse = {
    total: number;
    list: ResetSubscribeLog[];
  };

  type FilterServerListRequest = {
    page: number;
    size: number;
    search?: string;
  };

  type FilterServerListResponse = {
    total: number;
    list: Server[];
  };

  type FilterServerTrafficLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    server_id?: number;
  };

  type FilterServerTrafficLogResponse = {
    total: number;
    list: ServerTrafficLog[];
  };

  type FilterSubscribeLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
    user_subscribe_id?: number;
  };

  type FilterSubscribeLogResponse = {
    total: number;
    list: SubscribeLog[];
  };

  type FilterSubscribeTrafficRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
    user_subscribe_id?: number;
  };

  type FilterSubscribeTrafficResponse = {
    total: number;
    list: UserSubscribeTrafficLog[];
  };

  type FilterTrafficLogDetailsRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    server_id?: number;
    subscribe_id?: number;
    user_id?: number;
  };

  type FilterTrafficLogDetailsResponse = {
    total: number;
    list: TrafficLogDetails[];
  };

  type FilterUnmatchedPaymentLogRequest = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type FilterUnmatchedPaymentLogResponse = {
    total: number;
    list: UnmatchedPaymentLog[];
  };

  type Follow = {
    id: string;
    ticket_id: string;
    from: string;
    type: number;
    content: string;
    created_at: number;
  };

  type GenerateCaptchaResponse = {
    id: string;
    image: string;
    type: string;
    block_image?: string;
  };

  type GetAdsDetailRequest = {
    id: number;
  };

  type GetAdsListRequest = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type GetAdsListResponse = {
    total: number;
    list: Ads[];
  };

  type GetAdsRequest = {
    device: string;
    position: string;
  };

  type GetAdsResponse = {
    list: Ads[];
  };

  type GetAnnouncementListRequest = {
    page: number;
    size: number;
    show?: boolean;
    pinned?: boolean;
    popup?: boolean;
    search?: string;
  };

  type GetAnnouncementListResponse = {
    total: number;
    list: Announcement[];
  };

  type GetAnnouncementRequest = {
    id: number;
  };

  type GetAuthMethodConfigRequest = {
    method: string;
  };

  type GetAuthMethodListResponse = {
    list: AuthMethodConfig[];
  };

  type GetAvailablePaymentMethodsResponse = {
    list: PaymentMethod[];
  };

  type GetBatchSendEmailTaskListRequest = {
    page: number;
    size: number;
    scope?: number;
    status?: number;
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

  type GetCouponListRequest = {
    page: number;
    size: number;
    subscribe?: number;
    search?: string;
  };

  type GetCouponListResponse = {
    total: number;
    list: Coupon[];
  };

  type GetDetailRequest = {
    id: number;
  };

  type GetDeviceListResponse = {
    list: UserDevice[];
    total: number;
  };

  type GetDeviceOnlineStatsResponse = {
    weekly_stats: WeeklyStat[];
    connection_records: ConnectionRecords;
  };

  type GetDocumentDetailRequest = {
    id: string;
  };

  type GetDocumentListRequest = {
    page: number;
    size: number;
    tag?: string;
    search?: string;
  };

  type GetDocumentListResponse = {
    total: number;
    list: Document[];
  };

  type GetGlobalConfigResponse = {
    site: SiteConfig;
    verify: VeifyConfig;
    auth: AuthConfig;
    invite: InviteConfig;
    currency: Currency;
    subscribe: SubscribeConfig;
    verify_code: PubilcVerifyCodeConfig;
    oauth_methods: string[];
    web_ad: boolean;
  };

  type GetGroupConfigRequest = {
    keys?: string[];
  };

  type GetGroupConfigResponse = {
    enabled: boolean;
    mode: string;
    config: Record<string, any>;
    state: RecalculationState;
  };

  type GetGroupHistoryDetailRequest = {
    id: number;
  };

  type GetGroupHistoryDetailResponse = {
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
    config_snapshot?: Record<string, any>;
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

  type GetLoginLogRequest = {
    page: number;
    size: number;
  };

  type GetLoginLogResponse = {
    list: UserLoginLog[];
    total: number;
  };

  type GetMessageLogListRequest = {
    page: number;
    size: number;
    type: number;
    search?: string;
  };

  type GetMessageLogListResponse = {
    total: number;
    list: MessageLog[];
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

  type GetNodeMultiplierResponse = {
    periods: TimePeriod[];
  };

  type GetOAuthMethodsResponse = {
    methods: UserAuthMethod[];
  };

  type GetOrderListRequest = {
    page: number;
    size: number;
    user_id?: number;
    status?: number;
    subscribe_id?: number;
    search?: string;
  };

  type GetOrderListResponse = {
    total: number;
    list: Order[];
  };

  type GetPaymentMethodListRequest = {
    page: number;
    size: number;
    platform?: string;
    search?: string;
    enable?: boolean;
  };

  type GetPaymentMethodListResponse = {
    total: number;
    list: PaymentMethodDetail[];
  };

  type GetPreSendEmailCountRequest = {
    scope: number;
    register_start_time?: number;
    register_end_time?: number;
  };

  type GetPreSendEmailCountResponse = {
    count: number;
  };

  type GetRedemptionCodeListRequest = {
    page: number;
    size: number;
    subscribe_plan?: number;
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
    user_id?: number;
    code_id?: number;
  };

  type GetRedemptionRecordListResponse = {
    total: number;
    list: RedemptionRecord[];
  };

  type GetServerAliveListResponse = {
    alive: Record<string, any>;
  };

  type GetServerConfigRequest = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
  };

  type GetServerConfigResponse = {
    basic: ServerBasic;
    protocol: string;
    config: any;
  };

  type GetServerNodeConfigRequest = {
    server_id: number;
  };

  type GetServerNodeConfigResponse = {
    global: ServerNodeConfigValues;
    override: ServerNodeConfigOverride;
    effective: ServerNodeConfigValues;
  };

  type GetServerNodeListResponse = {
    list: ServerInfo[];
  };

  type GetServerProtocolsRequest = {
    id: number;
  };

  type GetServerProtocolsResponse = {
    protocols: Protocol[];
  };

  type GetServerUserListRequest = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
  };

  type GetServerUserListResponse = {
    users: ServerUser[];
  };

  type GetStatResponse = {
    user: number;
    node: number;
    country: number;
    protocol: string[];
  };

  type GetSubscribeApplicationListRequest = {
    page: number;
    size: number;
  };

  type GetSubscribeApplicationListResponse = {
    total: number;
    list: SubscribeApplication[];
  };

  type GetSubscribeClientResponse = {
    total: number;
    list: SubscribeClient[];
  };

  type GetSubscribeDetailsRequest = {
    id: number;
  };

  type GetSubscribeGroupListResponse = {
    list: SubscribeGroup[];
    total: number;
  };

  type GetSubscribeGroupMappingRequest = {};

  type GetSubscribeGroupMappingResponse = {
    list: SubscribeGroupMappingItem[];
  };

  type GetSubscribeListRequest = {
    page: number;
    size: number;
    language?: string;
    search?: string;
    node_group_id?: number;
  };

  type GetSubscribeListResponse = {
    list: SubscribeItem[];
    total: number;
  };

  type GetSubscribeLogRequest = {
    page: number;
    size: number;
  };

  type GetSubscribeLogResponse = {
    list: UserSubscribeLog[];
    total: number;
  };

  type GetSubscriptionRequest = {
    language: string;
  };

  type GetSubscriptionResponse = {
    list: Subscribe[];
  };

  type GetTicketListRequest = {
    page: number;
    size: number;
    user_id?: number;
    status?: number;
    search?: string;
  };

  type GetTicketListResponse = {
    total: number;
    list: Ticket[];
  };

  type GetTicketRequest = {
    id: number;
  };

  type GetTosResponse = {
    tos_content: string;
  };

  type GetUserAuthMethodRequest = {
    user_id: string;
  };

  type GetUserAuthMethodResponse = {
    auth_methods: UserAuthMethod[];
  };

  type GetUserListRequest = {
    page: number;
    size: number;
    search?: string;
    user_id?: number;
    unscoped?: boolean;
    subscribe_id?: number;
    user_subscribe_id?: number;
    short_code?: string;
  };

  type GetUserListResponse = {
    total: number;
    list: User[];
  };

  type GetUserLoginLogsRequest = {
    page: number;
    size: number;
    user_id: number;
  };

  type GetUserLoginLogsResponse = {
    list: UserLoginLog[];
    total: number;
  };

  type GetUserSubscribeByIdRequest = {
    id: number;
  };

  type GetUserSubscribeDevicesRequest = {
    page: number;
    size: number;
    user_id: number;
    subscribe_id: number;
  };

  type GetUserSubscribeDevicesResponse = {
    list: UserDevice[];
    total: number;
  };

  type GetUserSubscribeListRequest = {
    page: number;
    size: number;
    user_id: number;
  };

  type GetUserSubscribeListResponse = {
    list: UserSubscribe[];
    total: number;
  };

  type GetUserSubscribeLogsRequest = {
    page: number;
    size: number;
    user_id: number;
    subscribe_id?: number;
  };

  type GetUserSubscribeLogsResponse = {
    list: UserSubscribeLog[];
    total: number;
  };

  type GetUserSubscribeResetTrafficLogsRequest = {
    page: number;
    size: number;
    user_subscribe_id: number;
  };

  type GetUserSubscribeResetTrafficLogsResponse = {
    list: ResetSubscribeTrafficLog[];
    total: number;
  };

  type GetUserSubscribeTrafficLogsRequest = {
    page: number;
    size: number;
    user_id: number;
    subscribe_id: number;
    start_time: number;
    end_time: number;
  };

  type GetUserSubscribeTrafficLogsResponse = {
    list: TrafficLog[];
    total: number;
  };

  type GetUserTicketDetailRequest = {
    id: number;
  };

  type GetUserTicketListRequest = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type GetUserTicketListResponse = {
    total: number;
    list: Ticket[];
  };

  type GetUserTrafficStatsRequest = {
    user_subscribe_id: string;
    days: number;
  };

  type GetUserTrafficStatsResponse = {
    list: DailyTrafficStats[];
    total_upload: number;
    total_download: number;
    total_traffic: number;
  };

  type getV1AdminAdsDetailParams = {
    id: number;
  };

  type getV1AdminAdsListParams = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type getV1AdminAnnouncementDetailParams = {
    id: number;
  };

  type getV1AdminAnnouncementListParams = {
    page: number;
    size: number;
    show?: boolean;
    pinned?: boolean;
    popup?: boolean;
    search?: string;
  };

  type getV1AdminApplicationPreviewParams = {
    id: number;
  };

  type getV1AdminApplicationSubscribeApplicationListParams = {
    page: number;
    size: number;
  };

  type getV1AdminAuthMethodConfigParams = {
    method: string;
  };

  type getV1AdminCouponListParams = {
    page: number;
    size: number;
    subscribe?: number;
    search?: string;
  };

  type getV1AdminDocumentDetailParams = {
    id: string;
  };

  type getV1AdminDocumentListParams = {
    page: number;
    size: number;
    tag?: string;
    search?: string;
  };

  type getV1AdminGroup_openAPI_exportParams = {
    history_id?: number;
  };

  type getV1AdminGroupConfigParams = {
    keys?: string[];
  };

  type getV1AdminGroupHistoryDetailParams = {
    id: number;
  };

  type getV1AdminGroupHistoryParams = {
    page: number;
    size: number;
    group_mode?: string;
    trigger_type?: string;
  };

  type getV1AdminGroupNodeListParams = {
    page: number;
    size: number;
    group_id?: string;
  };

  type getV1AdminGroupPreviewParams = {
    user_id: number;
  };

  type getV1AdminLogAdminActionListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogBalanceListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogCommissionListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogEmailListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  };

  type getV1AdminLogGiftListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogLoginListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogMessageListParams = {
    page: number;
    size: number;
    type: number;
    search?: string;
  };

  type getV1AdminLogMobileListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  };

  type getV1AdminLogOrderListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogRegisterListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminLogServerTrafficListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    server_id?: number;
  };

  type getV1AdminLogSubscribeListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
    user_subscribe_id?: number;
  };

  type getV1AdminLogSubscribeResetListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_subscribe_id?: number;
  };

  type getV1AdminLogSubscribeTrafficListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
    user_subscribe_id?: number;
  };

  type getV1AdminLogTrafficDetailsParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    server_id?: number;
    subscribe_id?: number;
    user_id?: number;
  };

  type getV1AdminLogUnmatchedPaymentListParams = {
    page: number;
    size: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    user_id?: number;
  };

  type getV1AdminMarketingEmailBatchListParams = {
    page: number;
    size: number;
    scope?: number;
    status?: number;
  };

  type getV1AdminMarketingQuotaListParams = {
    page: number;
    size: number;
    status?: number;
  };

  type getV1AdminOrderListParams = {
    page: number;
    size: number;
    user_id?: number;
    status?: number;
    subscribe_id?: number;
    search?: string;
  };

  type getV1AdminPaymentListParams = {
    page: number;
    size: number;
    platform?: string;
    search?: string;
    enable?: boolean;
  };

  type getV1AdminPluginsNameEventsParams = {
    name: string;
  };

  type getV1AdminPluginsNameHealthParams = {
    name: string;
  };

  type getV1AdminPluginsNameManifestParams = {
    name: string;
  };

  type getV1AdminPluginsNameMiddlewaresParams = {
    name: string;
  };

  type getV1AdminPluginsNameParams = {
    name: string;
  };

  type getV1AdminPluginsNameRoutesParams = {
    name: string;
  };

  type getV1AdminRedemptionCodeListParams = {
    page: number;
    size: number;
    subscribe_plan?: number;
    unit_time?: string;
    code?: string;
  };

  type getV1AdminRedemptionRecordListParams = {
    page: number;
    size: number;
    user_id?: number;
    code_id?: number;
  };

  type getV1AdminServerListParams = {
    page: number;
    size: number;
    search?: string;
  };

  type getV1AdminServerNodeConfigParams = {
    server_id: number;
  };

  type getV1AdminServerNodeListParams = {
    page: number;
    size: number;
    search?: string;
    node_group_id?: number;
  };

  type getV1AdminServerProtocolsParams = {
    id: number;
  };

  type getV1AdminSubscribeDetailsParams = {
    id: number;
  };

  type getV1AdminSubscribeListParams = {
    page: number;
    size: number;
    language?: string;
    search?: string;
    node_group_id?: number;
  };

  type getV1AdminTicketDetailParams = {
    id: number;
  };

  type getV1AdminTicketListParams = {
    page: number;
    size: number;
    user_id?: number;
    status?: number;
    search?: string;
  };

  type getV1AdminToolIpLocationParams = {
    ip: string;
  };

  type getV1AdminUserAuthMethodParams = {
    user_id: string;
  };

  type getV1AdminUserDetailParams = {
    id: number;
  };

  type getV1AdminUserListParams = {
    page: number;
    size: number;
    search?: string;
    user_id?: number;
    unscoped?: boolean;
    subscribe_id?: number;
    user_subscribe_id?: number;
    short_code?: string;
  };

  type getV1AdminUserLoginLogsParams = {
    page: number;
    size: number;
    user_id: number;
  };

  type getV1AdminUserSubscribeDetailParams = {
    id: number;
  };

  type getV1AdminUserSubscribeDeviceParams = {
    page: number;
    size: number;
    user_id: number;
    subscribe_id: number;
  };

  type getV1AdminUserSubscribeLogsParams = {
    page: number;
    size: number;
    user_id: number;
    subscribe_id?: number;
  };

  type getV1AdminUserSubscribeParams = {
    page: number;
    size: number;
    user_id: number;
  };

  type getV1AdminUserSubscribeResetLogsParams = {
    page: number;
    size: number;
    user_subscribe_id: number;
  };

  type getV1AdminUserSubscribeTrafficLogsParams = {
    page: number;
    size: number;
    user_id: number;
    subscribe_id: number;
    start_time: number;
    end_time: number;
  };

  type getV1AuthCheckParams = {
    email: string;
  };

  type getV1AuthCheckTelephoneParams = {
    telephone: string;
    telephone_area_code: string;
  };

  type getV1CommonAdsParams = {
    device: string;
    position: string;
  };

  type getV1PublicAnnouncementListParams = {
    page: number;
    size: number;
    pinned?: boolean;
    popup?: boolean;
  };

  type getV1PublicDocumentDetailParams = {
    id: number;
  };

  type getV1PublicOrderDetailParams = {
    order_no: string;
  };

  type getV1PublicOrderListParams = {
    page: number;
    size: number;
  };

  type getV1PublicPortalOrderStatusParams = {
    auth_type: string;
    identifier: string;
    order_no: string;
    checkout_token: string;
  };

  type getV1PublicPortalSubscribeParams = {
    language: string;
  };

  type getV1PublicSubscribeListParams = {
    language: string;
  };

  type getV1PublicTicketDetailParams = {
    id: number;
  };

  type getV1PublicTicketListParams = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type getV1PublicUserAffiliateListParams = {
    page: number;
    size: number;
  };

  type getV1PublicUserCommissionLogParams = {
    page: number;
    size: number;
  };

  type getV1PublicUserLoginLogParams = {
    page: number;
    size: number;
  };

  type getV1PublicUserSubscribeLogParams = {
    page: number;
    size: number;
  };

  type getV1PublicUserTrafficStatsParams = {
    user_subscribe_id: string;
    days: number;
  };

  type getV1PublicUserWithdrawalLogParams = {
    page: number;
    size: number;
  };

  type getV2PublicOrdersOrderNoEventsParams = {
    orderNo: string;
  };

  type getV2PublicOrdersOrderNoParams = {
    orderNo: string;
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
  };

  type GoogleLoginCallbackRequest = {
    code: string;
    state: string;
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
    config_snapshot?: Record<string, any>;
  };

  type HasMigrateSeverNodeResponse = {
    has_migrate: boolean;
  };

  type HeartbeatResponse = {
    status: boolean;
    message?: string;
    timestamp?: number;
  };

  type Hysteria2 = {
    port: number;
    hop_ports: string;
    hop_interval: number;
    obfs_password: string;
    security_config: SecurityConfig;
  };

  type InviteConfig = {
    forced_invite: boolean;
    referral_percentage: number;
    only_first_purchase: boolean;
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
  };

  type LoginResponse = {
    token: string;
  };

  type LogResponse = {
    list: any;
  };

  type LogSetting = {
    auto_clear?: boolean;
    clear_days?: number;
    sentry_enabled?: boolean;
    sentry_error_enabled?: boolean;
    sentry_logs_enabled?: boolean;
    sentry_tracing_enabled?: boolean;
    sentry_metrics_enabled?: boolean;
    sentry_trace_id_header_enabled?: boolean;
    sentry_dsn?: string;
  };

  type MessageLog = {
    id: string;
    type: number;
    platform: string;
    to: string;
    subject: string;
    content: any;
    status: number;
    created_at: number;
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
    secret: string;
    service_name: string;
    service_version: string;
  };

  type NekoproxyBinding = {
    node_id: string;
    api_url: string;
    forward_id: string;
    session_id: string;
  };

  type NekoproxyChain = {
    id: string;
    name: string;
  };

  type NekoproxyConfig = {
    api_url: string;
    has_api_token: boolean;
  };

  type NekoproxyEntryGroup = {
    id: string;
    name: string;
    listen_host: string;
    port_start: number;
    port_end: number;
  };

  type NekoproxyForward = {
    id: string;
    name: string;
    chain_id: string;
    chain_name: string;
    protocol: string;
    target_host: string;
    target_port: number;
    enabled: boolean;
    paused: boolean;
    sessions: NekoproxySession[];
  };

  type NekoproxyNodeOptions = {
    forward_id?: string;
    session_id?: string;
    create?: CreateNekoproxyForward;
  };

  type NekoproxySession = {
    id: string;
    address: string;
    port: number;
    status: string;
    group_id: string;
  };

  type NekoproxyState = {
    error?: string;
    api_url: string;
    forwards: NekoproxyForward[];
    chains: NekoproxyChain[];
    groups: NekoproxyEntryGroup[];
    bindings: NekoproxyBinding[];
  };

  type NekoproxySyncError = {
    node_id: string;
    message: string;
  };

  type NekoproxySyncResponse = {
    updated: number;
    errors: NekoproxySyncError[];
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
    enabled?: boolean;
    node_type: string;
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

  type NodeGroupItem = {
    id: string;
    name: string;
    nodes: Node[];
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
  };

  type NodeRelay = {
    host: string;
    port: number;
    prefix: string;
  };

  type OAthLoginRequest = {
    method: string;
    redirect: string;
  };

  type OAuthLoginGetTokenRequest = {
    method: string;
    callback: any;
  };

  type OAuthLoginResponse = {
    redirect: string;
  };

  type OnlineUser = {
    uid: number;
    ip: string;
  };

  type OnlineUsersRequest = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
    users: OnlineUser[];
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

  type OrderLog = {
    id: string;
    user_id: string;
    order_no: string;
    order_type: number;
    quantity: number;
    price: number;
    amount: number;
    gift_amount: number;
    discount: number;
    coupon_discount: number;
    payment_id: string;
    method: string;
    fee_amount: number;
    subscribe_id?: string;
    source: string;
    timestamp: number;
    client_ip?: string;
    user_agent?: string;
    actor_id?: string;
    ip_country_code?: string;
    ip_country?: string;
    ip_region?: string;
    ip_city?: string;
    ip_asn?: number;
    ip_as_organization?: string;
  };

  type OrdersStatistics = {
    date?: string;
    amount_total: number;
    new_order_amount: number;
    renewal_order_amount: number;
    recharge_order_amount: number;
    redemption_order_amount: number;
    list?: OrdersStatistics[];
  };

  type PaymentConfig = {
    id: string;
    name: string;
    platform: string;
    description: string;
    icon?: string;
    domain?: string;
    config: any;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    sort?: number;
    enable?: boolean;
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
    sort: number;
    currency_unit: string;
    exchange_rate: number;
    bill_desc: string;
  };

  type PaymentMethodDetail = {
    id: string;
    name: string;
    platform: string;
    description: string;
    icon: string;
    domain: string;
    config: any;
    fee_mode: number;
    fee_percent: number;
    fee_amount: number;
    sort: number;
    enable: boolean;
    notify_url: string;
    currency_unit: string;
    exchange_rate: number;
    bill_desc: string;
  };

  type PlatformInfo = {
    platform: string;
    platform_url: string;
    platform_field_description: Record<string, any>;
  };

  type PlatformResponse = {
    list: PlatformInfo[];
  };

  type PortalPurchaseRequest = {
    auth_type: string;
    identifier: string;
    password?: string;
    payment: string;
    subscribe_id: string;
    quantity: number;
    coupon?: string;
    invite_code?: string;
    turnstile_token?: string;
  };

  type PortalPurchaseResponse = {
    order_no: string;
    checkout_token?: string;
  };

  type postV1AdminPluginsNameDisableParams = {
    name: string;
  };

  type postV1AdminPluginsNameEnableParams = {
    name: string;
  };

  type postV1AdminPluginsNameReloadParams = {
    name: string;
  };

  type postV1AdminPluginsNameRestartParams = {
    name: string;
  };

  type postV1AdminPluginsNameValidateParams = {
    name: string;
  };

  type postV1AuthOauthCallbackAppleParams = {
    code: string;
    id_token: string;
    state: string;
  };

  type postV2PublicOrdersOrderNoCheckoutParams = {
    orderNo: string;
  };

  type postV2PublicOrdersOrderNoEventTicketParams = {
    orderNo: string;
  };

  type postV2PublicOrdersOrderNoSessionParams = {
    orderNo: string;
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

  type PrePurchaseOrderRequest = {
    payment?: string;
    subscribe_id: string;
    quantity: number;
    coupon?: string;
  };

  type PrePurchaseOrderResponse = {
    price: number;
    amount: number;
    discount: number;
    coupon: string;
    coupon_discount: number;
    fee_amount: number;
  };

  type PreRenewalOrderResponse = {
    orderNo: string;
  };

  type PreUnsubscribeRequest = {
    id: string;
  };

  type PreUnsubscribeResponse = {
    deduction_amount: number;
  };

  type PreViewNodeMultiplierResponse = {
    current_time: string;
    ratio: number;
  };

  type PreviewSubscribeTemplateRequest = {
    id: number;
  };

  type PreviewSubscribeTemplateResponse = {
    template: string;
  };

  type PreviewUserNodesRequest = {
    user_id: number;
  };

  type PreviewUserNodesResponse = {
    user_id: string;
    node_groups: NodeGroupItem[];
  };

  type PrivacyPolicyConfig = {
    privacy_policy: string;
  };

  type Protocol = {
    id: string;
    name: string;
    type: string;
    port: number;
    enable: boolean;
    version?: number;
    mode?: string;
    network?: string;
    alpn?: string[];
    ssr_protocol?: string;
    protocol_param?: string;
    obfs_param?: string;
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
    uot?: boolean;
    uot_version?: number;
    accept_proxy_protocol?: boolean;
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
    ech_enable?: boolean;
    ech_server_name?: string;
    ratio?: number;
    cert_mode?: string;
    cert_dns_provider?: string;
    cert_dns_env?: string;
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
    pinned?: boolean;
    popup?: boolean;
  };

  type QueryAnnouncementResponse = {
    total: number;
    announcements: Announcement[];
  };

  type QueryDocumentDetailRequest = {
    id: number;
  };

  type QueryDocumentListResponse = {
    total: number;
    list: Document[];
  };

  type QueryIPLocationRequest = {
    ip: string;
  };

  type QueryIPLocationResponse = {
    country: string;
    region?: string;
    city: string;
  };

  type QueryNodeTagResponse = {
    tags: string[];
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

  type QueryPurchaseOrderRequest = {
    auth_type: string;
    identifier: string;
    order_no: string;
    checkout_token: string;
  };

  type QueryPurchaseOrderResponse = {
    order_no: string;
    subscribe: Subscribe;
    quantity: number;
    price: number;
    amount: number;
    discount: number;
    coupon: string;
    coupon_discount: number;
    fee_amount: number;
    payment: PaymentMethod;
    status: number;
    created_at: number;
    token?: string;
  };

  type QueryQuotaTaskListRequest = {
    page: number;
    size: number;
    status?: number;
  };

  type QueryQuotaTaskListResponse = {
    total: number;
    list: QuotaTask[];
  };

  type QueryQuotaTaskPreCountRequest = {
    subscribers: string[];
    is_active?: boolean;
    start_time: number;
    end_time: number;
  };

  type QueryQuotaTaskPreCountResponse = {
    count: number;
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

  type QueryServerConfigRequest = {
    server_id: number;
    secret_key: string;
    protocols?: string[];
  };

  type QueryServerConfigResponse = {
    traffic_report_threshold: number;
    push_interval: number;
    pull_interval: number;
    ip_strategy: string;
    dns: NodeDNS[];
    block: string[];
    outbound: NodeOutbound[];
    protocols: Protocol[];
    total: number;
  };

  type QuerySubscribeGroupListResponse = {
    list: SubscribeGroup[];
    total: number;
  };

  type QuerySubscribeListRequest = {
    language: string;
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

  type QueryUserBalanceLogListResponse = {
    list: BalanceLog[];
    total: number;
  };

  type QueryUserCommissionLogListRequest = {
    page: number;
    size: number;
  };

  type QueryUserCommissionLogListResponse = {
    list: CommissionLog[];
    total: number;
  };

  type QueryUserSubscribeListResponse = {
    list: UserSubscribe[];
    total: number;
  };

  type QueryUserSubscribeNodeListResponse = {
    list: UserSubscribeInfo[];
  };

  type QueryWithdrawalLogListRequest = {
    page: number;
    size: number;
  };

  type QueryWithdrawalLogListResponse = {
    list: WithdrawalLog[];
    total: number;
  };

  type QuotaTask = {
    id: string;
    subscribers: string[];
    is_active?: boolean;
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

  type RecalculateGroupRequest = {
    mode: string;
    trigger_type: string;
  };

  type RecalculationState = {
    state: string;
    progress: number;
    total: number;
  };

  type RechargeOrderRequest = {
    amount: number;
    payment: string;
  };

  type RechargeOrderResponse = {
    order_no: string;
  };

  type RedeemCodeRequest = {
    code: string;
  };

  type RedeemCodeResponse = {
    message: string;
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

  type ResetAllSubscribeTokenResponse = {
    success: boolean;
  };

  type ResetGroupsRequest = {
    confirm: boolean;
  };

  type ResetPasswordRequest = {
    identifier: string;
    email: string;
    password: string;
    code?: string;
    IP: string;
    UserAgent: string;
    LoginType: string;
    cf_token?: string;
    captcha_id?: string;
    captcha_code?: string;
    slider_token?: string;
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
  };

  type ResetSubscribeTrafficLog = {
    id: string;
    type: number;
    user_subscribe_id: string;
    order_no?: string;
    timestamp: number;
  };

  type ResetTrafficOrderRequest = {
    user_subscribe_id: string;
    payment: string;
  };

  type ResetTrafficOrderResponse = {
    order_no: string;
  };

  type ResetUserSubscribeTokenRequest = {
    user_subscribe_id: string;
  };

  type ResetUserSubscribeTrafficRequest = {
    user_subscribe_id: string;
  };

  type RevenueStatisticsResponse = {
    today: OrdersStatistics;
    monthly: OrdersStatistics;
    all: OrdersStatistics;
  };

  type SecurityConfig = {
    sni: string;
    allow_insecure?: boolean;
    fingerprint: string;
    reality_server_addr: string;
    reality_server_port: number;
    reality_private_key: string;
    reality_public_key: string;
    reality_short_id: string;
  };

  type SendCodeRequest = {
    email: string;
    type: number;
  };

  type SendCodeResponse = {
    code?: string;
    status: boolean;
  };

  type SendSmsCodeRequest = {
    type: number;
    telephone: string;
    telephone_area_code: string;
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

  type ServerBasic = {
    push_interval: number;
    pull_interval: number;
  };

  type ServerCommon = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
  };

  type ServerGroup = {
    id: string;
    name: string;
    description: string;
    created_at: number;
    updated_at: number;
  };

  type ServerInfo = {
    id: string;
    name: string;
    country: string;
    city: string;
    address: string;
    status: string;
    cpu: number;
    mem: number;
    online_users: number;
    protocols: ServerNodeProtocol[];
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

  type ServerNodeProtocol = {
    type: string;
    ratio: number;
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

  type ServerPushStatusRequest = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
    cpu: number;
    mem: number;
    disk: number;
    updated_at: number;
  };

  type ServerPushUserTrafficRequest = {
    protocol: string;
    protocol_id: string;
    server_id: number;
    secret_key: string;
    traffic: UserTraffic[];
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
    server_id: number;
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

  type ServerUser = {
    id: number;
    uuid: string;
    speed_limit: number;
    device_limit: number;
  };

  type SetNodeMultiplierRequest = {
    periods: TimePeriod[];
  };

  type Shadowsocks = {
    method: string;
    port: number;
    server_key: string;
  };

  type ShadowsocksProtocol = {
    port: number;
    method: string;
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

  type SiteCustomDataContacts = {
    email: string;
    telephone: string;
    address: string;
  };

  type SliderVerifyCaptchaRequest = {
    id: string;
    x: number;
    y: number;
    trail: string;
  };

  type SliderVerifyCaptchaResponse = {
    token: string;
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
    nodes: any;
    node_tags: string[];
    node_group_ids?: string[];
    node_group_id: string;
    traffic_limit: TrafficLimit[];
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
    default_params?: string;
    download_link?: DownloadLink;
    created_at: number;
    updated_at: number;
  };

  type SubscribeClient = {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    scheme?: string;
    is_default: boolean;
    download_link?: DownloadLink;
  };

  type SubscribeConfig = {
    single_model: boolean;
    subscribe_path: string;
    subscribe_domain: string;
    pan_domain: boolean;
    user_agent_limit: boolean;
    user_agent_list: string;
    show_tutorial: boolean;
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

  type SubscribeGroupMappingItem = {
    subscribe_name: string;
    node_group_name: string;
  };

  type SubscribeItem = {
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
    nodes: any;
    node_tags: string[];
    node_group_ids?: string[];
    node_group_id: string;
    traffic_limit: TrafficLimit[];
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
    sold: number;
  };

  type SubscribeLog = {
    user_id: string;
    token: string;
    user_agent: string;
    client_ip: string;
    user_subscribe_id: string;
    timestamp: number;
  };

  type SubscribeRequest = {
    Token: string;
    Type: string;
    UA: string;
    Agent: string;
    Params: Record<string, any>;
  };

  type SubscribeResponse = {
    Config: number[];
    Header: string;
    Headers: Record<string, any>;
  };

  type SubscribeSortRequest = {
    sort: SortItem[];
  };

  type SubscribeType = {
    subscribe_types: string[];
  };

  type SyncNekoproxyRequest = {
    node_id?: string;
  };

  type TelegramConfig = {
    telegram_bot_token: string;
    telegram_group_url: string;
    telegram_notify: boolean;
    telegram_web_hook_domain: string;
  };

  type TelephoneCheckUserRequest = {
    telephone: string;
    telephone_area_code: string;
  };

  type TelephoneCheckUserResponse = {
    exist: boolean;
  };

  type TelephoneLoginRequest = {
    identifier: string;
    telephone: string;
    telephone_code: string;
    telephone_area_code: string;
    password: string;
    IP: string;
    UserAgent: string;
    LoginType: string;
    cf_token?: string;
    captcha_id?: string;
    captcha_code?: string;
    slider_token?: string;
  };

  type TelephoneRegisterRequest = {
    identifier: string;
    telephone: string;
    telephone_area_code: string;
    password: string;
    invite?: string;
    code?: string;
    IP: string;
    UserAgent: string;
    LoginType: string;
    cf_token?: string;
    captcha_id?: string;
    captcha_code?: string;
    slider_token?: string;
  };

  type TelephoneResetPasswordRequest = {
    identifier: string;
    telephone: string;
    telephone_area_code: string;
    password: string;
    code?: string;
    IP: string;
    UserAgent: string;
    LoginType: string;
    cf_token?: string;
    captcha_id?: string;
    captcha_code?: string;
    slider_token?: string;
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
    enable?: boolean;
  };

  type ToggleRedemptionCodeStatusRequest = {
    id: string;
    status: number;
  };

  type ToggleUserSubscribeStatusRequest = {
    user_subscribe_id: string;
  };

  type TosConfig = {
    tos_content: string;
  };

  type TrafficLimit = {
    stat_type: string;
    stat_value: number;
    traffic_usage: number;
    speed_limit: number;
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

  type TrojanProtocol = {
    host: string;
    port: number;
    enable_tls?: boolean;
    tls_config: string;
    network: string;
    transport: string;
  };

  type Tuic = {
    port: number;
    disable_sni: boolean;
    reduce_rtt: boolean;
    udp_relay_mode: string;
    congestion_controller: string;
    security_config: SecurityConfig;
  };

  type UnbindDeviceRequest = {
    id: string;
  };

  type UnbindNekoproxyRequest = {
    node_id: string;
  };

  type UnbindOAuthRequest = {
    method: string;
  };

  type UnmatchedPaymentLog = {
    id: string;
    user_id: string;
    order_no: string;
    trade_no: string;
    platform: string;
    amount: number;
    currency: string;
    reason: string;
    timestamp: number;
    created_at: number;
  };

  type UnsubscribeRequest = {
    id: string;
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

  type UpdateAnnouncementEnableRequest = {
    id: string;
    enable?: boolean;
  };

  type UpdateAnnouncementRequest = {
    id: string;
    title: string;
    content: string;
    show?: boolean;
    pinned?: boolean;
    popup?: boolean;
  };

  type UpdateAuthMethodConfigRequest = {
    id: string;
    method: string;
    config: any;
    enabled?: boolean;
  };

  type UpdateBindEmailRequest = {
    email: string;
    code: string;
    password?: string;
    current_code?: string;
  };

  type UpdateBindMobileRequest = {
    area_code: string;
    mobile: string;
    code: string;
    password?: string;
    current_code?: string;
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
    show?: boolean;
  };

  type UpdateGroupConfigRequest = {
    enabled: boolean;
    mode: string;
    config: Record<string, any>;
  };

  type UpdateNekoproxyConfigRequest = {
    api_url: string;
    api_token?: string;
  };

  type UpdateNodeGroupRequest = {
    id: string;
    name: string;
    type?: string;
    description: string;
    sort: number;
    for_calculation?: boolean;
    is_expired_group?: boolean;
    expired_days_limit?: number;
    max_traffic_gb_expired?: number;
    speed_limit?: number;
    min_traffic_gb?: number;
    max_traffic_gb?: number;
  };

  type UpdateNodeRequest = {
    nekoproxy_binding?: {
      action: "bind" | "unbind" | "sync";
      forward_id?: string;
      session_id?: string;
    };
    id: string;
    name: string;
    tags?: string[];
    port: number;
    address: string;
    server_id: string;
    protocol: string;
    protocol_id: string;
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
    config: any;
    fee_mode: number;
    fee_percent?: number;
    fee_amount?: number;
    sort?: number;
    enable?: boolean;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
  };

  type UpdateRedemptionCodeRequest = {
    id: string;
    total_count?: number;
    subscribe_plan?: string;
    unit_time?: string;
    quantity?: number;
    status?: number;
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
    default_params?: string;
    download_link?: DownloadLink;
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
    nodes: any;
    node_tags: string[];
    node_group_ids?: string[];
    node_group_id: string;
    traffic_limit: TrafficLimit[];
    show?: boolean;
    sell?: boolean;
    sort: number;
    deduction_ratio: number;
    allow_deduction?: boolean;
    reset_cycle: number;
    renewal_reset?: boolean;
    show_original_price: boolean;
  };

  type UpdateTicketStatusRequest = {
    id: string;
    status?: number;
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

  type UpdateUserNotifyRequest = {
    enable_balance_notify?: boolean;
    enable_login_notify?: boolean;
    enable_subscribe_notify?: boolean;
    enable_trade_notify?: boolean;
  };

  type UpdateUserNotifySettingRequest = {
    user_id: string;
    enable_balance_notify: boolean;
    enable_login_notify: boolean;
    enable_subscribe_notify: boolean;
    enable_trade_notify: boolean;
  };

  type UpdateUserPasswordRequest = {
    password: string;
    old_password?: string;
    current_code?: string;
  };

  type UpdateUserRulesRequest = {
    rules: string[];
  };

  type UpdateUserSubscribeNoteRequest = {
    user_subscribe_id: string;
    note: string;
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

  type UpdateUserTicketStatusRequest = {
    id: string;
    status?: number;
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
    auth_methods: UserAuthMethod[];
    user_devices: UserDevice[];
    rules: string[];
    created_at: number;
    updated_at: number;
    deleted_at?: number;
    is_del?: boolean;
  };

  type UserAffiliate = {
    avatar: string;
    identifier: string;
    registered_at: number;
    enable: boolean;
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
  };

  type UserLoginRequest = {
    identifier: string;
    email: string;
    password: string;
    IP: string;
    UserAgent: string;
    LoginType: string;
    cf_token?: string;
    captcha_id?: string;
    captcha_code?: string;
    slider_token?: string;
  };

  type UserRegisterRequest = {
    identifier: string;
    email: string;
    password: string;
    invite?: string;
    code?: string;
    IP: string;
    UserAgent: string;
    LoginType: string;
    cf_token?: string;
    captcha_id?: string;
    captcha_code?: string;
    slider_token?: string;
  };

  type UserStatistics = {
    date?: string;
    register: number;
    new_order_users: number;
    renewal_order_users: number;
    recharge_order_users: number;
    redemption_order_users: number;
    list?: UserStatistics[];
  };

  type UserStatisticsResponse = {
    today: UserStatistics;
    monthly: UserStatistics;
    all: UserStatistics;
  };

  type UserSubscribe = {
    id: string;
    id_str: string;
    user_id: string;
    order_id: string;
    subscribe_id: string;
    subscribe: Subscribe;
    node_group_id: string;
    group_locked: boolean;
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
  };

  type UserSubscribeDetail = {
    id: string;
    user_id: string;
    user: User;
    order_id: string;
    subscribe_id: string;
    subscribe: Subscribe;
    node_group_id: string;
    group_locked: boolean;
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
  };

  type UserSubscribeInfo = {
    id: string;
    user_id: string;
    order_id: string;
    subscribe_id: string;
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
    created_at: number;
    updated_at: number;
    is_try_out: boolean;
    nodes: UserSubscribeNodeInfo[];
  };

  type UserSubscribeLog = {
    id: string;
    user_id: string;
    user_subscribe_id: string;
    token: string;
    ip: string;
    user_agent: string;
    timestamp: number;
  };

  type UserSubscribeNodeInfo = {
    id: string;
    name: string;
    uuid: string;
    protocol: string;
    protocols: string;
    port: number;
    address: string;
    tags: string[];
    country: string;
    city: string;
    longitude: string;
    latitude: string;
    latitude_center: string;
    longitude_center: string;
    created_at: number;
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

  type UserTraffic = {
    uid: number;
    upload: number;
    download: number;
  };

  type UserTrafficData = {
    sid: number;
    upload: number;
    download: number;
  };

  type V2CheckoutOrderRequest = {
    checkout_token?: string;
    return_url?: string;
  };

  type V2CreateOrderRequest = {
    type: string;
    payment_id: number;
    subscribe_id?: number;
    user_subscribe_id?: number;
    quantity?: number;
    coupon?: string;
    amount?: number;
    return_url?: string;
    guest?: V2GuestOrderRequest;
  };

  type V2EventTicketRequest = {
    checkout_token?: string;
  };

  type V2EventTicketResponse = {
    url: string;
    ticket_expires_at: number;
  };

  type V2GuestOrderRequest = {
    auth_type: string;
    identifier: string;
    password: string;
    invite_code?: string;
  };

  type V2OrderEvents = {
    url: string;
    ticket_expires_at: number;
  };

  type V2OrderPayment = {
    type: string;
    checkout_url?: string;
    payment_status: string;
  };

  type V2OrderResponse = {
    order: V2OrderSnapshot;
    payment?: V2OrderPayment;
    events: V2OrderEvents;
    checkout_token?: string;
  };

  type V2OrderSessionRequest = {
    checkout_token?: string;
  };

  type V2OrderSessionResponse = {
    access_token: string;
  };

  type V2OrderSnapshot = {
    order_no: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    state_version: number;
    amount: number;
    currency: string;
    expires_at: number;
  };

  type VeifyConfig = {
    captcha_type: string;
    turnstile_site_key: string;
    enable_user_login_captcha: boolean;
    enable_user_register_captcha: boolean;
    enable_admin_login_captcha: boolean;
    enable_user_reset_password_captcha: boolean;
  };

  type VerifyCodeConfig = {
    verify_code_expire_time: number;
    verify_code_limit: number;
    verify_code_interval: number;
  };

  type VerifyConfig = {
    captcha_type: string;
    turnstile_site_key: string;
    turnstile_secret: string;
    enable_user_login_captcha: boolean;
    enable_user_register_captcha: boolean;
    enable_admin_login_captcha: boolean;
    enable_user_reset_password_captcha: boolean;
  };

  type VerifyEmailRequest = {
    email: string;
    code: string;
  };

  type VersionResponse = {
    version: string;
  };

  type Vless = {
    port: number;
    flow: string;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type VlessProtocol = {
    host: string;
    port: number;
    network: string;
    transport: string;
    security: string;
    security_config: string;
    xtls: string;
  };

  type Vmess = {
    port: number;
    transport: string;
    transport_config: TransportConfig;
    security: string;
    security_config: SecurityConfig;
  };

  type VmessProtocol = {
    host: string;
    port: number;
    enable_tls?: boolean;
    tls_config: string;
    network: string;
    transport: string;
  };

  type WeeklyStat = {
    day: number;
    day_name: string;
    hours: number;
  };

  type WithdrawalLog = {
    id: string;
    user_id: string;
    amount: number;
    content: string;
    status: number;
    reason?: string;
    created_at: number;
    updated_at: number;
  };
}
