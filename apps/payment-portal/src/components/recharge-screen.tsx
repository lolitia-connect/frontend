import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { formatDate } from "@workspace/ui/utils/formatting";
import { RefreshCw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import type { ActiveOrder, PaymentMethod, RechargeRecord } from "@/types";

interface RechargeScreenProps {
  activeOrder: ActiveOrder | null;
  amounts: number[];
  customAmountEnabled: boolean;
  customAmountInput: string;
  hasPendingOrder: boolean;
  loadingData: boolean;
  methods: PaymentMethod[];
  minimumCustomAmount: number;
  onAmountSelect: (value: string) => void;
  onContinuePayment: () => void;
  onCustomAmountChange: (value: string) => void;
  onLogout: () => void;
  onMethodSelect: (value: string) => void;
  onOpenConfirm: () => void;
  onRefresh: () => void;
  onRefreshCheckout: () => void;
  onRefreshOrder: () => void;
  records: RechargeRecord[];
  selectedAmount: number;
  selectedMethodId: string | null;
  submitting: boolean;
  userBalance: number | null;
  userEmail: string;
}

const statusMap: Record<number, string> = {
  0: "Unknown",
  1: "Pending",
  2: "Paid",
  3: "Cancelled",
  4: "Closed",
  5: "Completed",
};

export function RechargeScreen({
  amounts,
  minimumCustomAmount,
  methods,
  records,
  activeOrder,
  userBalance,
  userEmail,
  hasPendingOrder,
  selectedAmount,
  customAmountEnabled,
  customAmountInput,
  selectedMethodId,
  loadingData,
  submitting,
  onAmountSelect,
  onCustomAmountChange,
  onMethodSelect,
  onRefresh,
  onLogout,
  onOpenConfirm,
  onRefreshCheckout,
  onRefreshOrder,
  onContinuePayment,
}: Readonly<RechargeScreenProps>) {
  const { t } = useTranslation("app");
  const selectedMethod =
    methods.find((method) => method.id === selectedMethodId) || null;

  return (
    <div className="container flex min-h-screen flex-col gap-4 pt-16 pb-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">
                {t("dashboard.title", "支付充值中心")}
              </CardTitle>
              <p className="mt-1 text-muted-foreground">
                {t(
                  "dashboard.description",
                  "选择启用中的支付方式和预设充值金额，先确认手续费，再创建充值订单。"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeSwitch />
              <Button onClick={onRefresh} size="sm" variant="outline">
                {t("dashboard.refresh", "刷新")}
              </Button>
              <Button onClick={onLogout} size="sm" variant="outline">
                {t("dashboard.logout", "退出登录")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-secondary-foreground text-sm">
                {t("dashboard.balance", "当前余额")}
              </p>
              <p className="font-bold text-2xl text-secondary-foreground">
                <Display type="currency" value={userBalance} />
              </p>
            </div>
            {userEmail && (
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-secondary-foreground text-sm">
                  {t("dashboard.email", "用户邮箱")}
                </p>
                <p className="font-bold text-lg text-secondary-foreground">
                  {userEmail}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-secondary-foreground text-sm">
                {t("dashboard.methods", "可用支付方式")}
              </p>
              <p className="font-bold text-2xl text-secondary-foreground">
                {methods.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recharge Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedMethod
              ? t("dashboard.rechargeWith", "使用当前方式充值")
              : t("dashboard.selectMethodTitle", "请选择一种方式进行充值")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-3">
            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {methods.map((method) => (
                <button
                  className={`relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover py-2 text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
                    String(selectedMethodId) === String(method.id)
                      ? "border-primary bg-primary/10 text-foreground"
                      : ""
                  }`}
                  key={method.id}
                  onClick={() => onMethodSelect(String(method.id))}
                  type="button"
                >
                  {method.fee_mode === 1 && method.fee_percent > 0 && (
                    <Badge className="absolute -top-2 -right-2 border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      {method.fee_percent}%
                    </Badge>
                  )}
                  {method.fee_mode === 2 && method.fee_amount > 0 && (
                    <Badge className="absolute -top-2 -right-2 border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      +<Display type="currency" value={method.fee_amount} />
                    </Badge>
                  )}
                  <div className="flex size-12 items-center justify-center">
                    {method.icon ? (
                      <img
                        alt={method.name}
                        className="h-12 w-12 object-contain"
                        height={48}
                        src={method.icon}
                        width={48}
                      />
                    ) : (
                      <span className="text-2xl">💳</span>
                    )}
                  </div>
                  <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm">
                    {method.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Amount Selection */}
            <div className="space-y-1.5">
              <Label>{t("dashboard.amounts", "充值金额")}</Label>
              <div className="flex flex-wrap gap-2">
                {amounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => onAmountSelect(String(amount))}
                    variant={
                      !customAmountEnabled && selectedAmount === amount
                        ? "default"
                        : "outline"
                    }
                  >
                    <Display type="currency" value={amount} />
                  </Button>
                ))}
                <Button
                  onClick={() => onAmountSelect("custom")}
                  variant={customAmountEnabled ? "default" : "outline"}
                >
                  {t("dashboard.customAmountOption", "自定义金额")}
                </Button>
              </div>
            </div>

            {/* Custom Amount Input */}
            {customAmountEnabled && (
              <div className="space-y-1.5">
                <Label>
                  {t("dashboard.customAmountPlaceholder", "请输入自定义金额")}
                </Label>
                <Input
                  min={String(minimumCustomAmount)}
                  onChange={(event) => onCustomAmountChange(event.target.value)}
                  placeholder={t(
                    "dashboard.customAmountPlaceholder",
                    "请输入自定义金额"
                  )}
                  step="0.01"
                  type="number"
                  value={customAmountInput}
                />
                <p className="text-muted-foreground text-sm">
                  {t("dashboard.customAmountHint", {
                    amount: minimumCustomAmount,
                    defaultValue: "最低金额为 {{amount}}。",
                  })}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button
                disabled={
                  hasPendingOrder ||
                  loadingData ||
                  submitting ||
                  methods.length === 0 ||
                  selectedMethodId == null
                }
                onClick={onOpenConfirm}
              >
                {hasPendingOrder
                  ? t("dashboard.pendingOrder", "订单支付中")
                  : submitting
                    ? t("dashboard.creating", "创建订单中...")
                    : t("dashboard.submit", "确认充值")}
              </Button>
            </div>

            <p className="text-muted-foreground text-sm">
              {loadingData
                ? t("dashboard.loading", "正在加载支付数据...")
                : hasPendingOrder
                  ? t(
                      "dashboard.pendingHint",
                      "当前已有待支付订单，系统会持续监听支付状态，请勿重复下单。"
                    )
                  : t(
                      "dashboard.selectionReady",
                      "选择完成后点击确认，先查看手续费与合计金额。"
                    )}
            </p>
          </div>

          {/* Active Order */}
          {activeOrder && (
            <div className="space-y-4 lg:min-w-[360px]">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("dashboard.currentOrderTitle", "支付状态")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    {t("order.number", "订单号")}: {activeOrder.orderNo}
                  </p>

                  {[2, 5].includes(Number(activeOrder.status)) && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <p className="font-medium text-emerald-800 dark:text-emerald-200">
                        {t("dashboard.paymentSuccessTitle", "支付已完成")}
                      </p>
                      <p className="mt-1">
                        {t(
                          "dashboard.paymentSuccessHint",
                          "当前订单已支付成功，系统会同步刷新余额和充值记录。"
                        )}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-muted-foreground text-xs uppercase">
                        {t("order.status", "状态")}
                      </p>
                      <p className="mt-1 font-medium text-sm">
                        {statusMap[activeOrder.status] || "Unknown"}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-muted-foreground text-xs uppercase">
                        {t("order.amount", "充值金额")}
                      </p>
                      <p className="mt-1 font-medium text-sm">
                        <Display
                          type="currency"
                          value={activeOrder.rechargeAmount}
                        />
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-muted-foreground text-xs uppercase">
                        {t("order.method", "支付方式")}
                      </p>
                      <p className="mt-1 font-medium text-sm">
                        {activeOrder.paymentName || "-"}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-muted-foreground text-xs uppercase">
                        {t("order.time", "充值时间")}
                      </p>
                      <p className="mt-1 font-medium text-sm">
                        {formatDate(activeOrder.createdAt) || "-"}
                      </p>
                    </div>
                  </div>

                  {activeOrder.checkout?.type === "qr" &&
                    activeOrder.checkout.checkoutUrl && (
                      <div className="flex justify-center rounded-lg border bg-card p-5">
                        <div className="space-y-3 text-center">
                          <p className="text-muted-foreground text-sm">
                            {t("dashboard.scanToPay", "请扫码继续支付")}
                          </p>
                          <QRCodeCanvas
                            size={220}
                            value={activeOrder.checkout.checkoutUrl}
                          />
                        </div>
                      </div>
                    )}

                  <div className="flex gap-2">
                    {Number(activeOrder.status) === 1 && (
                      <Button className="flex-1" onClick={onContinuePayment}>
                        {t("dashboard.payNow", "立即支付")}
                      </Button>
                    )}
                    {Number(activeOrder.status) === 1 && (
                      <Button
                        onClick={onRefreshCheckout}
                        title={t("dashboard.refreshCheckout", "刷新支付链接")}
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button onClick={onRefreshOrder} variant="outline">
                      {t("dashboard.refreshStatus", "刷新状态")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recharge Records */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recordsTitle", "最近充值订单")}</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="grid gap-3">
              {records.map((record) => (
                <div
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                  key={record.orderNo}
                >
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("order.number", "订单号")}
                      </p>
                      <p className="font-medium text-sm">{record.orderNo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("order.amount", "充值金额")}
                      </p>
                      <p className="font-medium text-sm">
                        <Display type="currency" value={record.amount} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("order.status", "状态")}
                      </p>
                      <p className="font-medium text-sm">
                        {statusMap[record.status] || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("order.time", "充值时间")}
                      </p>
                      <p className="font-medium text-sm">
                        {formatDate(record.createdAt) || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              {t("dashboard.noRecords", "暂无充值记录")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
