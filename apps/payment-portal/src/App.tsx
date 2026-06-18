import { userLogin } from "@workspace/ui/services/common/auth";
import { getGlobalConfig } from "@workspace/ui/services/common/common";
import { queryOrderDetail, recharge } from "@workspace/ui/services/user/order";
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
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile";
import { ConfirmRechargeDialog } from "@/components/confirm-recharge-dialog";
import { LocalCaptcha } from "@/components/local-captcha";
import { LoginScreen } from "@/components/login-screen";
import { RechargeScreen } from "@/components/recharge-screen";
import { SliderCaptcha } from "@/components/slider-captcha";
import { StripeCheckoutDialog } from "@/components/stripe-checkout-dialog";
import { portalConfig } from "@/config";
import {
  clearAuthorization,
  getAuthorization,
  setAuthorization,
} from "@/lib/auth";
import type { FeeBreakdown } from "@/lib/fees";
import { toMinorUnits } from "@/lib/fees";
import { usePortalStore } from "@/stores/global";

export default function App() {
  const { t, i18n } = useTranslation("app");
  const {
    paymentMethods,
    records,
    activeOrder,
    userBalance,
    userEmail,
    selectedMethodId,
    selectedAmount,
    customAmountEnabled,
    customAmountInput,
    loadingPortal,
    refreshPortal,
    refreshActiveOrder,
    setSelectedMethodId,
    setSelectedAmount,
    setCustomAmountEnabled,
    setCustomAmountInput,
    setActiveOrder,
    reset,
    common,
  } = usePortalStore();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [configLoading, setConfigLoading] = useState(true);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [authenticated, setAuthenticated] = useState(
    Boolean(getAuthorization())
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOrderNo, setConfirmOrderNo] = useState("");
  const [confirmBreakdown, setConfirmBreakdown] = useState<FeeBreakdown | null>(
    null
  );
  const [confirmPaymentName, setConfirmPaymentName] = useState("");
  const [stripeDialogOpen, setStripeDialogOpen] = useState(false);
  const [loginPending, startLoginTransition] = useTransition();
  const [submitPending, startSubmitTransition] = useTransition();
  const configLoadedRef = useRef(false);
  const portalBootstrappedRef = useRef(false);
  const completedOrderNoticeRef = useRef("");

  const { site, verify } = common;
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en-US";
  const minimumCustomAmount = portalConfig.minCustomAmount;

  const isCurrentSelectionPendingOrder =
    Number(activeOrder?.status) === 1 &&
    activeOrder?.paymentId === selectedMethodId &&
    Math.abs((activeOrder?.rechargeAmount || 0) - selectedAmount) < 0.0001;

  const captchaEnabled = verify.enable_user_login_captcha;
  const captchaType = verify.captcha_type;

  const resetCaptcha = () => {
    setCaptchaValue("");
    setCaptchaId("");
    setCaptchaResetKey((value) => value + 1);
  };

  // Load config on mount
  useEffect(() => {
    if (configLoadedRef.current) return;
    configLoadedRef.current = true;

    const loadConfig = async () => {
      setConfigLoading(true);
      try {
        const response = await getGlobalConfig();
        if (response.data?.data) {
          usePortalStore.getState().setCommon(response.data.data);
        }
      } catch {
        // Keep default common config on error
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Reset captcha when type changes
  useEffect(() => {
    resetCaptcha();
  }, [captchaType]);

  // Bootstrap portal when authenticated
  useEffect(() => {
    if (!authenticated) return;
    if (portalBootstrappedRef.current) return;
    portalBootstrappedRef.current = true;
    refreshPortal();
  }, [authenticated, refreshPortal]);

  // Poll active order
  useEffect(() => {
    if (!activeOrder?.orderNo) return;
    if (Number(activeOrder.status) !== 1) return;

    const timer = window.setInterval(() => {
      refreshActiveOrder(activeOrder.orderNo);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [activeOrder?.orderNo, activeOrder?.status, refreshActiveOrder]);

  // Handle completed order
  useEffect(() => {
    if (!activeOrder?.orderNo) return;
    if (![2, 5].includes(Number(activeOrder.status))) return;
    if (completedOrderNoticeRef.current === activeOrder.orderNo) return;

    completedOrderNoticeRef.current = activeOrder.orderNo;
    setStripeDialogOpen(false);
    toast.success(
      t("dashboard.paymentSuccess", "支付成功，余额和订单记录已更新")
    );
    refreshPortal();
  }, [activeOrder?.orderNo, activeOrder?.status, refreshPortal, t]);

  // Close stripe dialog when order is not pending
  useEffect(() => {
    if (!activeOrder?.orderNo || Number(activeOrder.status) !== 1) {
      setStripeDialogOpen(false);
    }
  }, [activeOrder?.orderNo, activeOrder?.status]);

  // Reset custom amount when not enabled and selected amount is not in preset list
  useEffect(() => {
    if (
      !customAmountEnabled &&
      portalConfig.rechargeAmounts.includes(selectedAmount)
    ) {
      return;
    }

    if (!customAmountEnabled) {
      setCustomAmountEnabled(false);
      setCustomAmountInput("");
      if (!portalConfig.rechargeAmounts.includes(selectedAmount)) {
        setSelectedAmount(portalConfig.rechargeAmounts[0] || 1000);
      }
    }
  }, [customAmountEnabled, selectedAmount]);

  const handleLogout = useCallback(() => {
    clearAuthorization();
    portalBootstrappedRef.current = false;
    setAuthenticated(false);
    reset();
    setCustomAmountEnabled(false);
    setCustomAmountInput("");
    setActiveOrder(null);
    setStripeDialogOpen(false);
    setConfirmOpen(false);
    setConfirmOrderNo("");
    setConfirmBreakdown(null);
    setConfirmPaymentName("");
    completedOrderNoticeRef.current = "";
  }, [reset, setCustomAmountEnabled, setCustomAmountInput, setActiveOrder]);

  const handleLogin = useCallback(() => {
    if (!(account.trim() && password.trim())) {
      toast.error(
        t("errors.missingCredentials", "请输入账号和密码后再继续登录。")
      );
      return;
    }

    if (configLoading) return;

    if (captchaEnabled) {
      if (!captchaValue.trim()) {
        toast.error(t("errors.missingCaptcha", "请先完成验证码验证。"));
        return;
      }
      if (captchaType === "local" && !captchaId) {
        toast.error(t("errors.missingCaptcha", "请先完成验证码验证。"));
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
      } catch {
        resetCaptcha();
      }
    });
  }, [
    account,
    password,
    configLoading,
    captchaEnabled,
    captchaValue,
    captchaType,
    captchaId,
    captchaEnabled,
    t,
    refreshPortal,
  ]);

  const handleOpenConfirm = useCallback(() => {
    if (isCurrentSelectionPendingOrder) {
      toast.error(
        t("errors.pendingOrder", "当前已有待支付订单，请先完成支付。")
      );
      return;
    }

    if (selectedMethodId == null || !selectedAmount) {
      toast.error(t("errors.missingSelection", "请先选择充值方式和充值金额。"));
      return;
    }

    if (customAmountEnabled && selectedAmount < minimumCustomAmount) {
      setCustomAmountInput(String(minimumCustomAmount));
      setSelectedAmount(minimumCustomAmount);
      toast.error(
        t("errors.invalidCustomAmount", "自定义充值金额不能低于最小金额。")
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

        const detailResponse = await queryOrderDetail({
          order_no: String(orderNo),
        });
        const detail = detailResponse.data.data;
        if (!detail) {
          toast.error(t("errors.orderFailed", "充值订单创建失败。"));
          return;
        }

        const orderAmount = Number(detail?.amount || 0) / 100;
        const orderPrice = Number(detail?.price || 0) / 100;
        const feeAmount = Number(detail?.fee_amount || 0) / 100;

        setConfirmOrderNo(String(orderNo));
        setConfirmBreakdown({
          amount: orderPrice || orderAmount,
          fee: feeAmount,
          total: orderAmount,
        });
        setConfirmPaymentName(
          detail?.payment?.name
            ? String(detail.payment.name)
            : String(detail?.payment?.platform || "")
        );
        completedOrderNoticeRef.current = "";
        refreshPortal();
        setConfirmOpen(true);
      } catch {
        /* request.ts handles the error toast */
      }
    });
  }, [
    isCurrentSelectionPendingOrder,
    selectedMethodId,
    selectedAmount,
    customAmountEnabled,
    minimumCustomAmount,
    t,
    refreshPortal,
    setCustomAmountInput,
    setSelectedAmount,
  ]);

  const handleCreateOrder = useCallback(() => {
    if (!confirmOrderNo) return;

    startSubmitTransition(async () => {
      try {
        setConfirmOpen(false);
        toast.success(
          t("dialog.success", "订单已确认，请点击支付按钮完成付款")
        );
        await refreshPortal();
        await refreshActiveOrder(confirmOrderNo);
      } catch {
        /* request.ts handles the error toast */
      }
    });
  }, [confirmOrderNo, t, refreshPortal, refreshActiveOrder]);

  const handleContinuePayment = useCallback(() => {
    if (!activeOrder?.orderNo) return;

    // Request checkout first, then open payment
    refreshActiveOrder(activeOrder.orderNo, {
      requestCheckout: true,
    }).then(() => {
      const updatedOrder = usePortalStore.getState().activeOrder;
      if (
        updatedOrder?.checkout?.type === "stripe" &&
        updatedOrder.checkout.stripe
      ) {
        setStripeDialogOpen(true);
      } else if (
        updatedOrder?.checkout?.type === "url" &&
        updatedOrder.checkout.checkoutUrl
      ) {
        window.open(
          updatedOrder.checkout.checkoutUrl,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (
        updatedOrder?.checkout?.type === "qr" &&
        updatedOrder.checkout.checkoutUrl
      ) {
        // QR code is already shown in the UI, no need to open anything
      }
    });
  }, [activeOrder, refreshActiveOrder]);

  const handleAmountSelect = useCallback(
    (value: string) => {
      if (value === "custom") {
        setCustomAmountEnabled(true);
        const parsed = Number(customAmountInput || minimumCustomAmount);
        const normalizedAmount =
          Number.isFinite(parsed) && parsed >= minimumCustomAmount
            ? parsed
            : minimumCustomAmount;
        setCustomAmountInput(String(normalizedAmount));
        setSelectedAmount(normalizedAmount);
        return;
      }

      setCustomAmountEnabled(false);
      setSelectedAmount(Number(value));
    },
    [
      customAmountInput,
      minimumCustomAmount,
      setCustomAmountEnabled,
      setCustomAmountInput,
      setSelectedAmount,
    ]
  );

  const handleCustomAmountChange = useCallback(
    (value: string) => {
      if (value && !/^\d*(\.\d{0,2})?$/.test(value)) return;

      if (!value) {
        setCustomAmountInput("");
        setSelectedAmount(0);
        return;
      }

      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed < minimumCustomAmount) {
        setCustomAmountInput(String(minimumCustomAmount));
        setSelectedAmount(minimumCustomAmount);
        return;
      }

      setCustomAmountInput(value);

      if (!Number.isFinite(parsed) || parsed <= 0) {
        setSelectedAmount(0);
        return;
      }

      setSelectedAmount(parsed);
    },
    [minimumCustomAmount, setCustomAmountInput, setSelectedAmount]
  );

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
          siteKey={verify.turnstile_site_key}
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
    verify.turnstile_site_key,
  ]);

  if (!authenticated) {
    return (
      <LoginScreen
        account={account}
        captchaSlot={captchaSlot}
        configLoading={configLoading}
        loading={loginPending}
        onAccountChange={setAccount}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        password={password}
        siteLogo={site.site_logo}
        siteName={site.site_name}
      />
    );
  }

  return (
    <>
      <RechargeScreen
        activeOrder={activeOrder}
        amounts={portalConfig.rechargeAmounts}
        customAmountEnabled={customAmountEnabled}
        customAmountInput={customAmountInput}
        hasPendingOrder={isCurrentSelectionPendingOrder}
        loadingData={loadingPortal}
        methods={paymentMethods}
        minimumCustomAmount={minimumCustomAmount}
        onAmountSelect={handleAmountSelect}
        onContinuePayment={handleContinuePayment}
        onCustomAmountChange={handleCustomAmountChange}
        onLogout={handleLogout}
        onMethodSelect={setSelectedMethodId}
        onOpenConfirm={handleOpenConfirm}
        onRefresh={() => {
          refreshPortal();
          if (activeOrder?.orderNo) refreshActiveOrder(activeOrder.orderNo);
        }}
        onRefreshOrder={() => {
          if (activeOrder?.orderNo) refreshActiveOrder(activeOrder.orderNo);
        }}
        records={records}
        selectedAmount={selectedAmount}
        selectedMethodId={selectedMethodId}
        submitting={submitPending}
        userBalance={userBalance}
        userEmail={userEmail}
      />

      <ConfirmRechargeDialog
        breakdown={confirmBreakdown}
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

      <StripeCheckoutDialog
        onOpenChange={setStripeDialogOpen}
        open={stripeDialogOpen}
        orderNo={activeOrder?.orderNo}
        paymentMethodName={activeOrder?.paymentName}
        stripe={activeOrder?.checkout?.stripe}
      />
    </>
  );
}
