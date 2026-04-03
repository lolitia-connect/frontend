import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmRechargeDialog } from "@/components/confirm-recharge-dialog";
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile";
import { LoginScreen } from "@/components/login-screen";
import { LocalCaptcha } from "@/components/local-captcha";
import { RechargeScreen } from "@/components/recharge-screen";
import { SliderCaptcha } from "@/components/slider-captcha";
import { portalConfig } from "@/config";
import { clearAuthorization, getAuthorization, setAuthorization } from "@/lib/auth";
import type { FeeBreakdown } from "@/lib/fees";
import { toMinorUnits } from "@/lib/fees";
import type {
  ActiveOrder,
  CheckoutInfo,
  PaymentMethod,
  PortalVerifyConfig,
  RechargeRecord,
} from "@/types";
import { userLogin } from "@workspace/ui/services/common/auth";
import { getGlobalConfig } from "@workspace/ui/services/common/common";
import {
  queryOrderDetail,
  queryOrderList,
  recharge,
} from "@workspace/ui/services/user/order";
import {
  getAvailablePaymentMethods,
  purchaseCheckout,
} from "@workspace/ui/services/user/portal";
import { queryUserInfo } from "@workspace/ui/services/user/user";

function mapPaymentMethod(item: any): PaymentMethod {
  return {
    id: Number(item?.id || 0),
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
    amount: Number(item?.amount || 0) / 100,
    createdAt: Number(item?.created_at || 0),
    status: Number(item?.status || 0),
    paymentName: item?.payment?.name ? String(item.payment.name) : "",
  };
}

function mapCheckoutInfo(item: any): CheckoutInfo | undefined {
  if (!item?.type) return;

  return {
    type: String(item.type),
    checkoutUrl: item.checkout_url ? String(item.checkout_url) : undefined,
  };
}

function mapActiveOrder(item: any, checkout?: CheckoutInfo): ActiveOrder {
  return {
    id: Number(item?.id || 0),
    orderNo: String(item?.order_no || ""),
    tradeNo: String(item?.trade_no || ""),
    amount: Number(item?.amount || 0) / 100,
    createdAt: Number(item?.created_at || 0),
    status: Number(item?.status || 0),
    paymentName: item?.payment?.name
      ? String(item.payment.name)
      : String(item?.payment?.platform || ""),
    checkout,
  };
}

const defaultVerifyConfig: PortalVerifyConfig = {
  turnstile_site_key: "",
  captcha_type: "turnstile",
  enable_user_login_captcha: false,
};

function mapOrderBreakdown(detail: any): FeeBreakdown {
  const orderAmount = Number(detail?.amount || 0) / 100;
  const orderPrice = Number(detail?.price || 0) / 100;
  const feeAmount = Number(detail?.fee_amount || 0) / 100;

  return {
    amount: orderPrice || orderAmount,
    fee: feeAmount,
    total: orderAmount,
  };
}

export default function App() {
  const { t, i18n } = useTranslation("app");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [verifyConfig, setVerifyConfig] =
    useState<PortalVerifyConfig>(defaultVerifyConfig);
  const [configLoading, setConfigLoading] = useState(true);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [authenticated, setAuthenticated] = useState(Boolean(getAuthorization()));
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [records, setRecords] = useState<RechargeRecord[]>([]);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(
    portalConfig.rechargeAmounts[0] || 10
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOrderNo, setConfirmOrderNo] = useState("");
  const [confirmBreakdown, setConfirmBreakdown] = useState<FeeBreakdown | null>(
    null
  );
  const [confirmPaymentName, setConfirmPaymentName] = useState("");
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loginPending, startLoginTransition] = useTransition();
  const [submitPending, startSubmitTransition] = useTransition();
  const configLoadedRef = useRef(false);
  const portalBootstrappedRef = useRef(false);

  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en-US";

  const captchaEnabled = verifyConfig.enable_user_login_captcha;
  const captchaType = verifyConfig.captcha_type;

  const resetCaptcha = () => {
    setCaptchaValue("");
    setCaptchaId("");
    setCaptchaResetKey((value) => value + 1);
  };

  const refreshPortal = useCallback(async () => {
    if (!getAuthorization()) {
      setAuthenticated(false);
      return;
    }

    setLoadingPortal(true);
    try {
      const [userResponse, methodsResponse, ordersResponse] = await Promise.all([
        queryUserInfo(),
        getAvailablePaymentMethods(),
        queryOrderList({ page: 1, size: 20 }),
      ]);

      setUserBalance(
        typeof userResponse.data?.data?.balance === "number"
          ? userResponse.data.data.balance
          : 0
      );

      const methods = ((methodsResponse.data.data?.list || []) as any[])
        .filter((item) => Number(item?.id) !== -1)
        .map(mapPaymentMethod);

      setPaymentMethods(methods);
      setSelectedMethodId((current) => {
        if (current && methods.some((item) => item.id === current)) return current;
        return methods[0]?.id ?? null;
      });

      const rechargeRecords = ((ordersResponse.data.data?.list || []) as any[])
        .filter((item) => Number(item?.type) === 4)
        .map(mapRechargeRecord);

      setRecords(rechargeRecords);
    } finally {
      setLoadingPortal(false);
    }
  }, []);

  const refreshActiveOrder = useCallback(
    async (orderNo: string, autoOpenPayment: boolean = false) => {
      if (!orderNo) return;

      const detailResponse = await queryOrderDetail({ order_no: orderNo });
      const detail = detailResponse.data.data;
      if (!detail) return;

      let checkout: CheckoutInfo | undefined;
      if (Number(detail.status) === 1) {
        try {
          const checkoutResponse = await purchaseCheckout({
            orderNo,
            returnUrl: window.location.href,
          });
          checkout = mapCheckoutInfo(checkoutResponse.data.data);
        } catch (_error) {
          checkout = undefined;
        }
      }

      setActiveOrder(mapActiveOrder(detail, checkout));

      if (autoOpenPayment && checkout?.type === "url" && checkout.checkoutUrl) {
        window.open(checkout.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    },
    []
  );

  useEffect(() => {
    if (configLoadedRef.current) return;
    configLoadedRef.current = true;

    const loadConfig = async () => {
      setConfigLoading(true);
      try {
        const response = await getGlobalConfig();
        const site = response.data?.data?.site;
        const verify = response.data?.data?.verify;
        if (site) {
          setSiteName(String(site.site_name || ""));
          setSiteLogo(String(site.site_logo || ""));
        }
        if (verify) {
          setVerifyConfig({
            turnstile_site_key: String(verify.turnstile_site_key || ""),
            captcha_type: String(verify.captcha_type || "turnstile"),
            enable_user_login_captcha: Boolean(verify.enable_user_login_captcha),
          });
        }
      } catch (_error) {
        setVerifyConfig(defaultVerifyConfig);
      } finally {
        setConfigLoading(false);
      }
    };

    void loadConfig();
  }, []);

  useEffect(() => {
    resetCaptcha();
  }, [captchaType]);

  useEffect(() => {
    if (!authenticated) return;
    if (portalBootstrappedRef.current) return;
    portalBootstrappedRef.current = true;
    void refreshPortal();
  }, [authenticated, refreshPortal]);

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    clearAuthorization();
    portalBootstrappedRef.current = false;
    setAuthenticated(false);
    setPaymentMethods([]);
    setRecords([]);
    setUserBalance(null);
    setActiveOrder(null);
    setConfirmOpen(false);
    setConfirmOrderNo("");
    setConfirmBreakdown(null);
    setConfirmPaymentName("");
  };

  const handleLogin = () => {
    if (!account.trim() || !password.trim()) {
      toast.error(
        t("errors.missingCredentials", "请输入账号和密码后再继续登录。")
      );
      return;
    }

    if (configLoading) return;

    if (captchaEnabled) {
      if (!captchaValue.trim()) {
        toast.error(
          t("errors.missingCaptcha", "请先完成验证码验证。")
        );
        return;
      }
      if (captchaType === "local" && !captchaId) {
        toast.error(
          t("errors.missingCaptcha", "请先完成验证码验证。")
        );
        return;
      }
    }

    startLoginTransition(async () => {
      try {
        const payload: Record<string, string> = {
          email: account.trim(),
          password,
        };

        if (captchaEnabled) {
          if (captchaType === "turnstile") {
            payload.cf_token = captchaValue;
          } else if (captchaType === "local") {
            payload.captcha_code = captchaValue;
            payload.captcha_id = captchaId;
          } else if (captchaType === "slider") {
            payload.slider_token = captchaValue;
          }
        }

        const response = await userLogin(payload as any);

        const token = response.data.data?.token;
        if (!token) {
          toast.error(t("errors.loginFailed", "登录失败，请稍后重试。"));
          return;
        }

        setAuthorization(String(token));
        portalBootstrappedRef.current = true;
        await refreshPortal();
        setAuthenticated(true);
        toast.success(t("login.success", "登录成功"));
      } catch (_error) {
        resetCaptcha();
      }
    });
  };

  const handleOpenConfirm = () => {
    if (selectedMethodId == null || !selectedAmount) {
      toast.error(
        t("errors.missingSelection", "请先选择充值方式和充值金额。")
      );
      return;
    }

    startSubmitTransition(async () => {
      try {
        const response = await recharge({
          amount: toMinorUnits(selectedAmount),
          payment: selectedMethodId,
        });
        const orderNo = response.data.data?.order_no;
        if (!orderNo) {
          toast.error(t("errors.orderFailed", "充值订单创建失败。"));
          return;
        }

        const detailResponse = await queryOrderDetail({ order_no: String(orderNo) });
        const detail = detailResponse.data.data;
        if (!detail) {
          toast.error(t("errors.orderFailed", "充值订单创建失败。"));
          return;
        }

        setConfirmOrderNo(String(orderNo));
        setConfirmBreakdown(mapOrderBreakdown(detail));
        setConfirmPaymentName(
          detail?.payment?.name
            ? String(detail.payment.name)
            : String(detail?.payment?.platform || "")
        );
        setActiveOrder(mapActiveOrder(detail));
        setConfirmOpen(true);
        await refreshPortal();
      } catch (_error) {
        /* request.ts handles the error toast */
      }
    });
  };

  const handleCreateOrder = () => {
    if (!confirmOrderNo) return;

    startSubmitTransition(async () => {
      try {
        setConfirmOpen(false);
        toast.success(t("dialog.success", "订单已确认，正在拉起支付"));
        await refreshPortal();
        await refreshActiveOrder(confirmOrderNo, true);
      } catch (_error) {
        /* request.ts handles the error toast */
      }
    });
  };

  const handleContinuePayment = () => {
    const checkoutUrl = activeOrder?.checkout?.checkoutUrl;
    if (!checkoutUrl) return;
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    document.title = t("meta.title", "Payment Portal");
  }, [t]);

  const captchaSlot = useMemo(() => {
    if (!captchaEnabled) return null;

    if (captchaType === "turnstile") {
      return (
        <CloudflareTurnstile
          language={currentLanguage}
          onChange={setCaptchaValue}
          resetKey={captchaResetKey}
          siteKey={verifyConfig.turnstile_site_key}
          value={captchaValue}
        />
      );
    }

    if (captchaType === "local") {
      return (
        <LocalCaptcha
          onCaptchaIdChange={setCaptchaId}
          onChange={setCaptchaValue}
          resetKey={captchaResetKey}
          value={captchaValue}
        />
      );
    }

    if (captchaType === "slider") {
      return (
        <SliderCaptcha
          onChange={setCaptchaValue}
          resetKey={captchaResetKey}
          value={captchaValue}
        />
      );
    }

    return null;
  }, [
    captchaEnabled,
    captchaResetKey,
    captchaType,
    captchaValue,
    currentLanguage,
    verifyConfig.turnstile_site_key,
  ]);

  if (!authenticated) {
    return (
      <LoginScreen
        account={account}
        captchaSlot={captchaSlot}
        configLoading={configLoading}
        currentLanguage={currentLanguage}
        loading={loginPending}
        newsItems={portalConfig.newsItems}
        onAccountChange={setAccount}
        onLanguageChange={changeLanguage}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        password={password}
        siteLogo={siteLogo}
        siteName={siteName}
      />
    );
  }

  return (
    <>
      <RechargeScreen
        activeOrder={activeOrder}
        amounts={portalConfig.rechargeAmounts}
        currency={portalConfig.currency}
        currentLanguage={currentLanguage}
        loadingData={loadingPortal}
        methods={paymentMethods}
        onAmountSelect={setSelectedAmount}
        onContinuePayment={handleContinuePayment}
        onLanguageChange={changeLanguage}
        onLogout={handleLogout}
        onMethodSelect={setSelectedMethodId}
        onOpenConfirm={handleOpenConfirm}
        onRefresh={() => {
          void refreshPortal();
          if (activeOrder?.orderNo) void refreshActiveOrder(activeOrder.orderNo);
        }}
        onRefreshOrder={() => {
          if (activeOrder?.orderNo) void refreshActiveOrder(activeOrder.orderNo);
        }}
        records={records}
        selectedAmount={selectedAmount}
        selectedMethodId={selectedMethodId}
        submitting={submitPending}
        userBalance={userBalance}
      />

      <ConfirmRechargeDialog
        breakdown={confirmBreakdown}
        currency={portalConfig.currency}
        language={currentLanguage}
        loading={submitPending}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmOrderNo("");
          setConfirmBreakdown(null);
          setConfirmPaymentName("");
        }}
        onConfirm={handleCreateOrder}
        open={confirmOpen}
        paymentMethodName={confirmPaymentName}
      />
    </>
  );
}
