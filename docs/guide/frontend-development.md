# Frontend development guide

This guide contains durable maintenance conventions, not task logs or acceptance reports. READMEs remain project introductions and quick starts; dated changes and validation evidence belong in .ai/sync-diffs, and agent constraints belong in .ai/prompts.

[中文](../zh/guide/frontend-development.md)

## Typography

All three apps share the CJK font configuration in `packages/ui/src/styles/`.
Latin text keeps the existing Fredoka / Sen stack in the user and admin apps,
and the existing system-font stack in the payment portal. CJK text uses self-hosted
[Swei Gothic](https://github.com/max32002/swei-gothic) WOFF2 fonts selected by the
page or element's `lang`: `ja` / `ja-JP` → JP, `zh-CN` / `zh-Hans` → SC, and
`zh-TW` / `zh-HK` / `zh-MO` / `zh-Hant` → TC. Unmarked CJK text defaults to SC.
Language switching, saved preferences, and native-language labels in the language
menu use the same mapping. Explicit `font-sans` utilities also follow that language.

The CJK faces are restricted to CJK Unicode ranges, so they do not replace Latin
letters or ASCII digits, even if the existing Latin webfonts are unavailable.
Regular (400), Medium (500), Bold (700), and Black (900) cover the UI's weights;
intermediate weights use CSS's nearest available face. Font files are unmodified
from upstream revision
[`c363a1d`](https://github.com/max32002/swei-gothic/tree/c363a1d845aa782a71b7a068b5db0aff3f83ee86/WebFont)
and bundled locally, not downloaded from a CJK font CDN at runtime. Retain their
[SIL Open Font License 1.1](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/styles/fonts/swei-gothic/OFL.txt)
when redistributing them.

## Navigation feedback

User/admin navigation uses the shared [router adapter](../../packages/ui/src/lib/router-compat.tsx).
Its `Link` starts the top progress bar from Next.js `onNavigate`, and
`navigate` / `push` / `replace` start it before invoking the router. Path/query
changes only complete progress; they must not start a post-load flash. Same-page
and hash-only destinations, cancelled clicks, downloads, external links and
new-tab clicks do not start progress. Initial page rendering stays idle.

The pending intent is retained while the client-only progress component loads.
Each new navigation replaces the previous bar and its timeout; a 30-second
fallback clears progress if navigation fails or never commits. This indicates
route navigation, not background API requests. Raw Next router calls and browser
history traversal do not emit this adapter's start signal.

The shared router tests cover timing and excluded clicks. The admin layout E2E
holds a sidebar destination response, verifies progress while the old page is
still displayed, then releases it and verifies completion.

## Testing

Unit and component tests run on [Vitest](https://vitest.dev); end-to-end flows
run on [Playwright](https://playwright.dev) against the HeroUI-native UI.

Tests belong to the workspace that owns the behavior:

- `apps/{user,admin,payment-portal}/src/**/*.test.{ts,tsx}`: app unit/component tests,
  next to the code under test; each app owns its `vitest.config.ts` and setup.
- `apps/{user,admin,payment-portal}/tests/e2e/*.spec.ts`: app browser flows, with an
  app-local `playwright.config.ts`. Files use kebab-case feature names such as
  `landing.spec.ts`, `layout.spec.ts`, `drawers.spec.ts`, and `recharge.spec.ts`.
- `packages/ui/src/**/*.test.{ts,tsx}`: shared UI behavior and package checks.
- `tests/contract` and `tests/functions`: cross-app backend contract and proxy
  tests, run by the root Vitest config. `tests/e2e` contains only helpers shared
  by multiple apps, not app-owned test cases. Name fixtures `*.fixtures.ts`.
  `tests/vitest` holds shared runner helpers; every Vitest config initializes its
  workspace-local `.tmp-vitest/` before workers start. No shell temp-directory
  override is required, including on Windows with restricted system temp access.
  Turbo includes these helpers in its test cache inputs.
- `scripts/`: maintained generators for backend contract/OpenAPI (`backend-contract.mjs` and its Go extractor), locale resources, and version locks. Repeatable checks belong in Vitest or Playwright, not standalone progress/dead-code runners. CI triage utilities live in `.github/automation`.
- The user/admin apps call the backend directly using `NEXT_PUBLIC_API_BASE_URL`; they have no Next API rewrites. The payment portal retains its `/api` rewrite. `tests/functions` covers the separate Cloudflare Pages proxy, not a Vite dev proxy.

Keep tests for live production behavior, including the Next router adapter and HeroUI-backed UI adapters.
Names containing `compat` or `legacy` are not evidence that a module is unused. Remove tests only with their
retired production entry points; migration-specific deletions are recorded in the sync ledgers.

Choose the smallest relevant selector from the commands below. Listing a command is not evidence that
its checks have passed; record actual outcomes separately in the dated sync ledgers.

```bash
# Unit / component tests and shared contract/proxy checks
bun run test
bun run test:shared
bun run test:contract
bun run test:proxy

# Same unit/shared suites with bounded concurrency on shared machines
bunx turbo test --concurrency=1 -- --maxWorkers=2
bun run test:shared --maxWorkers=2

# All apps' browser suites (test:e2e:all is an alias)
bun run test:e2e

# One app, with ordinary Playwright filters/options forwarded
bun run test:e2e:user
bun run test:e2e:admin drawers.spec.ts
bun run test:e2e:payment-portal --list

# Admin layout/drawer regressions and user layout regressions
bun run test:e2e:layout

# Equivalent app-local commands
bun run --cwd apps/payment-portal test
bun run --cwd apps/payment-portal test:e2e
bun run --cwd apps/payment-portal test:e2e:report

# Open the user app's last HTML report
bun run test:e2e:report
```

Each app writes its own `test-results/`, `playwright-report/`, and `.tmp-e2e/`.
Shared contract tests execute the Go extractor and require Go on `PATH` (or an
explicit `GO_BINARY`); `bun run test` includes these checks, while app-local
`test` commands run only that app's Vitest suite.
The Bun package scripts set `PLAYWRIGHT_TRANSFORM_CACHE_DIR` before Playwright
loads the TypeScript config, avoiding Windows system-temp permission errors
without an extra launcher script. Use the package commands above rather than a
bare Playwright CLI when that system directory is restricted. Config paths and
server working directories are resolved relative to each app, not the caller.

### Sidebar, tabs, and tables

The layout suite mocks backend requests and uses isolated Next.js servers on
ports 3014 (admin, override with `ADMIN_E2E_PORT`) and 3010 (user, override with
`E2E_PORT`). Both landing and layout tests now belong to the user app and share
its test server. `NEXT_DIST_DIR` can select a separate test build directory for
concurrent runs. It checks full-width sidebar links,
keyboard-accessible scrolling tabs in the supported languages, and table
column/action geometry at desktop and 320–375px viewport widths. Component tests
cover row selection identity, column visibility, filter/pagination payloads, and
sidebar keyboard focus. Existing dev servers on ports 3000–3002 are not reused.

Data tables use HeroUI's `Table` compound components with labeled columns and
stable row IDs. Wide tables scroll inside `Table.ScrollContainer`; settings
menus use lists instead of one-column tables. Horizontal tab strips use
`Tabs.ListContainer` rather than wrapping full-width tabs into multiple rows.
The shared stylesheet disables only the tab indicator's shared-element transition:
this keeps native indicator sizing correct through language changes and resizing,
without changing HeroUI colors, tab interactions, or dependency files.

### Payment portal

The [payment portal](https://github.com/lolitia-connect/frontend/tree/main/apps/payment-portal) uses HeroUI v3 components directly,
with an [app-local stylesheet](https://github.com/lolitia-connect/frontend/blob/main/apps/payment-portal/app/globals.css) importing
Tailwind v4, HeroUI, and the [shared semantic theme](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/styles/theme.css).
All three applications use the same HeroUI accent, surface, field, radius, and
light/dark tokens. The [shared auth shell](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/composed/auth-shell.tsx)
also keeps their login panel width, responsive spacing, and mobile presentation
in sync. The portal does not use compatibility UI wrappers or import the shared
component overrides. Language/theme persistence and backend services remain
shared; API error notifications are rendered by HeroUI rather than the shared
Sonner toaster.

`NEXT_PUBLIC_PAYMENT_PORTAL_AMOUNTS` uses the following configuration rule:
values below `10000` are major currency units (`10` means $10 with USD),
while legacy values at or above `10000` are cents (`10000` means $100).
The UI uses major units after parsing; backend amounts are converted exactly once.
`NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT` sets the custom-input floor
(default 1; smaller configured values are clamped to 1). Custom input is numeric,
steps by 0.01, allows clearing, and immediately raises a smaller non-empty value
to that minimum. Preset amounts are not subject to the custom-input minimum.

The confirmation dialog always displays the backend's amount, fee, and total;
checkout is requested only by **Pay Now**. Cancel dismisses confirmation without
closing the already-created backend order. Selections remain
editable while refresh/submission is pending, and the same pending amount/method
cannot be submitted twice. Refresh failures keep the current order available;
failed checkout requests can be retried without reloading.

The portal E2E suite owns an isolated `.next-playwright` output and port 3013
(override with `PAYMENT_PORTAL_E2E_PORT`). Its app-local Playwright command keeps
temporary files in `apps/payment-portal/.tmp-e2e`, including the config-transform
cache on Windows.
It mocks all API calls and never submits real payments. It covers authentication, keyboard selection, confirmation,
checkout/status refresh, captcha, and mobile theme/language behavior. Install the
Playwright Chromium browser once with `bun x playwright install chromium` if it
is missing. Run `bun --cwd apps/payment-portal typecheck` and
`bun --cwd apps/payment-portal lint` for the scoped static checks.

## Responsive layout checks

Check 320px and 375px phones, 768px tablets, and desktop viewports. Allow flex/grid children to shrink, wrap long order IDs, payment names and document titles, and let action buttons wrap. Bills use a single column on phones. Wide Markdown tables and code blocks scroll locally instead of relying on page-level `overflow-x-hidden` to clip content.

The user `layout.spec.ts` covers profile cards, long documents and payment bills; admin `drawers.spec.ts` covers create drawers at 320px/375px; payment portal `recharge.spec.ts` covers long payment names in confirmation and QR checkout. These tests mock APIs and create no real orders. Concurrent runs also need distinct Playwright `--output` directories, in addition to separate ports and build directories.

## Request-language SSR

User and admin root layouts negotiate the standard `Accept-Language` request
header against their supported languages, honoring quality weights and regional
fallbacks (including Simplified/Traditional Chinese). Missing, invalid, or
unsupported preferences fall back to the app's default language. The selected
language controls both `<html lang>` and server-rendered translations.

SSR uses a fresh i18next instance per render. The selected locale's existing
catalogs are loaded on the server and passed to the client with the same initial
language; other locales are not bundled into the client entry. Do not reuse a
mutable translator across requests. After hydration, an explicit saved browser
choice still takes precedence; automatic detection must not persist the request
language as a manual preference.

Reading `headers()` makes these routes request-rendered rather than statically
prerendered. Do not cache language-specific HTML across requests without an
appropriate language-aware cache key. The payment portal keeps its existing
language initialization. Both apps' `i18n-ssr.spec.ts` cover concurrent request
languages and hydration with a conflicting saved preference.

All three apps exclude `*.test.*`, `*.spec.*`, and `__tests__` directories from
translation extraction and status checks, including within shared UI sources.
Test-only keys belong in test fixtures, not production catalogs. Run
`bun run i18n:status` before pushing to verify production translation coverage.

## Startup performance (user and admin)

Site configuration and session recovery run independently: slow or failed public
configuration must not delay authentication or guest detection. Initial admin
translation namespaces are selected by pathname; other namespaces load when their
components are visited. Keep bundled fallback translations for deterministic HTML.
Pages rely on Next.js route splitting rather than dynamically importing their
entire visible section, avoiding an extra hydration boundary racing with language
detection.

The user hero remains in the initial HTML. Its decorative globe is code-split and
starts after configuration and session detection settle, a paint opportunity, and
an idle callback (with a timeout and an unsupported-browser fallback). Plan-card
code loads only when subscription data is available.

Admin summary cards render immediately. Chart code and chart-specific requests
wait until reserved placeholders approach the viewport; revealed charts remain
mounted to retain their selections. Traffic cards use stable component identities
and share the selected period; hover details load on demand. The focused browser
checks are in [performance.spec.ts](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/performance.spec.ts).

These are code-level optimizations, not asset or infrastructure changes. Measure
LCP with a production build; development compilation timings are not production
performance results.

Page-enter animations must keep their first frame opaque: a full-page fade from
zero opacity hides already-rendered text while hydration occupies the main thread.
The shared theme script resolves the saved/system theme in the document head; do
not hide the document behind a hydration-dependent overlay. Both apps' SSR E2E
suites pause the animation with JavaScript disabled and verify the heading is
uncovered and paintable.

## Accessibility checks

Each app's `accessibility.spec.ts` uses the development-only `@axe-core/playwright`
runner with mocked APIs. Run `bun run --cwd apps/<app> test:e2e accessibility.spec.ts`
for `user`, `admin`, or `payment-portal`. Checks cover light/dark themes, stable
control names, landmarks, heading levels, contrast, skip-to-content focus, and
keyboard operation of account tabs, collapsed navigation and payment dialogs.
Automated checks supplement, rather than replace, screen-reader and keyboard review.

Keep a focusable `main-content` target for the shared skip link. Navigation groups
must contain valid lists; interactive flyouts use a focus-managed popover, not a
tooltip containing links. Form errors are announced and fields retain labels after
typing. Preserve sufficient text/focus contrast when changing shared theme tokens.

## User app maintenance

### Landing page components

The landing page follows the user dashboard's HeroUI `Card`, `Card.Title`,
`Card.Description`, `Chip`, and shared button patterns, using the theme's default
background, surfaces, radii, and interaction states. Service and plan cards do not
override these with glass backgrounds, custom shadows, or hover movement. The
hero's WebGL globe animation remains independent. Its palette is defined by
`--globe-*` variables in [`global-map.css`](https://github.com/lolitia-connect/frontend/blob/main/apps/user/src/sections/main/global-map.css),
derived from HeroUI's `accent`, `surface`, and `muted` semantic tokens, with
vivid yellow, green, and blue `--globe-route-*` colors cycling across the routes.
The Hong Kong hub connects to Sofia, Singapore, Manila, and Changhua alongside
the existing destinations. WebGL resolves these CSS colors to sRGB on
initialization and theme changes without altering the globe's layout or animation.
Routes follow the shortest great-circle path with at most four units of extra
lift above their endpoints (globe radius: 100), keeping intercontinental lines
close to the surface while preserving the smaller local arcs.

### Main-content empty states

Page-level empty states use [MainEmpty](https://github.com/lolitia-connect/frontend/blob/main/apps/user/src/components/main-empty.tsx), with the same
`py-24` spacing as the ticket support list. Keep this wrapper limited to main
content; do not change shared empty-state defaults or placeholders inside
sidebars, dialogs, or charts. Cards wrapping a main empty state must not add
vertical padding.


### OAuth callbacks

Login and account binding callbacks are handled by the Next.js App Router at
`/oauth/[platform]` and `/bind/[platform]`. Keep the registered redirect URLs as
`<origin>/oauth/<provider>/` and `<origin>/bind/<provider>/`, including the trailing
slash. Next.js normalizes the slash while preserving query parameters; no static
HTML bridge pages or static-host fallback rules are required.

Telegram callbacks support query parameters and URL fragments (`#tgAuthResult=...`),
as well as individual signed fields. Popup callbacks relay results to the opener;
full-page callbacks perform the exchange directly. Both paths use the existing
backend `tgAuthResult` format. Deploy this app with a Next.js runtime.

## Admin app maintenance

### Drawer layout

Admin business sheets share the sizing and responsive rules in [app/drawers.css](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/app/drawers.css), loaded only by the admin root layout:

- Desktop sheets are capped at **60rem (960px)** with a small viewport gutter; phones below 40rem use the full viewport width. Mobile navigation separately caps its outer `Sheet.Content` at **18rem (288px)**, leaving at least 2rem of backdrop space. Its inner sidebar fills that width and does not use business-sheet sizing.
- Size `Sheet.Content`, not only `Sheet.Dialog`: HeroUI's content wrapper otherwise limits the visible panel. Avoid introducing per-form fixed widths.
- Keep the header and footer outside the scrolling body. Use the existing `ScrollArea` as a direct dialog child, or `admin-drawer-body` for table/editor content, rather than calculating a height from assumed header/footer sizes.
- Use `admin-drawer-form` for paired short fields and `admin-drawer-wide` for full-row content. Grid columns collapse according to the **panel width**, not the page width. Repeatable input rows wrap while retaining readable input widths and accessible add/remove actions.
- Long labels, tags, and ticket messages wrap; selects truncate their displayed value without changing it. Ticket conversations keep an independent scroll area and a visible reply bar.

The focused [drawer browser regressions](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/drawers.spec.ts) cover desktop/mobile layout, nested sheets, long content, and unchanged form submission payloads. Run from the repository root:

```bash
bun run test:e2e:admin drawers.spec.ts
```

### Header breadcrumbs

The [header](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/src/layout/header.tsx) keeps breadcrumbs on one line and allows horizontal scrolling when the full path exceeds the available space. The left group can shrink while the language, timezone, theme and account controls remain visible. The `breadcrumbs scroll` cases in the [layout regression tests](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/layout.spec.ts) cover English and Chinese at 320–1280px, scrolling and ancestor link navigation.

### Settings option interactions

System, authentication, and marketing option entries, the subscription configuration entry, and the two server management shortcuts all use the same full-card `settings-option` trigger: the whole card is a single clickable button styled like a HeroUI card (surface background, `shadow-surface`, rounded corners, and a light-mode hairline) with HeroUI's native hover, press-scale, and keyboard focus feedback. Each option opens its configuration sheet; stack entries with spacing (`space-y-3`) rather than wrapping them in a list container. The shared sizing and text layout live in the [shared stylesheet](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/styles/globals.css). Keep the icon, shrinkable text container, and chevron as separate layout items. Long text wraps while icons and chevrons retain their size; the server toolbar wraps on narrow screens to prevent horizontal overflow.

The [layout regressions](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/layout.spec.ts) cover English/Chinese, light/dark themes, widths from 320 to 1280px, and opening sheets:

```bash
bun run test:e2e:admin layout.spec.ts --grep "settings options wrap|settings lists open"
```
