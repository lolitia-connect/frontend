import { createLazyFileRoute } from "@tanstack/react-router";
import UnmatchedPayments from "@/sections/log/payment-unmatched";

export const Route = createLazyFileRoute("/dashboard/log/payment-unmatched")({
  component: UnmatchedPayments,
});
