"use client";

import { useEffect } from "react";

/**
 * Site metadata synchronisation.
 *
 * The pre-migration root route (`src/routes/__root.tsx`) rendered the operator's
 * branding into the document head on every page:
 *
 *   <title>{site.site_name || "Loading..."}</title>
 *   <meta content={site.site_desc} name="description" />
 *   <meta content={site.keywords} name="keywords" />
 *   <link href={window.location.href} rel="canonical" />
 *   <link href={site.site_logo} rel="icon" />
 *   <link href={site.site_logo} rel="apple-touch-icon" sizes="180x180" />
 *
 * The App Router port kept only the *static* `export const metadata` declared in
 * each `app/layout.tsx`, so the operator's site name, description, keywords and
 * logo silently stopped reaching the document head — the browser tab kept
 * showing the build-time title. The values come from `GET /public/config`, which
 * is only reachable from the browser, so this is applied in an effect rather
 * than through `generateMetadata`.
 *
 * Everything here is deliberately imperative and effect-only:
 *   - nothing is read during render, so it cannot cause a hydration mismatch
 *     (React compares the server HTML against the client's first render, and
 *     this runs strictly after that);
 *   - Next.js can commit route metadata after pathname effects have run. Keep
 *     the client title in sync with later head mutations as well as navigation,
 *     configuration and translation updates.
 */

export interface SiteMetadataOptions {
  description?: string;
  keywords?: string;
  /** Site logo URL; when empty the icon links are left untouched. */
  logo?: string;
  /** Translated title for the current page. */
  pageTitle?: string;
  /** Current pathname, used to re-apply the tags after client navigations. */
  pathname?: string;
  /** Document title. Falls back to `"Loading..."`, matching the old root route. */
  title?: string;
  /** Optional suffix appended after the site title. */
  titleSuffix?: string;
}

function setMeta(name: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(rel: string, href: string, sizes?: string): void {
  const selector = sizes
    ? `link[rel="${rel}"][sizes="${sizes}"]`
    : `link[rel="${rel}"]`;

  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (sizes) element.setAttribute("sizes", sizes);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function useSiteMetadata({
  title,
  pageTitle,
  titleSuffix,
  description,
  keywords,
  logo,
  pathname,
}: SiteMetadataOptions): void {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const siteTitle = title || "Loading...";
    const documentTitle = pageTitle
      ? `${pageTitle} | ${siteTitle}${titleSuffix || ""}`
      : `${siteTitle}${titleSuffix || ""}`;
    const syncTitle = () => {
      if (document.title !== documentTitle) document.title = documentTitle;
    };

    syncTitle();
    // Watch the head because Next may replace the title node after navigation.
    const observer = new MutationObserver(syncTitle);
    observer.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [title, pageTitle, titleSuffix, pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    setMeta("description", description || "");
    setMeta("keywords", keywords || "");

    // `url`/`logo` were rendered only when the config provided them; an empty
    // `href` would otherwise point the icon at the current document.
    setLink("canonical", window.location.href);
    if (logo) {
      setLink("icon", logo);
      setLink("apple-touch-icon", logo, "180x180");
    }
  }, [description, keywords, logo, pathname]);
}
