"use client";

import { Input } from "@workspace/ui/components/input";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type CouponValidationStatus = "idle" | "checking" | "valid" | "invalid";

interface CouponInputProps {
  coupon?: string;
  onChange: (value: string) => void;
  status?: CouponValidationStatus;
}

const CouponInput: React.FC<CouponInputProps> = ({
  coupon,
  onChange,
  status = "idle",
}) => {
  const { t } = useTranslation("subscribe");
  const [draft, setDraft] = useState(coupon ?? "");

  useEffect(() => {
    setDraft(coupon ?? "");
  }, [coupon]);

  const displayStatus = draft.trim() === (coupon ?? "") ? status : "idle";
  const statusMessage =
    displayStatus === "idle"
      ? undefined
      : {
          checking: t("couponChecking", "Checking coupon code..."),
          valid: t("couponValid", "Coupon code is valid."),
          invalid: t("couponInvalid", "Coupon code is invalid."),
        }[displayStatus];

  return (
    <>
      <div className="font-semibold">{t("coupon", "Coupon")}</div>
      <Input
        aria-invalid={displayStatus === "invalid"}
        onBlur={() => {
          const value = draft.trim();
          setDraft(value);
          if (value !== (coupon ?? "")) {
            onChange(value);
          }
        }}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t("enterCoupon", "Enter Coupon Code")}
        value={draft}
      />
      {statusMessage && (
        <p
          className={
            displayStatus === "invalid"
              ? "text-danger text-xs"
              : "text-muted text-xs"
          }
        >
          {statusMessage}
        </p>
      )}
    </>
  );
};

export default CouponInput;
