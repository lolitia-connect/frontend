import { Button, Description, Modal, Separator } from "@heroui/react";
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
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{t("dialog.title", "确认充值")}</Modal.Heading>
            <Description slot="description">
              {t(
                "dialog.description",
                "账单金额取自后端订单详情，确认后再拉起实际支付。"
              )}
            </Description>
          </Modal.Header>

          <Modal.Body className="wrap-anywhere min-w-0 space-y-3 [&>div>span]:min-w-0 [&>div]:flex-wrap [&>div]:gap-x-4 [&>div]:gap-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {t("dialog.method", "支付方式")}
              </span>
              <span className="font-medium">{paymentMethodName || "-"}</span>
            </div>
            <Separator elementType="hr" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {t("dialog.amount", "充值金额")}
              </span>
              <span className="font-medium">
                <Display type="currency" value={breakdown?.amount || 0} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{t("dialog.fee", "手续费")}</span>
              <span className="font-medium">
                <Display type="currency" value={breakdown?.fee || 0} />
              </span>
            </div>
            <Separator elementType="hr" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {t("dialog.total", "合计金额")}
              </span>
              <span className="font-bold text-lg">
                <Display type="currency" value={breakdown?.total || 0} />
              </span>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button onPress={onClose} variant="secondary">
              {t("dialog.cancel", "取消")}
            </Button>
            <Button isDisabled={loading} onPress={onConfirm}>
              {loading
                ? t("dialog.confirming", "处理中...")
                : t("dialog.confirm", "确认并支付")}
            </Button>
          </Modal.Footer>
          <Modal.CloseTrigger aria-label={t("components:close", "Close")} />
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
