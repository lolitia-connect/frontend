/**
 * Vitest environment setup for the App Router app.
 *
 * jsdom 27 is missing two globals that React Aria reads from layout effects. In
 * both cases the throw aborts the interaction inside `act()`, so the test fails
 * with an aggregate error instead of a readable assertion:
 *
 * 1. `Element.prototype.getAnimations` — no Web Animations API. HeroUI v3's
 *    compound components use `react-aria-components`, whose
 *    `SharedElementTransition` calls it (e.g. the sliding `<Tabs.Indicator />`).
 *    Returning an empty list matches jsdom's "no animations are running" reality
 *    and lets React Aria take its non-animated path.
 *
 * 2. `CSS.escape` — jsdom defines no `CSS` object at all. React Aria's
 *    `getMetaValue` builds a `meta[name="..."]` selector with it, called from
 *    `Modal`'s layout effect to read the CSP nonce. Without the stub, opening
 *    any HeroUI `Modal` (i.e. every `<DialogTrigger>` dialog) threw
 *    `TypeError: Cannot read properties of undefined (reading 'escape')`.
 */
// jsdom has no layout engine; browser tests exercise actual tab overflow.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
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
