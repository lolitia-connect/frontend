export function sentryBuildOptions(
  project: string,
  env: NodeJS.ProcessEnv = process.env
) {
  const authToken = env.SENTRY_AUTH_TOKEN;
  const upload = Boolean(
    env.NODE_ENV === "production" &&
      authToken &&
      env.NEXT_PUBLIC_SENTRY_DSN &&
      (!env.CONTEXT || env.CONTEXT === "production")
  );

  if (upload && (env.NEXT_PUBLIC_USER_EMAIL || env.NEXT_PUBLIC_USER_PASSWORD)) {
    throw new Error(
      "Remove the development default login credentials before uploading Sentry source maps."
    );
  }

  return {
    org: "yumian-pte-ltd",
    project,
    authToken: upload ? authToken : undefined,
    release: {
      name: env.NEXT_PUBLIC_SENTRY_RELEASE || env.COMMIT_REF,
      create: false,
      finalize: false,
      setCommits: false as const,
    },
    sourcemaps: { disable: !upload, deleteSourcemapsAfterUpload: upload },
    sentryUrl: "https://sentry.io",
    errorHandler() {
      throw new Error("Sentry source map upload or cleanup failed.");
    },
    telemetry: false,
  };
}
