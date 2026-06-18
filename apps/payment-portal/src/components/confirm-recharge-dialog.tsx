import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Separator } from "@workspace/ui/components/separator";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import type { FeeBreakdown } from "@/lib/fees";

interface ConfirmRechargeDialogProps {
  breakdown: FeeBreakdown | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  paymentMethodName?: string;
}

export function ConfirmRechargeDialog({
  open,
  loading,
  breakdown,
  paymentMethodName,
  onClose,
  onConfirm,
}: Readonly<ConfirmRechargeDialogProps>) {
  const { t } = useTranslation("app");

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialog.title", "确认充值")}</DialogTitle>
          <DialogDescription>
            {t(
              "dialog.description",
              "账单金额取自后端订单详情，确认后再拉起实际支付。"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("dialog.method", "支付方式")}
            </span>
            <span className="font-medium">{paymentMethodName || "-"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("dialog.amount", "充值金额")}
            </span>
            <span className="font-medium">
              <Display type="currency" value={breakdown?.amount || 0} />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("dialog.fee", "手续费")}
            </span>
            <span className="font-medium">
              <Display type="currency" value={breakdown?.fee || 0} />
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t("dialog.total", "合计金额")}</span>
            <span className="font-bold text-lg">
              <Display type="currency" value={breakdown?.total || 0} />
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            {t("dialog.cancel", "取消")}
          </Button>
          <Button disabled={loading} onClick={onConfirm}>
            {loading
              ? t("dialog.confirming", "处理中...")
              : t("dialog.confirm", "确认并支付")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
