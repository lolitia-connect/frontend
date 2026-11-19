/**
 * Invitation-code resolution for the auth section.
 *
 * New invitation links are generated in the App Router form
 * (`https://<site>/auth?invite=<code>`) by the affiliate share link and the user
 * sidebar — see `sections/user/affiliate/index.tsx` and
 * `sections/user/sidebar-right.tsx` — and those are visible to `useSearch()`.
 *
 * The hash form (`https://<site>/#/auth?invite=<code>`) is the *pre-migration*
 * shape: the old app used TanStack hash history, so links in that form were
 * shared, bookmarked, and are still in circulation, and `useSearch()` only reads
 * `window.location.search`, so an invite delivered in the fragment is invisible
 * to it.
 *
 * That produced the reported defect: a visitor arriving through a valid
 * invitation link had no detected invitation, so the auth page showed
 * "An invitation code is required. Open your invitation link to continue."
 * even though the invitation was right there in the URL, and the OAuth buttons
 * were disabled as if no invite existed.
 *
 * This reads every place an invite can legitimately arrive from, in priority
 * order, and is safe to call during server rendering.
 */
export function resolveInviteCode(explicit?: string | null): string {
  if (explicit) {
    return explicit;
  }

  if (typeof window === "undefined") {
    return "";
  }

  try {
    // 1. Real query string: /auth?invite=<code>
    const fromSearch = new URLSearchParams(window.location.search).get(
      "invite"
    );
    if (fromSearch) {
      return fromSearch;
    }

    // 2. Hash query: /#/auth?invite=<code> — the pre-migration link shape.
    //    Kept for links already in circulation and for the OAuth provider round
    //    trip, which can still carry the fragment through.
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const hashQueryIndex = hash.indexOf("?");
    if (hashQueryIndex >= 0) {
      const fromHash = new URLSearchParams(hash.slice(hashQueryIndex)).get(
        "invite"
      );
      if (fromHash) {
        return fromHash;
      }
    }

    // 3. Previously captured invite (set when the page was first opened).
    return localStorage.getItem("invite") || "";
  } catch {
    // Private-mode / storage-disabled browsers: fall through to "no invite".
    return "";
  }
}
