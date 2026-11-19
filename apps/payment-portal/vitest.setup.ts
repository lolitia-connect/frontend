function noop() {
  /* jsdom has no layout or media change events. */
}

if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function getAnimations() {
    return [];
  };
}

if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = noop;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    disconnect = noop;
    observe = noop;
    takeRecords() {
      return [];
    }
    unobserve = noop;
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
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
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
