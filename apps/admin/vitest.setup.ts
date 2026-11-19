/**
 * Vitest setup for the admin app.
 *
 * jsdom 27 is missing two globals that React Aria reads from layout effects. In
 * both cases the throw aborts the interaction inside `act()`, so the test fails
 * with an aggregate error instead of a readable assertion:
 *
 * 1. `Element.prototype.getAnimations` — no Web Animations API. React Aria's
 *    `SharedElementTransition` calls it (Tabs' sliding indicator, and the
 *    Accordion/Disclosure transitions), which makes a tab click silently never
 *    select. Returning an empty list matches jsdom's "no animations" reality and
 *    lets React Aria take its non-animated path.
 *
 * 2. `CSS.escape` — jsdom defines no `CSS` object at all. React Aria's
 *    `getMetaValue` builds a `meta[name="..."]` selector with it, called from
 *    `Modal`'s layout effect to read the CSP nonce. Without the stub, opening
 *    any HeroUI `Modal` (i.e. every `<DialogTrigger>` dialog) threw
 *    `TypeError: Cannot read properties of undefined (reading 'escape')`.
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
  // unquoted in a CSS identifier. Sufficient for `meta[name="csp-nonce"]`, the
  // only selector React Aria builds with it.
  (globalThis as { CSS?: unknown }).CSS = {
    escape(value: string): string {
      return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
    },
  };
}
