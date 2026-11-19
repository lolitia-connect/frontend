import { Alert as HeroAlert } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

/**
 * HeroUI v3 `Alert` adoption (real component).
 *
 * Exported names and prop signatures are unchanged: `Alert` still takes
 * `React.ComponentProps<"div">` plus the same `variant` union, and
 * `AlertTitle` / `AlertDescription` still take `React.ComponentProps<"div">`.
 *
 * Structure note — why the parts are remapped rather than reused verbatim:
 * HeroUI's `Alert.Title` renders a `<p>` and `.Description` a `<span>`, but our
 * public types are `ComponentProps<"div">`. Rendering HeroUI's parts directly
 * would change the element type under a `div`-typed API, so the root is HeroUI's
 * real `Alert` and both children are normalised through `Alert.Content`:
 *
 *   <Alert>                                 (HeroUI root — real component)
 *     <Alert.Content className="grid ...">  (HeroUI part)
 *       <div data-slot="alert-title">       (our div-typed API)
 *       <div data-slot="alert-description">
 *
 * `variant` keeps its exact union and its previous appearance:
 * - `destructive` → HeroUI `status="danger"` (this theme maps danger onto the
 *   old `--destructive` value) plus the previous destructive text treatment.
 * - `default` → HeroUI `status="default"`.
 *
 * The indicator is intentionally omitted: HeroUI's `Alert.Indicator` injects a
 * status icon, and the existing call sites already pass their own icon as the
 * first child, so rendering it would duplicate every one of those icons.
 */

type AlertVariant = "default" | "destructive";
const ALERT_BASE =
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current";
function alertVariants(variant: AlertVariant = "default") {
  return cn(
    ALERT_BASE,
    variant === "destructive" &&
      "text-danger *:data-[slot=alert-description]:text-danger/90 [&>svg]:text-current"
  );
}

function Alert({
  className,
  children,
  variant,
  ...props
}: React.ComponentProps<"div"> & { variant?: AlertVariant | null }) {
  return (
    <HeroAlert
      className={className}
      data-slot="alert"
      role="alert"
      status={variant === "destructive" ? "danger" : "default"}
      {...props}
    >
      <HeroAlert.Content className={alertVariants(variant ?? "default")}>
        {children}
      </HeroAlert.Content>
    </HeroAlert>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-muted text-sm [&_p]:leading-relaxed",
        className
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
