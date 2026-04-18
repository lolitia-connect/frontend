import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useTranslation } from "react-i18next";
import { StripePayment } from "./stripe-payment";

interface StripeCheckoutDialogProps {
  open: boolean;
  orderNo?: string;
  paymentMethodName?: string;
  stripe?: {
    method: string;
    client_secret: string;
    publishable_key: string;
  };
  onOpenChange: (open: boolean) => void;
}

export function StripeCheckoutDialog({
  open,
  orderNo,
  paymentMethodName,
  stripe,
  onOpenChange,
}: Readonly<StripeCheckoutDialogProps>) {
  const { t } = useTranslation("app");

  if (!stripe) return null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl gap-5 p-6 sm:p-7">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="font-semibold text-2xl text-slate-950">
            {t("stripeDialog.title", "Stripe 支付")}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm leading-6">
            {t(
              "stripeDialog.description",
              "请在弹窗内完成 Stripe 支付。关闭弹窗后，仍可通过支付状态中的继续支付重新打开。"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 text-sm sm:grid-cols-2">
          <div>
            <span className="text-slate-400">
              {t("order.number", "订单号")}
              {": "}
            </span>
            <span className="font-medium text-slate-900">{orderNo || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400">
              {t("dialog.method", "支付方式")}
              {": "}
            </span>
            <span className="font-medium text-slate-900">
              {paymentMethodName || "-"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <StripePayment {...stripe} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
