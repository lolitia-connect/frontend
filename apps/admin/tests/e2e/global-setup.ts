import type { FullConfig } from "@playwright/test";
import { warmLayoutRoutes } from "../../../../tests/e2e/layout.setup";

export default async function globalSetup(config: FullConfig) {
  await warmLayoutRoutes(config.projects[0]!.use.baseURL!, [
    "/dashboard/group",
    "/dashboard/servers",
    "/dashboard/order",
    "/dashboard/auth-control",
  ]);
}
