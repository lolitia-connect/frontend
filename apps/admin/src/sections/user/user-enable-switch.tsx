"use client";

import { Switch } from "@workspace/ui/components/switch";
import { updateUserBasicInfo } from "@workspace/ui/services/admin/user";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function UserEnableSwitch({
  user,
  onUpdated,
}: {
  user: API.User;
  onUpdated: () => void;
}) {
  const { t } = useTranslation("user");
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateEnabled(enable: boolean) {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateUserBasicInfo({
        user_id: user.id,
        password: "",
        avatar: user.avatar,
        balance: user.balance,
        commission: user.commission,
        gift_amount: user.gift_amount,
        telegram: user.telegram,
        refer_code: user.refer_code,
        referer_id: user.referer_id,
        referral_percentage: user.referral_percentage,
        only_first_purchase: user.only_first_purchase,
        is_admin: user.is_admin ?? false,
        enable,
      });
      toast.success(t("updateSuccess", "Updated successfully"));
      await onUpdated();
    } catch {
      // The shared request handler displays the error; retain the saved state.
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Switch
      aria-label={t("accountEnable", "Account Enable")}
      checked={user.enable}
      disabled={isUpdating}
      onCheckedChange={updateEnabled}
    />
  );
}
