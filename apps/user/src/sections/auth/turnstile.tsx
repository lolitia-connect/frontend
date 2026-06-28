"use client";

import { useTheme } from "next-themes";
import { type RefObject, useEffect, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import Turnstile from "react-turnstile";
import { useGlobalStore } from "@/stores/global";

export type TurnstileRef = {
  reset: () => void;
};

const CloudFlareTurnstile = function CloudFlareTurnstile({
  id,
  value,
  onChange,
  ref,
}: {
  id?: string;
  value?: null | string;
  onChange: (value?: string) => void;
  ref?: RefObject<TurnstileRef | null>;
}) {
  const { common } = useGlobalStore();
  const { verify } = common;
  const { resolvedTheme } = useTheme();
  const { i18n } = useTranslation("auth");
  const locale = i18n.language;
  const widgetRef = useRef<{ reset: () => void } | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        onChange("");
        try {
          widgetRef.current?.reset();
        } catch {
          /* widget not yet loaded */
        }
      },
    }),
    [onChange]
  );

  useEffect(() => {
    if (value === "") {
      try {
        widgetRef.current?.reset();
      } catch {
        /* widget not yet loaded */
      }
    }
  }, [value]);

  if (!verify.turnstile_site_key) return null;

  return (
    <div className="w-full">
      <Turnstile
        id={id}
        language={locale.toLowerCase()}
        onLoad={(_widgetId, boundTurnstile) => {
          widgetRef.current = boundTurnstile;
        }}
        onExpire={() => {
          onChange("");
          try {
            widgetRef.current?.reset();
          } catch {
            /* empty */
          }
        }}
        onTimeout={() => {
          onChange("");
          try {
            widgetRef.current?.reset();
          } catch {
            /* empty */
          }
        }}
        onVerify={(token) => {
          onChange(token);
        }}
        sitekey={verify.turnstile_site_key}
        size="flexible"
        theme={resolvedTheme as "light" | "dark"}
      />
    </div>
  );
};

export default CloudFlareTurnstile;
