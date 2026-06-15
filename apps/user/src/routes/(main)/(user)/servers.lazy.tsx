import { createLazyFileRoute } from "@tanstack/react-router";
import ServiceMonitoring from "@/sections/user/servers";

export const Route = createLazyFileRoute("/(main)/(user)/servers")({
  component: ServiceMonitoring,
});
