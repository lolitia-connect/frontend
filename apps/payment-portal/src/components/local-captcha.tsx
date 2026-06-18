import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { generateCaptcha } from "@workspace/ui/services/common/auth";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
    fetchCaptcha();
  }, [resetKey]);

  return (
    <div className="space-y-1.5">
      <Label>{t("captcha.local.label", "图形验证码")}</Label>
      <div className="flex gap-3">
        <Input
          className="flex-1"
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("captcha.local.placeholder", "请输入图形验证码")}
          type="text"
          value={value}
        />
        <Button
          disabled={loading}
          onClick={fetchCaptcha}
          size="icon"
          type="button"
          variant="outline"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : captchaImage ? (
            <img
              alt="captcha"
              className="h-8 w-20 object-contain"
              src={captchaImage}
            />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
