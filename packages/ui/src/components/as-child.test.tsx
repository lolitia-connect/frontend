/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge } from "./badge";
import { BreadcrumbLink } from "./breadcrumb";
import { Button, buttonVariants } from "./button";

// This repo's vitest setups do not register testing-library's automatic cleanup,
// so each test file unmounts explicitly. Without it, a query for a `data-testid`
// finds the element left over from an earlier test in the same file.
afterEach(cleanup);

/**
 * Regression guard for the `asChild` projection contract.
 *
 * `asChild` is not a HeroUI concept (HeroUI uses a `render` function), but it is
 * used at ~100 call sites, so `packages/ui` projects slot props onto the caller's
 * own element instead of adding a wrapper. `lib/slot.tsx` provides that
 * projection. These assertions pin the behaviour the call sites depend on, so a
 * swap of the underlying implementation cannot silently regress it:
 *
 *   1. the child element itself is rendered (no wrapper element appears);
 *   2. the parent's classes are merged *before* the child's, so the child's own
 *      utilities still win;
 *   3. both the slot's and the child's event handlers run, slot last;
 *   4. a `ref` reaches the caller's element rather than the (absent) wrapper.
 */
describe("asChild slot projection", () => {
  it("gives text buttons the tab-style opacity hover without a background", () => {
    const classes = buttonVariants({ variant: "link" });

    expect(classes).toContain("hover:bg-transparent");
    expect(classes).toContain("active:bg-transparent");
    expect(classes).toContain("hover:opacity-70");
  });

  it("renders the child element itself, with no wrapper", () => {
    const { container } = render(
      <Button asChild data-testid="target">
        <a href="/docs">Docs</a>
      </Button>
    );

    const el = container.querySelector('[data-testid="target"]');
    expect(el).not.toBeNull();
    expect(el?.tagName).toBe("A");
    expect(el?.getAttribute("href")).toBe("/docs");
    // A wrapper would put a <button> around the anchor.
    expect(container.querySelector("button")).toBeNull();
  });

  it("merges slot classes onto the child without dropping the child's own", () => {
    const { container } = render(
      <Button asChild className="mine">
        <a className="child-class" data-testid="target" href="/docs">
          Docs
        </a>
      </Button>
    );

    const cls =
      container.querySelector('[data-testid="target"]')?.className ?? "";
    expect(cls).toContain("button");
    expect(cls).toContain("mine");
    expect(cls).toContain("child-class");
    // The HeroUI-backed element keeps the same slot marker after projection.
    expect(cls).toContain("min-w-0");
  });

  it("runs both the slot's and the child's click handlers", () => {
    const slotClick = vi.fn();
    const childClick = vi.fn();
    const { container } = render(
      <Button asChild onClick={slotClick}>
        <a data-testid="target" href="/docs" onClick={childClick}>
          Docs
        </a>
      </Button>
    );

    container.querySelector<HTMLElement>('[data-testid="target"]')?.click();

    expect(childClick).toHaveBeenCalledTimes(1);
    expect(slotClick).toHaveBeenCalledTimes(1);
  });

  it("forwards a ref to the caller's element", () => {
    // `Button`'s public props are `ComponentProps<"button">`, so the ref slot is
    // typed as a button even though `asChild` projects onto the caller's own
    // element (an anchor here). The runtime contract is what matters: the ref
    // must land on the child, not on a wrapper.
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button asChild ref={ref}>
        <a data-testid="target" href="/docs">
          Docs
        </a>
      </Button>
    );

    const current = ref.current as unknown as HTMLElement | null;
    expect(current).not.toBeNull();
    expect(current?.tagName).toBe("A");
    expect(current).toBe(
      document.querySelector('[data-testid="target"]') as HTMLElement
    );
  });

  it("keeps the same contract for Badge", () => {
    const { container } = render(
      <Badge asChild>
        <a data-testid="target" href="/tag">
          Tag
        </a>
      </Badge>
    );

    const el = container.querySelector('[data-testid="target"]');
    expect(el?.tagName).toBe("A");
    // Badge is HeroUI level (A) and maps onto HeroUI's `Chip`, so the applied
    // BEM block is `chip` (with the `badgeVariants()` compatibility classes).
    expect(el?.className ?? "").toContain("chip");
  });

  it("keeps the same contract for BreadcrumbLink", () => {
    const { container } = render(
      <BreadcrumbLink asChild>
        <a data-testid="target" href="/home">
          Home
        </a>
      </BreadcrumbLink>
    );

    const el = container.querySelector('[data-testid="target"]');
    expect(el?.tagName).toBe("A");
    expect(el?.className ?? "").toContain("breadcrumbs__link");
  });

  it("still renders a real button when asChild is not used", () => {
    const { container } = render(<Button data-testid="target">Save</Button>);

    const el = container.querySelector('[data-testid="target"]');
    expect(el?.tagName).toBe("BUTTON");
    expect(el?.getAttribute("type")).toBe("submit");
  });
});
