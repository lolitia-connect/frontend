import { Button, Input, Label, Spinner, TextField } from "@heroui/react";
import { generateCaptcha } from "@workspace/ui/services/common/auth";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LocalCaptchaProps {
  onCaptchaIdChange: (value: string) => void;
  onChange: (value: string) => void;
  resetKey: number;
  value: string;
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
    onChange("");
    onCaptchaIdChange("");
    try {
      const response = await generateCaptcha();
      const data = response.data?.data;
      if (data) {
        setCaptchaImage(data.image || "");
        onCaptchaIdChange(String(data.id || ""));
      }
    } catch {
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
    <TextField className="space-y-1.5" onChange={onChange} value={value}>
      <Label>{t("captcha.local.label", "图形验证码")}</Label>
      <div className="flex gap-3">
        <Input
          className="min-w-0 flex-1"
          name="captcha_code"
          placeholder={t("captcha.local.placeholder", "请输入图形验证码")}
          type="text"
        />
        <Button
          aria-label={t("captcha.local.refresh", "刷新验证码")}
          isDisabled={loading}
          onPress={fetchCaptcha}
          type="button"
          variant="outline"
        >
          {loading ? (
            <Spinner color="current" size="sm" />
          ) : captchaImage ? (
            <Image
              alt="captcha"
              className="h-8 w-20 object-contain"
              height={32}
              src={captchaImage}
              unoptimized
              width={80}
            />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </TextField>
  );
}
