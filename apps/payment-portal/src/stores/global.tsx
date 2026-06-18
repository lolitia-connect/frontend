import {
  queryOrderDetail,
  queryOrderList,
} from "@workspace/ui/services/user/order";
import {
  getAvailablePaymentMethods,
  purchaseCheckout,
} from "@workspace/ui/services/user/portal";
import { queryUserInfo } from "@workspace/ui/services/user/user";
import { create } from "zustand";
import type {
  ActiveOrder,
  CheckoutInfo,
  CurrentUserSummary,
  PaymentMethod,
  RechargeRecord,
} from "@/types";

function mapPaymentMethod(item: any): PaymentMethod {
  return {
    id: String(item?.id || ""),
    name: String(item?.name || ""),
    platform: String(item?.platform || ""),
    description: item?.description ? String(item.description) : "",
    icon: item?.icon ? String(item.icon) : "",
    fee_mode: Number(item?.fee_mode || 0),
    fee_percent: Number(item?.fee_percent || 0),
    fee_amount: Number(item?.fee_amount || 0),
  };
}

function mapRechargeRecord(item: any): RechargeRecord {
  return {
    id: Number(item?.id || 0),
    orderNo: String(item?.order_no || ""),
    tradeNo: String(item?.trade_no || ""),
    type: Number(item?.type || 0),
    amount: Number(item?.price || item?.amount || 0) / 100,
    createdAt: Number(item?.created_at || 0),
    status: Number(item?.status || 0),
    paymentName: item?.payment?.name ? String(item.payment.name) : "",
  };
}

function mapCurrentUser(item: any): CurrentUserSummary {
  const authMethods = Array.isArray(item?.auth_methods)
    ? item.auth_methods
    : [];
  const emailMethod = authMethods.find(
    (method: any) =>
      String(method?.auth_type || "").toLowerCase() === "email" &&
      method?.auth_identifier
  );

  return {
    balance: Number(item?.balance || 0) / 100,
    email: emailMethod?.auth_identifier
      ? String(emailMethod.auth_identifier)
      : "",
  };
}

function mapCheckoutInfo(item: any): CheckoutInfo | undefined {
  if (!item?.type) return;

  return {
    type: String(item.type),
    checkoutUrl: item.checkout_url ? String(item.checkout_url) : undefined,
    stripe: item?.stripe
      ? {
          method: String(item.stripe.method || ""),
          client_secret: String(item.stripe.client_secret || ""),
          publishable_key: String(item.stripe.publishable_key || ""),
        }
      : undefined,
  };
}

function mapActiveOrder(item: any, checkout?: CheckoutInfo): ActiveOrder {
  return {
    id: Number(item?.id || 0),
    orderNo: String(item?.order_no || ""),
    tradeNo: String(item?.trade_no || ""),
    rechargeAmount: Number(item?.price || item?.amount || 0) / 100,
    amount: Number(item?.amount || 0) / 100,
    createdAt: Number(item?.created_at || 0),
    status: Number(item?.status || 0),
    paymentId: String(item?.payment?.id || ""),
    paymentName: item?.payment?.name
      ? String(item.payment.name)
      : String(item?.payment?.platform || ""),
    checkout,
  };
}

export interface PortalStore {
  activeOrder: ActiveOrder | null;
  // Global config
  common: API.GetGlobalConfigResponse;
  customAmountEnabled: boolean;
  customAmountInput: string;
  // Loading states
  loadingPortal: boolean;
  // Payment data
  paymentMethods: PaymentMethod[];
  records: RechargeRecord[];
  refreshActiveOrder: (
    orderNo: string,
    options?: { autoOpenPayment?: boolean; requestCheckout?: boolean }
  ) => Promise<void>;
  // Actions
  refreshPortal: () => Promise<void>;
  reset: () => void;
  selectedAmount: number;
  // Selection state
  selectedMethodId: string | null;
  setActiveOrder: (order: ActiveOrder | null) => void;
  setCommon: (common: Partial<API.GetGlobalConfigResponse>) => void;
  setCustomAmountEnabled: (enabled: boolean) => void;
  setCustomAmountInput: (input: string) => void;
  setSelectedAmount: (amount: number) => void;
  setSelectedMethodId: (id: string | null) => void;
  // User data
  userBalance: number | null;
  userEmail: string;
}

export const usePortalStore = create<PortalStore>((set, get) => ({
  common: {
    site: {
      host: "",
      site_name: "",
      site_desc: "",
      site_logo: "",
      keywords: "",
      custom_html: "",
      custom_data: "",
    },
    verify: {
      turnstile_site_key: "",
      captcha_type: "turnstile",
      enable_login_verify: false,
      enable_register_verify: false,
      enable_reset_password_verify: false,
      enable_user_login_captcha: false,
      enable_user_register_captcha: false,
      enable_user_reset_password_captcha: false,
      enable_admin_login_captcha: false,
    },
    auth: {
      mobile: {
        enable: false,
        enable_whitelist: false,
        whitelist: [],
      },
      email: {
        enable: false,
        enable_verify: false,
        enable_domain_suffix: false,
        domain_suffix_list: "",
      },
      register: {
        stop_register: false,
        enable_ip_register_limit: false,
        ip_register_limit: 0,
        ip_register_limit_duration: 0,
      },
      device: {
        enable: false,
        show_ads: false,
        enable_security: false,
        only_real_device: false,
      },
    },
    invite: {
      forced_invite: false,
      referral_percentage: 0,
      only_first_purchase: false,
    },
    currency: {
      currency_unit: "USD",
      currency_symbol: "$",
    },
    subscribe: {
      single_model: false,
      subscribe_path: "",
      subscribe_domain: "",
      pan_domain: false,
      user_agent_limit: false,
      user_agent_list: "",
    },
    verify_code: {
      verify_code_expire_time: 5,
      verify_code_limit: 15,
      verify_code_interval: 60,
    },
    oauth_methods: [],
    web_ad: false,
  },
  setCommon: (common) =>
    set((state) => ({
      common: {
        ...state.common,
        ...common,
      },
    })),
  userBalance: null,
  userEmail: "",
  paymentMethods: [],
  records: [],
  activeOrder: null,
  selectedMethodId: null,
  selectedAmount: 10,
  customAmountEnabled: false,
  customAmountInput: "",
  loadingPortal: false,

  refreshPortal: async () => {
    set({ loadingPortal: true });
    try {
      const [userResponse, methodsResponse, ordersResponse] = await Promise.all(
        [
          queryUserInfo(),
          getAvailablePaymentMethods(),
          queryOrderList({ page: 1, size: 20 }),
        ]
      );

      const userSummary = mapCurrentUser(userResponse.data?.data);
      const methods = ((methodsResponse.data.data?.list || []) as any[])
        .filter((item) => item?.id !== "-1")
        .map(mapPaymentMethod);

      const rechargeOrderItems = (
        (ordersResponse.data.data?.list || []) as any[]
      )
        .filter((item) => Number(item?.type) === 4)
        .sort(
          (a, b) => Number(b?.created_at || 0) - Number(a?.created_at || 0)
        );

      set({
        userBalance: userSummary.balance,
        userEmail: userSummary.email,
        paymentMethods: methods,
        records: rechargeOrderItems.map(mapRechargeRecord),
      });

      // Auto-select first method if current selection is invalid
      const state = get();
      if (
        state.selectedMethodId &&
        methods.some((item) => item.id === state.selectedMethodId)
      ) {
        // keep current
      } else {
        set({ selectedMethodId: methods[0]?.id ?? null });
      }

      // Check for pending order (don't auto-request checkout)
      const pendingRechargeOrder = rechargeOrderItems.find(
        (item) => Number(item?.status) === 1
      );

      if (pendingRechargeOrder?.order_no) {
        const orderNo = String(pendingRechargeOrder.order_no);
        const detailResponse = await queryOrderDetail({ order_no: orderNo });
        const detail = detailResponse.data.data;
        if (detail) {
          set({ activeOrder: mapActiveOrder(detail) });
        }
      }
    } finally {
      set({ loadingPortal: false });
    }
  },

  refreshActiveOrder: async (orderNo, options) => {
    if (!orderNo) return;
    const autoOpenPayment = Boolean(options?.autoOpenPayment);
    const requestCheckout = Boolean(options?.requestCheckout);

    const detailResponse = await queryOrderDetail({ order_no: orderNo });
    const detail = detailResponse.data.data;
    if (!detail) return;

    let checkout: CheckoutInfo | undefined;
    if (requestCheckout && Number(detail.status) === 1) {
      try {
        const checkoutResponse = await purchaseCheckout({
          orderNo,
          returnUrl: window.location.href,
        });
        checkout = mapCheckoutInfo(checkoutResponse.data.data);
      } catch {
        checkout = undefined;
      }
    }

    const current = get().activeOrder;
    set({
      activeOrder: mapActiveOrder(
        detail,
        checkout ||
          (Number(detail.status) === 1 && current?.orderNo === orderNo
            ? current.checkout
            : undefined)
      ),
    });

    if (autoOpenPayment && checkout?.type === "url" && checkout.checkoutUrl) {
      window.open(checkout.checkoutUrl, "_blank", "noopener,noreferrer");
    }
    if (autoOpenPayment && checkout?.type === "stripe" && checkout.stripe) {
      // Handled by the component
    }
  },

  setSelectedMethodId: (id) => set({ selectedMethodId: id }),
  setSelectedAmount: (amount) => set({ selectedAmount: amount }),
  setCustomAmountEnabled: (enabled) => set({ customAmountEnabled: enabled }),
  setCustomAmountInput: (input) => set({ customAmountInput: input }),
  setActiveOrder: (order) => set({ activeOrder: order }),

  reset: () =>
    set({
      userBalance: null,
      userEmail: "",
      paymentMethods: [],
      records: [],
      activeOrder: null,
      selectedMethodId: null,
      selectedAmount: 10,
      customAmountEnabled: false,
      customAmountInput: "",
      loadingPortal: false,
    }),
}));
