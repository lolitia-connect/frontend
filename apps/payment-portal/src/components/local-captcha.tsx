import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { generateCaptcha } from "@workspace/ui/services/common/auth";

interface LocalCaptchaProps {
  value: string;
  resetKey: number;
  onChange: (value: string) => void;
  onCaptchaIdChange: (value: string) => void;
}

export function LocalCaptcha({
  value,
  resetKey,
  onChange,
  onCaptchaIdChange,
}: Readonly<LocalCaptchaProps>) {
  const { t } = useTranslation("app");
  const [captchaImage, setCaptchaImage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const response = await generateCaptcha();
      const data = response.data?.data;
      if (data) {
        setCaptchaImage(data.image || "");
        onCaptchaIdChange(String(data.id || ""));
      }
    } catch (_error) {
      setCaptchaImage("");
      onCaptchaIdChange("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCaptcha();
  }, [resetKey]);

  return (
    <div className="space-y-3">
      <label className="portal-field portal-field-light">
        <span>{t("captcha.local.label", "图形验证码")}</span>
        <div className="flex gap-3">
          <input
            className="portal-input portal-input-light flex-1"
            onChange={(event) => onChange(event.target.value)}
            placeholder={t("captcha.local.placeholder", "请输入图形验证码")}
            type="text"
            value={value}
          />
          <button
            className="portal-captcha-image-btn"
            disabled={loading}
            onClick={() => {
              void fetchCaptcha();
            }}
            type="button"
          >
            {loading ? (
              <span className="text-sm text-slate-500">
                {t("captcha.loading", "加载中...")}
              </span>
            ) : captchaImage ? (
              <img
                alt="captcha"
                className="h-full w-full object-contain"
                src={captchaImage}
              />
            ) : (
              <span className="text-xs text-slate-500">
                {t("captcha.local.refresh", "刷新验证码")}
              </span>
            )}
          </button>
        </div>
      </label>
    </div>
  );
}
