import {
  captureRouterTransitionStart,
  init,
  makeFetchTransport,
  replayIntegration,
} from "@sentry/nextjs";
import { sentryOptions } from "@workspace/ui/lib/sentry-options";
import { sentryBrowserOptions } from "@workspace/ui/lib/sentry-replay";

init(
  sentryBrowserOptions(
    sentryOptions(
      process.env.NEXT_PUBLIC_SENTRY_DSN,
      process.env.NODE_ENV,
      process.env.NEXT_PUBLIC_SENTRY_RELEASE
    ),
    replayIntegration,
    makeFetchTransport
  )
);

export const onRouterTransitionStart = captureRouterTransitionStart;
