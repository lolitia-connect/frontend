import { useTranslation } from "react-i18next";
import type { FeeBreakdown } from "@/lib/fees";
import { formatCurrency } from "@/lib/format";

interface ConfirmRechargeDialogProps {
  open: boolean;
  loading: boolean;
  language: string;
  currency: string;
  breakdown: FeeBreakdown | null;
  paymentMethodName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmRechargeDialog({
  open,
  loading,
  language,
  currency,
  breakdown,
  paymentMethodName,
  onClose,
  onConfirm,
}: Readonly<ConfirmRechargeDialogProps>) {
  const { t } = useTranslation("app");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="portal-dialog w-full max-w-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-6 space-y-2">
          <span className="portal-chip portal-chip-light">
            {t("dialog.badge", "确认信息")}
          </span>
          <h3 className="font-semibold text-2xl text-slate-950">
            {t("dialog.title", "确认充值")}
          </h3>
          <p className="text-slate-500 text-sm">
            {t(
              "dialog.description",
              "账单金额取自后端订单详情，确认后再拉起实际支付。"
            )}
          </p>
        </div>

        <dl className="space-y-3">
          <div className="portal-dialog-row">
            <dt>{t("dialog.method", "支付方式")}</dt>
            <dd>{paymentMethodName || "-"}</dd>
          </div>
          <div className="portal-dialog-row">
            <dt>{t("dialog.amount", "充值金额")}</dt>
            <dd>
              {formatCurrency(breakdown?.amount || 0, language, currency)}
            </dd>
          </div>
          <div className="portal-dialog-row">
            <dt>{t("dialog.fee", "手续费")}</dt>
            <dd>{formatCurrency(breakdown?.fee || 0, language, currency)}</dd>
          </div>
          <div className="portal-dialog-row is-total">
            <dt>{t("dialog.total", "合计金额")}</dt>
            <dd>{formatCurrency(breakdown?.total || 0, language, currency)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="portal-secondary-btn"
            onClick={onClose}
            type="button"
          >
            {t("dialog.cancel", "取消")}
          </button>
          <button
            className="portal-primary-btn"
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading
              ? t("dialog.confirming", "处理中...")
              : t("dialog.confirm", "确认并支付")}
          </button>
        </div>
      </div>
    </div>
  );
}
