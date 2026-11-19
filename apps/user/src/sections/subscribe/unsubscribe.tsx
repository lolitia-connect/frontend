"use client";

import { Description, Modal } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";

import {
  postV1PublicUserUnsubscribePre as preUnsubscribe,
  postV1PublicUserUnsubscribe as unsubscribe,
} from "@workspace/ui/services/user/user";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";

interface UnsubscribeProps {
  allowDeduction?: boolean;
  id: string;
  onSuccess?: () => void;
}

export default function Unsubscribe({
  id,
  allowDeduction,
  onSuccess,
}: Readonly<UnsubscribeProps>) {
  const { t } = useTranslation("subscribe");
  const { common, getUserInfo } = useGlobalStore();
  const single_model = common.subscribe.single_model;

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    enabled: Boolean(open && id && allowDeduction),
    queryKey: ["preUnsubscribe", id],
    queryFn: async () => {
      const { data } = await preUnsubscribe({ id });
      return data.data?.deduction_amount;
    },
  });

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await unsubscribe(
        { id },
        {
          skipErrorHandler: true,
        }
      );
      toast.success(t("unsubscribe.success", "Unsubscribed successfully"));
      await getUserInfo();
      onSuccess?.();
      setOpen(false);
    } catch {
      toast.error(t("unsubscribe.failed", "Unsubscribe failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!(single_model || allowDeduction)) return null;

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button size="sm" variant="destructive">
        {t("unsubscribe.unsubscribe", "Unsubscribe")}
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {t("unsubscribe.confirmUnsubscribe", "Confirm Unsubscribe")}
              </Modal.Heading>
              <Description slot="description">
                {t(
                  "unsubscribe.confirmUnsubscribeDescription",
                  "Are you sure you want to unsubscribe?"
                )}
              </Description>
            </Modal.Header>
            <p>{t("unsubscribe.residualValue", "Residual Value")}</p>
            <p className="font-semibold text-2xl text-accent">
              <Display type="currency" value={data} />
            </p>
            <p className="text-muted text-sm">
              {t(
                "unsubscribe.unsubscribeDescription",
                "The residual value will be refunded to your account"
              )}
            </p>
            <Modal.Footer>
              <Button
                loading={submitting}
                onClick={() => setOpen(false)}
                variant="outline"
              >
                {t("unsubscribe.cancel", "Cancel")}
              </Button>
              <Button loading={submitting} onClick={handleSubmit}>
                {t("unsubscribe.confirm", "Confirm")}
              </Button>
            </Modal.Footer>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
