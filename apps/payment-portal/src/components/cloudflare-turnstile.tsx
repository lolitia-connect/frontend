import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Turnstile, { useTurnstile } from "react-turnstile";

interface CloudflareTurnstileProps {
  language: string;
  onChange: (value: string) => void;
  resetKey: number;
  siteKey: string;
  value: string;
}

export function CloudflareTurnstile({
  language,
  siteKey,
  value,
  resetKey,
  onChange,
}: Readonly<CloudflareTurnstileProps>) {
  const { t } = useTranslation("app");
  const turnstile = useTurnstile();
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(Boolean(value));

  useEffect(() => {
    setVerified(Boolean(value));
  }, [value]);

  useEffect(() => {
    setVerified(false);
    try {
      turnstile.reset();
    } catch {
      /* empty */
    }
  }, [resetKey, turnstile]);

  if (!siteKey) return null;

  return (
    <>
      <Button
        className="w-full"
        onClick={() => {
          if (!verified) setOpen(true);
        }}
        type="button"
        variant={verified ? "default" : "outline"}
      >
        {verified ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("captcha.turnstile.verified", "验证已通过")}
          </>
        ) : (
          t("captcha.turnstile.action", "点击完成人机验证")
        )}
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="flex w-auto flex-col items-center gap-4 p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("captcha.turnstile.title", "安全验证")}
            </DialogTitle>
          </DialogHeader>

          <Turnstile
            fixedSize
            language={language.toLowerCase()}
            onExpire={() => {
              onChange("");
              setVerified(false);
              try {
                turnstile.reset();
              } catch {
                /* empty */
              }
            }}
            onTimeout={() => {
              onChange("");
              setVerified(false);
              try {
                turnstile.reset();
              } catch {
                /* empty */
              }
            }}
            onVerify={(token) => {
              setVerified(true);
              onChange(token);
              window.setTimeout(() => setOpen(false), 300);
            }}
            sitekey={siteKey}
            theme="light"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
