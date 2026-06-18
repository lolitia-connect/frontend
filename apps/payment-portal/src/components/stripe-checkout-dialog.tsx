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
  onOpenChange: (open: boolean) => void;
  open: boolean;
  orderNo?: string;
  paymentMethodName?: string;
  stripe?: {
    method: string;
    client_secret: string;
    publishable_key: string;
  };
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("stripeDialog.title", "Stripe 支付")}</DialogTitle>
          <DialogDescription>
            {t(
              "stripeDialog.description",
              "请在弹窗内完成 Stripe 支付。关闭弹窗后，仍可通过支付状态中的继续支付重新打开。"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border bg-muted/50 p-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">
              {t("order.number", "订单号")}:{" "}
            </span>
            <span className="font-medium">{orderNo || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t("dialog.method", "支付方式")}:{" "}
            </span>
            <span className="font-medium">{paymentMethodName || "-"}</span>
          </div>
        </div>

        <div className="rounded-lg border p-4 sm:p-5">
          <StripePayment {...stripe} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
