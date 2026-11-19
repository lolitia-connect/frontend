"use client";

import { Button } from "@workspace/ui/components/button";
import { Link } from "@workspace/ui/lib/router-compat";

interface OrderLinkProps {
  className?: string;
  orderId?: string | number;
}

export function OrderLink({ orderId, className }: OrderLinkProps) {
  if (!orderId) return <span>--</span>;

  return (
    <Button asChild className={`p-0 ${className || ""}`} variant="link">
      <Link search={{ search: orderId }} to="/dashboard/order">
        {orderId}
      </Link>
    </Button>
  );
}
