/**
 * Vitest setup for `packages/ui`.
 *
 * Two jsdom gaps trip React Aria, and both throw from a layout effect, which
 * aborts the interaction inside `act()` so the test fails with a confusing
 * aggregate error rather than a clear assertion:
 *
 * 1. `Element.getAnimations` (used by `SharedElementTransition` — the machinery
 *    behind HeroUI's sliding `<Tabs.Indicator />` and the Accordion/Disclosure
 *    transitions). A tab click silently never selects without it.
 *
 * 2. `CSS.escape` (used by React Aria's `getMetaValue`, called from
 *    `Modal`'s layout effect to read `<meta name="csp-nonce">`). jsdom 27
 *    defines no `CSS` object at all, so this threw
 *    `TypeError: Cannot read properties of undefined (reading 'escape')` the
 *    moment a HeroUI `Modal` opened — e.g. `DialogTrigger` → dialog.
 *
 * Both stubs match jsdom's reality ("no animations", "no nonce") so React Aria
 * takes its plain path. The guards make this file a no-op under the `node`
 * environment, where `Element`/`CSS` are undefined.
 *
 * The `getAnimations` stub previously existed only in the two app setups; it
 * belongs here as well because this package is where the wrappers live.
 */
if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function getAnimations() {
    return [];
  };
}

if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo() {};
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  }
  (
    globalThis as { IntersectionObserver?: typeof IntersectionObserver }
  ).IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }) as MediaQueryList;
}

if (typeof globalThis.CSS === "undefined") {
  // Minimal, spec-shaped `CSS.escape`: escape every character that is not safe
  // unquoted in a CSS identifier. Sufficient for attribute selectors such as
  // `meta[name="csp-nonce"]`, which is the only use React Aria makes of it.
  (globalThis as { CSS?: unknown }).CSS = {
    escape(value: string): string {
      return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
    },
  };
}
