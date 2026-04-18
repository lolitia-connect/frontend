import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Turnstile, { useTurnstile } from "react-turnstile";

interface CloudflareTurnstileProps {
  language: string;
  siteKey: string;
  value: string;
  resetKey: number;
  onChange: (value: string) => void;
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
    } catch (_error) {
      /* empty */
    }
  }, [resetKey, turnstile]);

  if (!siteKey) return null;

  return (
    <>
      <button
        className={`portal-captcha-trigger ${verified ? "is-verified" : ""}`}
        onClick={() => {
          if (!verified) setOpen(true);
        }}
        type="button"
      >
        <span className="portal-captcha-indicator" />
        <span>
          {verified
            ? t("captcha.turnstile.verified", "验证已通过")
            : t("captcha.turnstile.action", "点击完成人机验证")}
        </span>
      </button>

      <Dialog
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
      >
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
              } catch (_error) {
                /* empty */
              }
            }}
            onTimeout={() => {
              onChange("");
              setVerified(false);
              try {
                turnstile.reset();
              } catch (_error) {
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
