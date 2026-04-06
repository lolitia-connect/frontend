import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type PaymentIntentResult,
  type StripeCardNumberElementOptions,
  type StripeElementStyle,
} from "@stripe/stripe-js";
import { CheckCircle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface StripePaymentProps {
  method: string;
  client_secret: string;
  publishable_key: string;
}

interface CardPaymentFormProps {
  clientSecret: string;
  onError: (message: string) => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  clientSecret,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation("app");
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
    name?: string;
  }>({});

  const elementStyle: StripeElementStyle = {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": {
        color: "#94a3b8",
      },
    },
    invalid: {
      color: "#dc2626",
      iconColor: "#dc2626",
    },
  };

  const elementOptions: StripeCardNumberElementOptions = {
    style: elementStyle,
    showIcon: true,
  };

  const handleChange = (event: any, field: keyof typeof errors) => {
    if (event.error) {
      setErrors((prev) => ({ ...prev, [field]: event.error.message }));
      return;
    }
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!(stripe && elements)) {
      onError(t("stripe.loading", "Loading Stripe..."));
      return;
    }

    if (!cardholderName.trim()) {
      setErrors((prev) => ({
        ...prev,
        name: t("stripe.nameRequired", "Cardholder name is required"),
      }));
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      onError(t("stripe.elementError", "Please fill in all card details"));
      return;
    }

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: cardholderName,
          },
        },
      }
    );

    if (error) {
      onError(error.message || t("stripe.paymentFailed", "Payment failed"));
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      setSucceeded(true);
    } else {
      onError(t("stripe.processing", "Processing payment..."));
    }
    setProcessing(false);
  };

  if (succeeded) {
    return (
      <div className="py-6 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
        </div>
        <p className="text-xl font-medium text-slate-950">
          {t("stripe.successTitle", "Payment Successful")}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {t(
            "stripe.successMessage",
            "Thank you. Your payment has been completed successfully."
          )}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4 text-left" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-600" htmlFor="cardholderName">
          {t("stripe.cardName", "Cardholder Name")}
        </label>
        <input
          className={`portal-input portal-input-light ${errors.name ? "border-red-500" : ""}`}
          id="cardholderName"
          onChange={(event) => setCardholderName(event.target.value)}
          placeholder={t("stripe.namePlaceholder", "Full Name on Card")}
          type="text"
          value={cardholderName}
        />
        {errors.name ? (
          <p className="text-xs text-red-500">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-600" htmlFor="cardNumber">
          {t("stripe.cardNumber", "Card Number")}
        </label>
        <div
          className={`rounded-md border bg-white p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${errors.cardNumber ? "border-red-500" : "border-slate-200"}`}
        >
          <CardNumberElement
            id="cardNumber"
            onChange={(event: any) => handleChange(event, "cardNumber")}
            options={elementOptions}
          />
        </div>
        {errors.cardNumber ? (
          <p className="text-xs text-red-500">{errors.cardNumber}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600" htmlFor="cardExpiry">
            {t("stripe.expiryDate", "Expiry Date")}
          </label>
          <div
            className={`rounded-md border bg-white p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${errors.cardExpiry ? "border-red-500" : "border-slate-200"}`}
          >
            <CardExpiryElement
              id="cardExpiry"
              onChange={(event: any) => handleChange(event, "cardExpiry")}
              options={{ style: elementStyle }}
            />
          </div>
          {errors.cardExpiry ? (
            <p className="text-xs text-red-500">{errors.cardExpiry}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600" htmlFor="cardCvc">
            {t("stripe.cvc", "CVC")}
          </label>
          <div
            className={`rounded-md border bg-white p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${errors.cardCvc ? "border-red-500" : "border-slate-200"}`}
          >
            <CardCvcElement
              id="cardCvc"
              onChange={(event: any) => handleChange(event, "cardCvc")}
              options={{ style: elementStyle }}
            />
          </div>
          {errors.cardCvc ? (
            <p className="text-xs text-red-500">{errors.cardCvc}</p>
          ) : null}
        </div>
      </div>

      <div className="pt-2">
        <button
          className="portal-primary-btn w-full"
          disabled={processing || !stripe || !elements}
          type="submit"
        >
          {processing
            ? t("stripe.processingButton", "Processing...")
            : t("stripe.payButton", "Pay Now")}
        </button>
        <p className="mt-3 text-center text-xs text-slate-500">
          {t("stripe.secureNotice", "Payments are secure and encrypted")}
        </p>
      </div>
    </form>
  );
};

const CheckoutForm: React.FC<Omit<StripePaymentProps, "publishable_key">> = ({
  client_secret,
  method,
}) => {
  const stripe = useStripe();
  const { t } = useTranslation("app");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeImageDataUrl, setQrCodeImageDataUrl] = useState<string | null>(
    null
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleError = useCallback((message: string) => {
    setErrorMessage(message);
    setIsSubmitted(false);
  }, []);

  const confirmPayment = useCallback(async (): Promise<PaymentIntentResult | null> => {
    if (!stripe) {
      handleError(t("stripe.loading", "Loading Stripe..."));
      return null;
    }

    if (method === "alipay") {
      return stripe.confirmAlipayPayment(
        client_secret,
        { return_url: window.location.href },
        { handleActions: false }
      );
    }

    if (method === "wechat_pay") {
      return stripe.confirmWechatPayPayment(
        client_secret,
        {
          payment_method_options: {
            wechat_pay: { client: "web" },
          },
        },
        { handleActions: false }
      );
    }

    return null;
  }, [client_secret, handleError, method, stripe, t]);

  const autoSubmit = useCallback(async () => {
    if (isSubmitted || method === "card") return;

    setIsSubmitted(true);
    try {
      const result = await confirmPayment();
      if (!result) return;

      const { error, paymentIntent } = result;
      if (error) {
        handleError(error.message || t("stripe.error", "An error occurred"));
        return;
      }

      if (paymentIntent?.status === "requires_action") {
        const nextAction = paymentIntent.next_action as any;
        if (method === "alipay") {
          setQrCodeUrl(nextAction?.alipay_handle_redirect?.url || null);
          setQrCodeImageDataUrl(null);
          return;
        }

        const wechat = nextAction?.wechat_pay_display_qr_code;
        const data = wechat?.data;
        const imageDataUrl = wechat?.image_data_url;
        setQrCodeUrl(data || null);
        setQrCodeImageDataUrl(data ? null : imageDataUrl || null);
      }
    } catch (_error) {
      handleError(t("stripe.error", "An error occurred"));
    }
  }, [confirmPayment, handleError, isSubmitted, method, t]);

  useEffect(() => {
    void autoSubmit();
  }, [autoSubmit]);

  if (method === "card") {
    return <CardPaymentForm clientSecret={client_secret} onError={handleError} />;
  }

  if (qrCodeUrl || qrCodeImageDataUrl) {
    return (
      <div className="space-y-4 text-center">
        {qrCodeImageDataUrl ? (
          <img
            alt={method}
            className="mx-auto h-[220px] w-[220px]"
            src={qrCodeImageDataUrl}
          />
        ) : (
          <QRCodeCanvas size={220} value={qrCodeUrl || ""} />
        )}
        <p className="text-sm text-slate-500">
          {method === "alipay"
            ? t("stripe.alipayHint", "Scan with Alipay to pay")
            : t("stripe.wechatHint", "Scan with WeChat to pay")}
        </p>
      </div>
    );
  }

  return errorMessage ? (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {errorMessage}
    </div>
  ) : (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {t("stripe.processing", "Processing payment...")}
    </div>
  );
};

export function StripePayment({
  method,
  client_secret,
  publishable_key,
}: Readonly<StripePaymentProps>) {
  const stripePromise = useMemo(
    () => loadStripe(publishable_key),
    [publishable_key]
  );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm client_secret={client_secret} method={method} />
    </Elements>
  );
}
