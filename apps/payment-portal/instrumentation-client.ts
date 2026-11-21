import { captureRouterTransitionStart, init } from "@sentry/nextjs";
import { sentryOptions } from "@workspace/ui/lib/sentry-options";

init(
  sentryOptions(
    process.env.NEXT_PUBLIC_SENTRY_DSN,
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_SENTRY_RELEASE
  )
);

export const onRouterTransitionStart = captureRouterTransitionStart;
