import { captureRequestError } from "@sentry/nextjs";
import { sentryOptions } from "@workspace/ui/lib/sentry-options";

export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const { init } = await import("@sentry/nextjs");
    init(
      sentryOptions(
        process.env.NEXT_PUBLIC_SENTRY_DSN,
        process.env.NODE_ENV,
        process.env.NEXT_PUBLIC_SENTRY_RELEASE
      )
    );
  }
}

export const onRequestError = captureRequestError;
