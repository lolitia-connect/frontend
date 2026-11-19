"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { Icon } from "@workspace/ui/composed/icon";
import { adminGenerateCaptcha } from "@workspace/ui/services/admin/auth";
import {
  type RefObject,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

export interface LocalCaptchaRef {
  reset: () => void;
}

interface LocalCaptchaProps {
  onCaptchaIdChange?: (id: string) => void;
  onChange?: (value: string) => void;
  value?: string | null;
}

const LocalCaptcha = ({
  value,
  onChange,
  onCaptchaIdChange,
  ref,
}: LocalCaptchaProps & { ref?: RefObject<LocalCaptchaRef | null> }) => {
  const { t } = useTranslation("auth");
  const [captchaImage, setCaptchaImage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const res = await adminGenerateCaptcha();
      const captchaData = res.data?.data;
      if (captchaData) {
        setCaptchaImage(captchaData.image);
        onCaptchaIdChange?.(captchaData.id);
      }
    } catch (error) {
      console.error("Failed to generate captcha:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onChange?.("");
      fetchCaptcha();
    },
  }));

  return (
    <div className="flex gap-2">
      <Input
        className="flex-1"
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={t("captcha.placeholder", "Enter captcha code...")}
        value={value || ""}
      />
      <div className="relative h-10 w-32 flex-shrink-0">
        {loading ? (
          <div className="flex h-full items-center justify-center bg-default">
            <Spinner />
          </div>
        ) : captchaImage ? (
          // biome-ignore lint/performance/noImgElement: backend-generated captcha image; next/image optimization not applicable
          <img
            alt="captcha"
            className="h-full w-full cursor-pointer object-contain"
            onClick={fetchCaptcha}
            src={captchaImage}
            title={t("captcha.clickToRefresh", "Click to refresh")}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-default text-muted text-xs">
            {t("captcha.noImage", "No Image")}
          </div>
        )}
      </div>
      <Button
        disabled={loading}
        onClick={fetchCaptcha}
        size="icon"
        title={t("captcha.refresh", "Refresh captcha")}
        type="button"
        variant="outline"
      >
        <Icon icon="mdi:refresh" />
      </Button>
    </div>
  );
};

LocalCaptcha.displayName = "LocalCaptcha";

export default LocalCaptcha;
