import { type FullConfig, request } from "@playwright/test";
import { warmLayoutRoutes } from "../../../../tests/e2e/layout.setup";

/**
 * Pre-compiles the routes the suite exercises.
 *
 * The E2E `webServer` is `next dev`, which compiles each route lazily on its
 * first request. That first compile can take longer than an assertion's poll
 * window, so the first test to reach a cold route (`/`, `/auth`) would flake
 * even though the app itself behaves correctly. Warming the routes here — after
 * the server is ready and before any test runs — removes that dev-only timing
 * artifact without relaxing any assertion or masking product behaviour.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]!.use.baseURL!;
  const context = await request.newContext({ baseURL });
  const deadline = Date.now() + 120_000;
  try {
    for (const path of ["/", "/auth"]) {
      // Retry until the dev server is reachable and the route has compiled.
      for (;;) {
        try {
          const response = await context.get(path, { timeout: 120_000 });
          if (response.ok()) break;
        } catch (error) {
          if (Date.now() > deadline) throw error;
        }
        if (Date.now() > deadline) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } finally {
    await context.dispose();
  }
  await warmLayoutRoutes(baseURL, ["/document"]);
}

export default globalSetup;
