import {
  Alert,
  Button,
  Card,
  Chip,
  Description,
  Input,
  Label,
  Radio,
  RadioGroup,
  Skeleton,
  Spinner,
  Surface,
  TextField,
} from "@heroui/react";
import { AsyncButton } from "@workspace/ui/composed/async-button";
import { formatDate } from "@workspace/ui/utils/formatting";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { Preferences } from "@/components/preferences";
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
  onContinuePayment: () => Promise<void> | void;
  onCustomAmountChange: (value: string) => void;
  onLogout: () => void;
  onMethodSelect: (value: string) => void;
  onOpenConfirm: () => void;
  onRefresh: () => void;
  onRefreshCheckout: () => Promise<void> | void;
  onRefreshOrder: () => Promise<void> | void;
  records: RechargeRecord[];
  selectedAmount: number;
  selectedMethodId: string | null;
  submitting: boolean;
  userBalance: number | null;
  userEmail: string;
}

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
  const initialLoad = loadingData && userBalance === null;
  const selectedMethod =
    methods.find((method) => method.id === selectedMethodId) || null;

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6"
      id="main-content"
      tabIndex={-1}
    >
      <Card>
        <Card.Header>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="font-semibold text-2xl">
                {t("dashboard.title", "支付充值中心")}
              </h1>
              <Card.Description className="mt-1">
                {t(
                  "dashboard.description",
                  "选择启用中的支付方式和预设充值金额，先确认手续费，再创建充值订单。"
                )}
              </Card.Description>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Preferences />
              <Button
                isDisabled={initialLoad}
                isPending={loadingData && !initialLoad}
                onPress={onRefresh}
                size="sm"
                variant="outline"
              >
                {loadingData && !initialLoad && (
                  <Spinner aria-hidden="true" color="current" size="sm" />
                )}
                {t("dashboard.refresh", "刷新")}
              </Button>
              <Button onPress={onLogout} size="sm" variant="outline">
                {t("dashboard.logout", "退出登录")}
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-4 md:grid-cols-3">
            <Surface className="rounded-2xl p-4" variant="secondary">
              <p className="wrap-anywhere text-muted text-sm">
                {t("dashboard.balance", "当前余额")}
              </p>
              {initialLoad ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-semibold text-2xl">
                  <Display type="currency" value={userBalance} />
                </p>
              )}
            </Surface>
            {userEmail && (
              <Surface className="min-w-0 rounded-2xl p-4" variant="secondary">
                <p className="wrap-anywhere text-muted text-sm">
                  {t("dashboard.email", "用户邮箱")}
                </p>
                <p className="wrap-anywhere font-medium">{userEmail}</p>
              </Surface>
            )}
            <Surface className="rounded-2xl p-4" variant="secondary">
              <p className="wrap-anywhere text-muted text-sm">
                {t("dashboard.methods", "可用支付方式")}
              </p>
              {initialLoad ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="font-semibold text-2xl">{methods.length}</p>
              )}
            </Surface>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title render={(props) => <h2 {...props} />}>
            {selectedMethod
              ? t("dashboard.rechargeWith", "使用当前方式充值")
              : t("dashboard.selectMethodTitle", "请选择一种方式进行充值")}
          </Card.Title>
        </Card.Header>
        <Card.Content
          className={
            activeOrder
              ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]"
              : "grid gap-6"
          }
        >
          <div className="grid min-w-0 gap-3">
            <RadioGroup
              name="payment"
              onChange={onMethodSelect}
              value={selectedMethodId ?? ""}
            >
              <Label>{t("dashboard.methods", "可用支付方式")}</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {initialLoad && <Skeleton className="h-14 rounded-field" />}
                {methods.map((method) => (
                  <Radio key={method.id} value={method.id}>
                    <Radio.Content
                      aria-label={method.name}
                      className="h-full w-full min-w-0 rounded-field bg-default p-3 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground"
                    >
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      {method.icon && (
                        <Image
                          alt=""
                          className="size-8 shrink-0 object-contain"
                          height={32}
                          src={method.icon}
                          unoptimized
                          width={32}
                        />
                      )}
                      <Label className="wrap-anywhere min-w-0 flex-1">
                        {method.name}
                      </Label>
                      {method.fee_mode === 1 && method.fee_percent > 0 && (
                        <Chip
                          className="text-foreground"
                          color="warning"
                          size="sm"
                          variant="soft"
                        >
                          {method.fee_percent}%
                        </Chip>
                      )}
                      {method.fee_mode === 2 && method.fee_amount > 0 && (
                        <Chip
                          className="text-foreground"
                          color="warning"
                          size="sm"
                          variant="soft"
                        >
                          +<Display type="currency" value={method.fee_amount} />
                        </Chip>
                      )}
                    </Radio.Content>
                  </Radio>
                ))}
              </div>
            </RadioGroup>

            <RadioGroup
              name="amount"
              onChange={onAmountSelect}
              value={customAmountEnabled ? "custom" : String(selectedAmount)}
            >
              <Label>{t("dashboard.amounts", "充值金额")}</Label>
              <div className="flex flex-wrap gap-3">
                {amounts.map((amount) => (
                  <Radio key={amount} value={String(amount)}>
                    <Radio.Content className="rounded-field bg-default px-3 py-2 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Label>
                        <Display type="currency" value={amount} />
                      </Label>
                    </Radio.Content>
                  </Radio>
                ))}
                <Radio value="custom">
                  <Radio.Content className="rounded-field bg-default px-3 py-2 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Label>
                      {t("dashboard.customAmountOption", "自定义金额")}
                    </Label>
                  </Radio.Content>
                </Radio>
              </div>
            </RadioGroup>

            {customAmountEnabled && (
              <TextField
                name="custom_amount"
                onChange={onCustomAmountChange}
                value={customAmountInput}
              >
                <Label>
                  {t("dashboard.customAmountPlaceholder", "请输入自定义金额")}
                </Label>
                <Input
                  className="w-full"
                  inputMode="decimal"
                  min={minimumCustomAmount}
                  placeholder={t(
                    "dashboard.customAmountPlaceholder",
                    "请输入自定义金额"
                  )}
                  step="0.01"
                  type="number"
                />
                <Description>
                  {t("dashboard.customAmountHint", {
                    amount: minimumCustomAmount,
                    defaultValue: "最低金额为 {{amount}}。",
                  })}
                </Description>
              </TextField>
            )}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button
                isDisabled={
                  hasPendingOrder ||
                  loadingData ||
                  submitting ||
                  methods.length === 0 ||
                  selectedMethodId == null
                }
                isPending={submitting}
                onPress={onOpenConfirm}
              >
                {submitting && (
                  <Spinner aria-hidden="true" color="current" size="sm" />
                )}
                {hasPendingOrder
                  ? t("dashboard.pendingOrder", "订单支付中")
                  : submitting
                    ? t("dashboard.creating", "创建订单中...")
                    : t("dashboard.submit", "确认充值")}
              </Button>
            </div>

            <p className="wrap-anywhere text-muted text-sm">
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
          {activeOrder && (
            <div className="min-w-0 space-y-4">
              <Card variant="secondary">
                <Card.Header>
                  <Card.Title className="text-lg">
                    {t("dashboard.currentOrderTitle", "支付状态")}
                  </Card.Title>
                </Card.Header>
                <Card.Content className="space-y-3">
                  <p className="wrap-anywhere text-muted text-sm">
                    {t("order.number", "订单号")}: {activeOrder.orderNo}
                  </p>

                  {[2, 5].includes(Number(activeOrder.status)) && (
                    <Alert status="success">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>
                          {Number(activeOrder.status) === 2
                            ? t("dashboard.creditPending", "已收款，余额入账中")
                            : t("dashboard.paymentSuccessTitle", "支付已完成")}
                        </Alert.Title>
                        {Number(activeOrder.status) === 5 && (
                          <Alert.Description>
                            {t(
                              "dashboard.paymentSuccessHint",
                              "系统会同步刷新余额和充值记录。"
                            )}
                          </Alert.Description>
                        )}
                      </Alert.Content>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Surface className="rounded-field p-3">
                      <p className="text-muted text-xs uppercase">
                        {t("order.status", "状态")}
                      </p>
                      <p className="wrap-anywhere mt-1 font-medium text-sm">
                        {t(
                          `status.${activeOrder.status}`,
                          t("status.unknown", "Unknown Status")
                        )}
                      </p>
                    </Surface>
                    <Surface className="rounded-field p-3">
                      <p className="text-muted text-xs uppercase">
                        {t("order.amount", "充值金额")}
                      </p>
                      <p className="wrap-anywhere mt-1 font-medium text-sm">
                        <Display
                          type="currency"
                          value={activeOrder.rechargeAmount}
                        />
                      </p>
                    </Surface>
                    <Surface className="rounded-field p-3">
                      <p className="text-muted text-xs uppercase">
                        {t("order.method", "支付方式")}
                      </p>
                      <p className="wrap-anywhere mt-1 font-medium text-sm">
                        {activeOrder.paymentName || "-"}
                      </p>
                    </Surface>
                    <Surface className="rounded-field p-3">
                      <p className="text-muted text-xs uppercase">
                        {t("order.time", "充值时间")}
                      </p>
                      <p className="wrap-anywhere mt-1 font-medium text-sm">
                        {formatDate(activeOrder.createdAt) || "-"}
                      </p>
                    </Surface>
                  </div>

                  {activeOrder.checkout?.type === "qr" &&
                    activeOrder.checkout.checkoutUrl && (
                      <div className="flex justify-center rounded-lg border border-border bg-surface p-5">
                        <div className="space-y-3 text-center">
                          <p className="wrap-anywhere text-muted text-sm">
                            {t("dashboard.scanToPay", "请扫码继续支付")}
                          </p>
                          <QRCodeCanvas
                            className="h-auto max-w-full"
                            marginSize={4}
                            size={220}
                            title={t("dashboard.scanToPay", "请扫码继续支付")}
                            value={activeOrder.checkout.checkoutUrl}
                          />
                        </div>
                      </div>
                    )}

                  <div className="flex flex-wrap gap-2">
                    {Number(activeOrder.status) === 1 && (
                      <AsyncButton
                        className="flex-1"
                        id="payment-next-action"
                        onAction={onContinuePayment}
                      >
                        {t("dashboard.payNow", "立即支付")}
                      </AsyncButton>
                    )}
                    {Number(activeOrder.status) === 1 && (
                      <AsyncButton
                        aria-label={t(
                          "dashboard.refreshCheckout",
                          "刷新支付链接"
                        )}
                        icon={<RefreshCw className="size-4" />}
                        onAction={onRefreshCheckout}
                        size="icon"
                        variant="outline"
                      />
                    )}
                    <AsyncButton onAction={onRefreshOrder} variant="outline">
                      {t("dashboard.refreshStatus", "刷新状态")}
                    </AsyncButton>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title render={(props) => <h2 {...props} />}>
            {t("dashboard.recordsTitle", "最近充值订单")}
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {initialLoad ? (
            <Skeleton className="h-16 w-full" />
          ) : records.length > 0 ? (
            <div className="grid min-w-0 gap-3">
              {records.map((record) => (
                <Surface
                  className="rounded-field p-4"
                  key={record.orderNo}
                  variant="secondary"
                >
                  <div className="grid w-full min-w-0 grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="wrap-anywhere text-muted text-sm">
                        {t("order.number", "订单号")}
                      </p>
                      <p className="wrap-anywhere font-medium text-sm">
                        {record.orderNo}
                      </p>
                    </div>
                    <div>
                      <p className="wrap-anywhere text-muted text-sm">
                        {t("order.amount", "充值金额")}
                      </p>
                      <p className="wrap-anywhere font-medium text-sm">
                        <Display type="currency" value={record.amount} />
                      </p>
                    </div>
                    <div>
                      <p className="wrap-anywhere text-muted text-sm">
                        {t("order.status", "状态")}
                      </p>
                      <p className="wrap-anywhere font-medium text-sm">
                        {t(
                          `status.${record.status}`,
                          t("status.unknown", "Unknown Status")
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="wrap-anywhere text-muted text-sm">
                        {t("order.time", "充值时间")}
                      </p>
                      <p className="wrap-anywhere font-medium text-sm">
                        {formatDate(record.createdAt) || "-"}
                      </p>
                    </div>
                  </div>
                </Surface>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted text-sm">
              {t("dashboard.noRecords", "暂无充值记录")}
            </p>
          )}
        </Card.Content>
      </Card>
    </main>
  );
}
