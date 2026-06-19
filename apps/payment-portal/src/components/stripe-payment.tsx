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
  type StripeCardNumberElementOptions,
  type StripeElementStyle,
} from "@stripe/stripe-js";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useTheme } from "@workspace/ui/integrations/theme";
import { CheckCircle } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface StripePaymentProps {
  client_secret: string;
  method: string;
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
  const { resolvedTheme } = useTheme();
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

  const currentTheme = resolvedTheme;
  const elementStyle: StripeElementStyle = {
    base: {
      fontSize: "16px",
      color: currentTheme === "dark" ? "#fff" : "#000",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#EF4444",
      iconColor: "#EF4444",
    },
  };

  const elementOptions: StripeCardNumberElementOptions = {
    style: elementStyle,
    showIcon: true,
  };

  const handleChange = useCallback((event: any, field: keyof typeof errors) => {
    if (event.error) {
      setErrors((prev) => ({ ...prev, [field]: event.error.message }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, []);

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
    const cardExpiry = elements.getElement(CardExpiryElement);
    const cardCvc = elements.getElement(CardCvcElement);

    if (!(cardNumber && cardExpiry && cardCvc)) {
      onError(t("stripe.elementError", "Please fill in all card details"));
      setProcessing(false);
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
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setSucceeded(true);
      setProcessing(false);
    } else {
      onError(t("stripe.processing", "Processing payment..."));
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="py-6 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <p className="font-medium text-xl">
          {t("stripe.successTitle", "Payment Successful")}
        </p>
        <p className="mt-2 text-muted-foreground">
          {t(
            "stripe.successMessage",
            "Thank you. Your payment has been completed successfully."
          )}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="cardholderName">
          {t("stripe.cardName", "Cardholder Name")}
        </Label>
        <Input
          className={errors.name ? "border-destructive" : ""}
          id="cardholderName"
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder={t("stripe.namePlaceholder", "Full Name on Card")}
          type="text"
          value={cardholderName}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cardNumber">
          {t("stripe.cardNumber", "Card Number")}
        </Label>
        <div
          className={`rounded-md border p-3 focus-within:ring-1 focus-within:ring-ring ${errors.cardNumber ? "border-destructive" : ""}`}
        >
          <CardNumberElement
            id="cardNumber"
            onChange={(e: any) => handleChange(e, "cardNumber")}
            options={elementOptions}
          />
        </div>
        {errors.cardNumber && (
          <p className="text-destructive text-xs">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cardExpiry">
            {t("stripe.expiryDate", "Expiry Date")}
          </Label>
          <div
            className={`rounded-md border p-3 focus-within:ring-1 focus-within:ring-ring ${errors.cardExpiry ? "border-destructive" : ""}`}
          >
            <CardExpiryElement
              id="cardExpiry"
              onChange={(e: any) => handleChange(e, "cardExpiry")}
            />
          </div>
          {errors.cardExpiry && (
            <p className="text-destructive text-xs">{errors.cardExpiry}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cardCvc">{t("stripe.cvv", "CVV")}</Label>
          <div
            className={`rounded-md border p-3 focus-within:ring-1 focus-within:ring-ring ${errors.cardCvc ? "border-destructive" : ""}`}
          >
            <CardCvcElement
              id="cardCvc"
              onChange={(e: any) => handleChange(e, "cardCvc")}
            />
          </div>
          {errors.cardCvc && (
            <p className="text-destructive text-xs">{errors.cardCvc}</p>
          )}
        </div>
      </div>

      <Button className="w-full" disabled={!stripe || processing} type="submit">
        {processing
          ? t("stripe.processing", "Processing...")
          : t("stripe.payNow", "Pay Now")}
      </Button>
    </form>
  );
};

export function StripePayment({
  client_secret,
  publishable_key,
}: Readonly<StripePaymentProps>) {
  const stripePromise = useMemo(
    () => loadStripe(publishable_key),
    [publishable_key]
  );

  const handleError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  return (
    <Elements
      options={{ clientSecret: client_secret, appearance: { theme: "stripe" } }}
      stripe={stripePromise}
    >
      <CardPaymentForm clientSecret={client_secret} onError={handleError} />
    </Elements>
  );
}
