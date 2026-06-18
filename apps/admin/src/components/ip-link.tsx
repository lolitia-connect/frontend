"use client";

import { ExternalLink } from "lucide-react";
import type React from "react";

interface IpLinkProps {
  children?: React.ReactNode;
  className?: string;
  ip: string;
  target?: "_blank" | "_self";
}

export function IpLink({
  ip,
  children,
  className = "",
  target = "_blank",
}: IpLinkProps) {
  const url = `https://ipinfo.io/${ip}`;

  return (
    <a
      className={`inline-flex items-center gap-1 font-mono text-primary transition-colors hover:text-primary/80 hover:underline ${className}`}
      href={url}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      target={target}
    >
      {children || ip}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
