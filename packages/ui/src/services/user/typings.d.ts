declare namespace API {
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

  type BindOAuthCallbackRequest = {
    method: string;
    callback: Record<string, any>;
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
    checkout_token?: string;
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

  type CommissionWithdrawRequest = {
    amount: number;
    content: string;
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

  type Document = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    show: boolean;
    created_at: number;
    updated_at: number;
  };

  type Follow = {
    id: string;
    ticket_id: string;
    from: string;
    type: number;
    content: string;
    created_at: number;
  };

  type GetAvailablePaymentMethodsResponse = {
    list: PaymentMethod[];
  };

  type GetDeviceListResponse = {
    list: UserDevice[];
    total: number;
  };

  type GetLoginLogResponse = {
    list: UserLoginLog[];
    total: number;
  };

  type GetOAuthMethodsResponse = {
    methods: UserAuthMethod[];
  };

  type GetSubscribeLogResponse = {
    list: UserSubscribeLog[];
    total: number;
  };

  type GetSubscriptionResponse = {
    list: Subscribe[];
  };

  type GetUserTicketListResponse = {
    total: number;
    list: Ticket[];
  };

  type getV1AppWsUseridIdentifierParams = {
    /** User ID of the signed-in user */
    userid: number;
    /** Device identifier */
    identifier: string;
  };

  type getV1PublicAnnouncementListParams = {
    page: number;
    pinned?: boolean;
    popup?: boolean;
    size: number;
  };

  type getV1PublicDocumentDetailParams = {
    id: string | number;
  };

  type getV1PublicOrderDetailParams = {
    order_no: string;
  };

  type getV1PublicOrderListParams = {
    page: number;
    size: number;
  };

  type getV1PublicPortalOrderStatusParams = {
    checkout_token?: string;
    order_no: string;
  };

  type getV1PublicPortalSubscribeParams = {
    language?: string;
  };

  type getV1PublicSubscribeListParams = {
    language?: string;
  };

  type getV1PublicTicketDetailParams = {
    id: number;
  };

  type getV1PublicTicketListParams = {
    page: number;
    search?: string;
    size: number;
    status?: number;
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

  type getV1PublicUserWithdrawalLogParams = {
    page: number;
    size: number;
  };

  type getV1SubscribeConfigParams = {
    /** Subscription token; alternatively send the token header */
    token?: string;
    /** Subscription format flag */
    flag?: string;
    /** Subscription format type */
    type?: string;
  };

  type getV2PublicOrdersOrderNoEventsParams = {
    /** Order number */
    orderNo: string;
    /** Short-lived order event ticket */
    ticket: string;
    /** Replay cursor when Last-Event-ID is unavailable */
    after?: string;
  };

  type getV2PublicOrdersOrderNoParams = {
    /** Order number */
    orderNo: string;
    /** Guest checkout capability */
    checkout_token?: string;
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
    user_subscribe_id?: number;
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

  type postV2PublicOrdersOrderNoCheckoutParams = {
    /** Order number */
    orderNo: string;
  };

  type postV2PublicOrdersOrderNoEventTicketParams = {
    /** Order number */
    orderNo: string;
  };

  type postV2PublicOrdersOrderNoSessionParams = {
    /** Order number */
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

  type PreUnsubscribeRequest = {
    id: string;
  };

  type PreUnsubscribeResponse = {
    deduction_amount: number;
  };

  type PurchaseOrderRequest = {
    subscribe_id: string;
    quantity: number;
    payment?: string;
    coupon?: string;
    user_subscribe_id?: number;
  };

  type PurchaseOrderResponse = {
    order_no: string;
  };

  type QueryAnnouncementResponse = {
    total: number;
    announcements: Announcement[];
  };

  type QueryDocumentListResponse = {
    total: number;
    list: Document[];
  };

  type QueryOrderListResponse = {
    total: number;
    list: OrderDetail[];
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

  type QuerySubscribeListResponse = {
    list: Subscribe[];
    total: number;
  };

  type QueryUserAffiliateCountResponse = {
    registers: number;
    total_commission: number;
  };

  type QueryUserAffiliateListResponse = {
    list: UserAffiliate[];
    total: number;
  };

  type QueryUserBalanceLogListResponse = {
    list: BalanceLog[];
    total: number;
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

  type QueryWithdrawalLogListResponse = {
    list: WithdrawalLog[];
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

  type ResetUserSubscribeTokenRequest = {
    user_subscribe_id: string;
  };

  type ResponseErrorBean = {
    code: number;
    msg: string;
  };

  type ResponseSuccessBean = {
    code: number;
    msg: string;
  };

  type StripePayment = {
    method: string;
    client_secret: string;
    publishable_key: string;
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
    nodes: string[];
    node_tags: string[];
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

  type SubscribeDiscount = {
    quantity: number;
    discount: number;
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

  type UnbindDeviceRequest = {
    id: string;
  };

  type UnbindOAuthRequest = {
    method: string;
  };

  type UnsubscribeRequest = {
    id: string;
  };

  type UpdateBindEmailRequest = {
    email: string;
    code?: string;
    current_code?: string;
    password?: string;
  };

  type UpdateBindMobileRequest = {
    area_code: string;
    mobile: string;
    code: string;
    current_code?: string;
    password?: string;
  };

  type UpdateUserNotifyRequest = {
    enable_balance_notify: boolean;
    enable_login_notify: boolean;
    enable_subscribe_notify: boolean;
    enable_trade_notify: boolean;
  };

  type UpdateUserPasswordRequest = {
    password: string;
    current_code?: string;
    old_password?: string;
  };

  type UpdateUserPasswordResponse = {
    /** ThirdPartyBindings lists the types of the third-party sign-in methods
(OAuth providers, Telegram) still bound to the account, so the client
can show them: a binding made during a compromise keeps signing in
until its owner removes it. */
    third_party_bindings: string[];
  };

  type UpdateUserRulesRequest = {
    rules: string[];
  };

  type UpdateUserSubscribeNoteRequest = {
    user_subscribe_id: string;
    note: string;
  };

  type UpdateUserTicketStatusRequest = {
    id: string;
    status: number;
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
    actor_id?: number;
    ip_as_organization?: string;
    ip_asn?: number;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    ip_region?: string;
  };

  type UserSubscribe = {
    id: string;
    id_str: string;
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
    download: number;
    upload: number;
    token: string;
    status: number;
    created_at: number;
    updated_at: number;
    is_try_out: boolean;
    nodes: UserSubscribeNodeInfo[];
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

  type UserSubscribeNodeInfo = {
    id: string;
    name: string;
    uuid: string;
    protocol: string;
    port: number;
    address: string;
    tags: string[];
    country: string;
    city: string;
    created_at: number;
  };

  type V2CheckoutOrderRequest = {
    checkout_token?: string;
    return_url?: string;
  };

  type V2CreateOrderRequest = {
    amount?: number;
    coupon?: string;
    guest?: V2GuestOrderRequest;
    payment_id?: number;
    quantity?: number;
    return_url?: string;
    subscribe_id?: number;
    type?: string;
    user_subscribe_id?: number;
  };

  type V2EventTicketRequest = {
    checkout_token?: string;
  };

  type V2EventTicketResponse = {
    ticket_expires_at: number;
    url: string;
  };

  type V2GuestOrderRequest = {
    auth_type?: "email" | "mobile";
    identifier?: string;
    invite_code?: string;
    password?: string;
    turnstile_token?: string;
  };

  type V2OrderEvents = {
    ticket_expires_at: number;
    url: string;
  };

  type V2OrderPayment = {
    checkout_url: string;
    payment_status: string;
    stripe: StripePayment;
    /** Type is url, qr, stripe, or balance. */
    type: "url" | "qr" | "stripe" | "balance";
  };

  type V2OrderResponse = {
    checkout_token: string;
    events: V2OrderEvents;
    order: V2OrderSnapshot;
    payment: V2OrderPayment;
  };

  type V2OrderSessionRequest = {
    checkout_token?: string;
  };

  type V2OrderSessionResponse = {
    access_token: string;
  };

  type V2OrderSnapshot = {
    amount: number;
    currency: string;
    expires_at: number;
    fulfillment_status: string;
    order_no: string;
    payment_status: string;
    state_version: number;
    status: string;
  };

  type VerifyEmailRequest = {
    email: string;
    code: string;
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
    config: Record<string, any>;
    enabled: boolean;
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

  type CurrencyConfig = {
    access_key: string;
    currency_unit: string;
    currency_symbol: string;
  };

  type DeviceAuthticateConfig = {
    enable: boolean;
    show_ads: boolean;
    enable_security: boolean;
    only_real_device: boolean;
  };

  type DownloadLink = {
    ios?: string;
    android?: string;
    windows?: string;
    mac?: string;
    linux?: string;
    harmony?: string;
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

  type GetLoginLogParams = {
    page: number;
    size: number;
  };

  type GetLoginLogRequest = {
    page: number;
    size: number;
  };

  type GetSubscribeLogParams = {
    page: number;
    size: number;
  };

  type GetSubscribeLogRequest = {
    page: number;
    size: number;
  };

  type GetSubscriptionParams = {
    language: string;
  };

  type GetSubscriptionRequest = {
    language: string;
  };

  type GetUserSubscribeTrafficLogsRequest = {
    page: number;
    size: number;
    user_id: string;
    subscribe_id: string;
    start_time: number;
    end_time: number;
  };

  type GetUserSubscribeTrafficLogsResponse = {
    list: TrafficLog[];
    total: number;
  };

  type GetUserTicketDetailRequest = {
    id: string;
  };

  type GetUserTicketDetailsParams = {
    id: string;
  };

  type GetUserTicketListParams = {
    page: number;
    size: number;
    status?: number;
    search?: string;
  };

  type GetUserTicketListRequest = {
    page: number;
    size: number;
    status?: number;
    search?: string;
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

  type MessageLog = {
    id: string;
    type: number;
    platform: string;
    to: string;
    subject: string;
    content: Record<string, any>;
    status: number;
    created_at: number;
  };

  type MobileAuthenticateConfig = {
    enable: boolean;
    enable_whitelist: boolean;
    whitelist: string[];
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
    enable: boolean;
    currency_unit?: string;
    exchange_rate?: number;
    bill_desc?: string;
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

  type PreRenewalOrderResponse = {
    orderNo: string;
  };

  type PrivacyPolicyConfig = {
    privacy_policy: string;
  };

  type Protocol = {
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
    /** mux, eg: off/low/medium/high */
    multiplex?: string;
    /** padding scheme */
    padding_scheme?: string;
    /** upload speed limit */
    up_mbps?: number;
    /** download speed limit */
    down_mbps?: number;
    /** obfs, 'none', 'http', 'tls' */
    obfs?: string;
    /** obfs host */
    obfs_host?: string;
    /** obfs path */
    obfs_path?: string;
    /** xhttp mode */
    xhttp_mode?: string;
    /** xhttp extra path */
    xhttp_extra?: string;
    /** encryption，'none', 'mlkem768x25519plus' */
    encryption?: string;
    /** encryption mode，'native', 'xorpub', 'random' */
    encryption_mode?: string;
    /** encryption rtt，'0rtt', '1rtt' */
    encryption_rtt?: string;
    /** encryption ticket */
    encryption_ticket?: string;
    /** encryption server padding */
    encryption_server_padding?: string;
    /** encryption private key */
    encryption_private_key?: string;
    /** encryption client padding */
    encryption_client_padding?: string;
    /** encryption password */
    encryption_password?: string;
    /** Traffic ratio, default is 1 */
    ratio?: number;
    /** Certificate mode, `none`｜`http`｜`dns`｜`self` */
    cert_mode?: string;
    /** DNS provider for certificate */
    cert_dns_provider?: string;
    /** Environment for DNS provider */
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

  type QueryAnnouncementParams = {
    page: number;
    size: number;
    pinned?: boolean;
    popup?: boolean;
  };

  type QueryAnnouncementRequest = {
    page: number;
    size: number;
    pinned: boolean;
    popup: boolean;
  };

  type QueryDocumentDetailParams = {
    id: string;
  };

  type QueryDocumentDetailRequest = {
    id: string;
  };

  type QueryOrderDetailParams = {
    order_no: string;
  };

  type QueryOrderDetailRequest = {
    order_no: string;
  };

  type QueryOrderListParams = {
    page: number;
    size: number;
  };

  type QueryOrderListRequest = {
    page: number;
    size: number;
  };

  type QueryPurchaseOrderParams = {
    checkout_token?: string;
    order_no: string;
  };

  type QueryPurchaseOrderRequest = {
    checkout_token?: string;
    order_no: string;
  };

  type QuerySubscribeGroupListResponse = {
    list: SubscribeGroup[];
    total: number;
  };

  type QuerySubscribeListParams = {
    language: string;
  };

  type QuerySubscribeListRequest = {
    language: string;
  };

  type QueryUserAffiliateListParams = {
    page: number;
    size: number;
  };

  type QueryUserAffiliateListRequest = {
    page: number;
    size: number;
  };

  type QueryUserCommissionLogListRequest = {
    page: number;
    size: number;
  };

  type QueryUserCommissionLogParams = {
    page: number;
    size: number;
  };

  type QueryWithdrawalLogListRequest = {
    page: number;
    size: number;
  };

  type QueryWithdrawalLogParams = {
    page: number;
    size: number;
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
  };

  type ResetSubscribeTrafficLog = {
    id: string;
    type: number;
    user_subscribe_id: string;
    order_no?: string;
    timestamp: number;
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

  type SortItem = {
    id: string;
    sort: number;
  };

  type SubscribeConfig = {
    single_model: boolean;
    subscribe_path: string;
    subscribe_domain: string;
    pan_domain: boolean;
    user_agent_limit: boolean;
    user_agent_list: string;
    show_tutorial?: boolean;
  };

  type SubscribeGroup = {
    id: string;
    name: string;
    description: string;
    created_at: number;
    updated_at: number;
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

  type TimePeriod = {
    start_time: string;
    end_time: string;
    multiplier: number;
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
}
