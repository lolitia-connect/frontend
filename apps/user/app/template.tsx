import type { ReactNode } from "react";

/**
 * Per-navigation enter transition.
 *
 * A `template.tsx` (unlike `layout.tsx`) re-mounts on every navigation, so the
 * CSS animation below replays on each route change. That is what makes page
 * switches feel continuous without a client-side router wrapper.
 *
 * Timing follows HeroUI's own tokens rather than ad-hoc curves:
 *   --ease-out-fluid  cubic-bezier(.32, .72, 0, 1)  (fast start, smooth stop)
 * Kept deliberately short (~0.28s) so navigation still feels immediate; the
 * upper bound of the 0.2–0.5s budget is reserved for overlays.
 *
 * `prefers-reduced-motion: reduce` collapses this to no animation (see
 * `.page-transition` in globals.css), so motion-sensitive users get an instant
 * swap. The animation is opacity/transform only — it cannot cause layout shift
 * or a hydration mismatch.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
