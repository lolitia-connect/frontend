"use client";

import {
  Avatar as HeroAvatar,
  AvatarFallback as HeroAvatarFallback,
  AvatarImage as HeroAvatarImage,
} from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

/**
 * HeroUI v3 `Avatar` adoption (real component).
 *
 * The exported names and prop signatures stay exactly as before. HeroUI's
 * Avatar supplies the image and fallback states while preserving the existing
 * size and className contract; callers that pass their own size utilities win.
 */

type AvatarProps = React.ComponentProps<typeof HeroAvatar> & {
  color?: string;
};

type AvatarStatusColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

/**
 * Our public props type stays `React.ComponentProps<typeof AvatarPrimitive.Root>`,
 * which exposes the DOM passthrough `color?: string`. HeroUI's `color` is a
 * semantic status union instead, so a raw string cannot be forwarded. We keep
 * accepting the prop (API unchanged) and forward only values HeroUI understands.
 */
function toStatusColor(
  color: string | undefined
): AvatarStatusColor | undefined {
  return color === "default" ||
    color === "accent" ||
    color === "success" ||
    color === "warning" ||
    color === "danger"
    ? color
    : undefined;
}

function Avatar({ className, color, ...props }: AvatarProps) {
  return (
    <HeroAvatar
      className={cn("size-8 rounded-full", className)}
      color={toStatusColor(color)}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof HeroAvatarImage>) {
  return (
    <HeroAvatarImage
      className={className}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  color,
  ...props
}: React.ComponentProps<typeof HeroAvatarFallback> & { color?: string }) {
  return (
    <HeroAvatarFallback
      className={className}
      color={toStatusColor(color)}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
