import { useEffect, useRef } from "react";
import Turnstile from "react-turnstile";

interface CloudflareTurnstileProps {
  language: string;
  onChange: (value: string) => void;
  resetKey: number;
  siteKey: string;
}

export function CloudflareTurnstile({
  language,
  siteKey,
  resetKey,
  onChange,
}: Readonly<CloudflareTurnstileProps>) {
  const widgetRef = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    try {
      widgetRef.current?.reset();
    } catch {
      /* widget not yet loaded */
    }
  }, [resetKey]);

  if (!siteKey) return null;

  return (
    <div className="w-full">
      <Turnstile
        language={language.toLowerCase()}
        onExpire={() => {
          onChange("");
          try {
            widgetRef.current?.reset();
          } catch {
            /* empty */
          }
        }}
        onLoad={(_widgetId, boundTurnstile) => {
          widgetRef.current = boundTurnstile;
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
        sitekey={siteKey}
        size="flexible"
        theme="light"
      />
    </div>
  );
}
