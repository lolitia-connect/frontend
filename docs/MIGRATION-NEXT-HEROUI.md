# Migration Playbook: Vite + legacy router → Next.js App Router + HeroUI v3

Applies to `apps/user`, `apps/admin` (merged into `main`). `apps/payment-portal` is
already migrated and serves as the reference implementation.

> **Source of truth for HeroUI facts:** the HeroUI MCP server
> (`@heroui/react-mcp`). Never rely on memory for versions, peer deps, theming, or
> component APIs — call `get_docs` / `get_component_docs` and follow it.

## Locked versions

| Package | Version | Notes |
| --- | --- | --- |
| `@heroui/react` | `3.2.7` | peers below are pulled automatically |
| `@heroui/styles` | `3.2.7` | |
| `next` | `^16.0.10` | App Router, Turbopack |
| `react` / `react-dom` | `^19.2.0` | required by HeroUI v3 |
| `tailwindcss` + `@tailwindcss/postcss` | `^4.2.2` | v4 required by HeroUI |

HeroUI v3 requires **React 19+** and **Tailwind v4**, and needs **no Provider wrapper**.

## Already done centrally — do NOT redo

These ran repo-wide, so app code is already converted:

1. **Env vars**: `import.meta.env.VITE_X` → `process.env.NEXT_PUBLIC_X`
   (847 sites, 45 files). `.env` keys renamed too.
2. **Router imports**: legacy runtime hooks → the compat shim
   `@workspace/ui/lib/router-compat` (58 files).
3. **Design tokens**: colliding shadcn utilities retargeted to HeroUI semantics
   (`bg-accent`→`bg-default`, `bg-muted`→`bg-default`,
   `text-accent-foreground`→`text-default-foreground`,
   `text-muted-foreground`→`text-muted`) — 590 sites, 155 files.
4. **Pink theme**: `packages/ui/src/styles/globals.css` now imports
   `@heroui/styles` and overrides HeroUI's tokens with the original pink
   (`--accent: oklch(66.378% 0.21815 354.142)` light / `oklch(75% 18% 345)` dark).
   It also bridges the legacy token names HeroUI does not define
   (`--primary`, `--card`, `--popover`, `--ring`, `--input`, `--sidebar*`,
   `--chart-*`, `--destructive`).
5. **Shared SSR fixes** in `packages/ui`:
   - `integrations/theme.tsx` — `window.matchMedia` guarded + `mounted` gate
     (previously crashed `next build` prerendering).
   - `lib/i18n.ts` — idempotent, SSR-safe init (browser-only plugins gated).

## The router shim

`@workspace/ui/lib/router-compat` re-implements the slice of the legacy API the
apps use, on top of `next/link` + `next/navigation`:

| legacy | Shim behaviour |
| --- | --- |
| `<Link to search params />` | maps to `next/link`; `to`→`href`, object `search`→query string |
| `useSearch({ strict: false })` | `useSearchParams()` as a plain object |
| `useNavigate()` | returns `navigate({ to, params, search, replace })` |
| `useParams()` | `next/navigation` `useParams()` |
| `useLocation()` | `{ pathname, search, href, hash, state }` |
| `useRouter()` | `{ navigate, push, replace, back, forward, refresh, prefetch }` |
| `useRouterState()` | `{ location, status: "idle" }` |
| `getRouteApi()` | `{ useParams, useSearch }` |

`$param` interpolation is supported: `navigate({ to: "/users/$id", params: { id } })`.

## Per-app migration recipe

### 1. Route map (legacy file route → App Router)

legacy path groups `(main)`, `(user)` do **not** appear in URLs. Convert to real
folders:

| legacy | App Router |
| --- | --- |
| `routes/__root.tsx` | `app/layout.tsx` (+ `app/providers.tsx`) |
| `routes/(main)/route.lazy.tsx` | `app/(main)/layout.tsx` |
| `routes/(main)/index.lazy.tsx` | `app/(main)/page.tsx` |
| `routes/(main)/(user)/route.lazy.tsx` | `app/(main)/(user)/layout.tsx` |
| `routes/(main)/(user)/dashboard.lazy.tsx` | `app/(main)/(user)/dashboard/page.tsx` |
| `routes/auth/index.lazy.tsx` | `app/auth/page.tsx` |
| `routes/bind/$platform.lazy.tsx` | `app/bind/[platform]/page.tsx` |

Every route file follows the same 3-line shape:

```tsx
import Section from "@/sections/...";

export default function Page() {
  return <Section />;
}
```

Layouts return `{children}` instead of `<Outlet />`.

### 2. Files to delete

`index.html`, `vite.config.ts`, `src/main.tsx`, `src/routeTree.gen.ts`,
`src/routes/**`, `dist/`, `components.json`, `netlify.toml`.
Move `public/` assets if needed; the locale tree must stay at
`public/assets/locales/...` to match i18next's `loadPath`.

### 3. `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Providers } from "./providers";
import "@workspace/ui/globals.css"; // Tailwind v4 + HeroUI v3 (pink theme)

export const metadata: Metadata = { title: "..." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. `app/providers.tsx` (`"use client"`)

Order matters — it mirrors the old `main.tsx` nesting:

```tsx
"use client";
// i18n init (guarded, SSR-safe) -> SWRConfig -> LanguageProvider
// -> ThemeProvider -> {children} + <Toast.Provider />
```

The user and admin apps scope their SWR cache to the mounted provider. The payment portal only needs the language and theme providers.

### 5. `"use client"` boundary

Add `"use client"` to any module that uses hooks, event handlers, browser APIs, or
router hooks. Practically: **every `src/sections/**`, `src/layout/**`,
`src/components/**`, store, and `src/utils/**` hook module**. Prefer putting the
directive at the top of the section component rather than sprinkling it.

Root `layout.tsx`/`page.tsx` stay Server Components; they only compose client
components.

### 6. `package.json`

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "biome lint",
    "check": "biome check",
    "typecheck": "tsc --noEmit"
  }
}
```

Remove the Vite build and file-router plugins.
Add: `next`, `@tailwindcss/postcss`, `@types/node`.
Use SWR for interactive Client Component requests.

### 7. `tsconfig.json`

Same as `apps/payment-portal/tsconfig.json`: `"jsx": "preserve"`, `plugins: [{ name: "next" }]`,
include `next-env.d.ts` + `.next/types/**/*.ts`, drop `"types": ["vite/client"]`.

### 8. `next.config.ts`

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"], // required: shared package ships TS source
  reactStrictMode: true,
};
```

Preserve the old dev proxy with `async rewrites()` if `vite.config.ts` defined one.

## Verification (required, paste output)

```bash
cd apps/<app>
npx next build      # must reach "✓ Generating static pages", no prerender errors
npx tsc --noEmit    # must be clean
```

Build must show **no** `ReferenceError: window is not defined` and **no**
`NO_I18NEXT_INSTANCE` warning.

## HeroUI-native policy (Phase 4)

The goal is **HeroUI-native first**: preview `@heroui/react` directly in app code.
Extend a `@workspace/ui` wrapper only when HeroUI genuinely cannot satisfy the
existing API, and say why in a comment. Delete old UI markup rather than keeping
it "just in case".

### The `asChild` boundary

HeroUI v3 has **no `asChild`**. It uses a `render` prop instead
(`DOMRenderProps` in `@heroui/react/dist/utils/dom.d.ts`):

```tsx
<Button render={(props) => <Link {...props} href="/payment" />}>Pay</Button>
```

This repo has ~105 `asChild` usages, which is why some wrappers must stay:

| Element | `asChild` uses | Guidance |
| --- | --- | --- |
| `SheetTrigger` | 42 | keep wrapper (converting needs `isOpen`/`onOpenChange` state) |
| `Button` | 18 | convert to HeroUI `Button` + `render` |
| `DialogTrigger` | 17 | keep wrapper |
| `DropdownMenuItem` | 10 | keep wrapper |
| `DropdownMenuTrigger` | 7 | keep wrapper |
| `HoverCardTrigger` | 5 | keep wrapper |
| `AlertDialogTrigger` | 3 | keep wrapper |
| `BreadcrumbLink`, `PopoverTrigger`, `SidebarMenuButton` | 1 each | case-by-case |

### Wrapper adoption levels

- **(A) native** — render the real `@heroui/react` component inside the wrapper and
  re-export it with the same prop names. Used for `badge`, `input`, `spinner`,
  `skeleton`, `separator`, `progress`, `alert`, `avatar`.
- **(B) variant classes** — keep the existing markup and apply HeroUI's
  `@heroui/styles` variant functions / BEM classes. Used where level (A) would
  force a public-API change.

**Known limitation of level (B):** `@heroui/styles` ships component rules in the
`components` layer, while Tailwind emits utilities in the higher `utilities`
layer. Where a BEM rule and an existing utility set the same property, the
utility wins, so level (B) is additive rather than a full visual takeover.
Making HeroUI fully dominant requires deleting those legacy utility classes — a
separate, visually-verifiable change.

## Hydration: the i18n rule (read this before touching i18n)

React hydration compares the server HTML against the client's **first** render.
Three things broke that here, all fixed centrally. The first two are the original
hydration mismatch; the third is what broke language detection when fixing it.

1. **The language detector ran during the hydration render.** The server had no
   `window`, so it rendered `fallbackLng` (English); the client immediately
   switched to the stored language → text mismatch. `initializeI18n` now always
   pins `lng` to the fallback language, and `LanguageProvider` calls
   `applyDetectedLanguage()` from an **effect** (after mount), which is a normal
   re-render instead of a mismatch.

2. **SSR had no translation resources at all.** `i18next-http-backend` is
   browser-only, so during SSR every `t("key", "Default Text")` fell back to its
   inline `defaultValue`, while the client hydrated the real string
   (`"Document Management"` vs `"Documents"`). Fixed by bundling the fallback
   language synchronously:

   ```bash
   node scripts/generate-locale-resources.mjs user en-US
   node scripts/generate-locale-resources.mjs admin en-US
   ```

   This writes `src/config/locale-resources.ts` (generated — do not hand-edit)
   exporting `fallbackResources`, passed to `initializeI18n({ resources })`.
   `partialBundledLanguages: true` lets the bundled fallback coexist with the
   backend that loads other languages on demand.

3. **Pinning the language destroyed the saved preference.** The detector's
   `caches: ["localStorage"]` persists whatever language is active — and because
   init now pins `lng`, that wrote the pinned language over the user's choice on
   every load (a saved `zh-CN` silently reset to `en-US`, so detection appeared
   "broken"). Fixed two ways:
   - `detection.caches` is now **empty**; persistence is explicit via an
     `i18n.on("languageChanged", ...)` listener.
   - That listener **cannot** guard on `i18n.isInitialized`: i18next sets it
     `true` *before* emitting `languageChanged` during init, so the guard never
     engages. It uses a `settled` flag set on the `initialized` event instead.

### Rules

- **Never let a non-deterministic value participate in the first render**
  (detected language, `Date.now()`, `Math.random()`). Apply it in an effect.
- **`initializeI18n` config precedence:** the caller's `...rest` must stay
  **after** the hardcoded defaults. An earlier revision spread it first, so
  defaults silently clobbered callers' `ns` / `defaultNS` / `react.useSuspense`
  (payment-portal's `ns: ["app", "components"]` collapsed to `[]`).
- **Regenerate `locale-resources.ts`** whenever a namespace is added, or that
  namespace falls back to inline defaults during SSR and mismatches again.

`apps/payment-portal` now server-renders its shell as well, so it relies on the
same guarantee: its providers bundle `fallbackResources` (generated into
`src/config/locale-resources.ts`) so the SSR render and the client's first render
produce identical text.

Regression coverage: `apps/user/src/lib/i18n-language.test.ts` (detection,
persistence, config precedence). It builds its own i18next instance via
`vi.doMock("i18next", ...)` — `vi.resetModules()` alone is not enough, because
other test files import `react-i18next` and initialise the shared singleton first,
which would make these tests silently share state.

## Verification commands

```bash
# from frontend/
bun x tsc --noEmit -p packages/ui
bun x tsc --noEmit -p apps/user
bun x tsc --noEmit -p apps/admin
bun x tsc --noEmit -p apps/payment-portal

# per app
cd apps/<app> && npx next build
cd apps/<app> && bun x vitest run
```

**Use `bun x tsc`, never `npx tsc`** — `npx` resolves a squatted `tsc@2.0.4`
package that is not the TypeScript compiler and reports nothing useful.

## Shipping checklist

- [ ] `bun x tsc --noEmit` clean for all four projects
- [ ] `npx next build` exits 0 for all three apps
- [ ] build log has zero `window is not defined`, `ReferenceError`,
      `NO_I18NEXT_INSTANCE`, `Hydration failed`
- [ ] pink `#f1479c` (light) / `#fb79c8` (dark) present in each built CSS bundle
- [ ] `bun x vitest run` green per app

## Known traps discovered during the pilot

- **Deleting `src/types/api.d.ts`** breaks the global `API.*` namespace →
  `TS2503: Cannot find namespace 'API'`. Keep it.
- **`ThemeProvider`/`LanguageProvider` render-time browser reads** crash
  prerendering. Already fixed in `packages/ui` — do not reintroduce in app code.
- **`dynamic(..., { ssr: false })`** is now reserved for genuinely client-only
  UI, not whole pages. The only remaining users are the route-progress widgets
  (`apps/admin/app/navigation-progress.tsx`, `apps/user/app/providers.tsx`): they
  track navigation through `useSearchParams` and would otherwise collapse the
  prerendered shell to the root Suspense fallback, and they render no page body,
  so client-only is correct. Everything that is a page body is server-rendered:
  - Pages with **no** render-time browser read and **no** search-param read are
    plain SSR (static). Two render-time reads had to move into effects to unblock
    this: `formatDate` in `apps/admin/src/utils/common.ts` guards its
    `localStorage` timezone read, and `apps/admin/src/sections/auth/email/register-form.tsx`
    applies the saved invite code after mount instead of in the form defaults.
  - Pages whose body reads the query string (`apps/admin` list/log pages —
    `user`, `order`, `withdrawal`, `log/*`) are **dynamic server components**: the
    `page.tsx` is a Server Component that `await`s `searchParams`, which opts the
    route into request-time rendering. On a dynamic route the client section's
    `useSearchParams`/`useTableSearchParams` run on the server without the static
    `useSearchParams` CSR bailout, so the table body ends up in the SSR HTML
    instead of behind `ssr: false`. The server also passes a deterministic
    `today` so the first render is not seeded by a non-deterministic `new Date()`.
  - `apps/payment-portal` reads its auth cookie in the Server Component
    (`app/page.tsx` via `next/headers`) and passes `initialAuthenticated` down, so
    the portal SSRs the correct screen with no login flash and no hydration
    mismatch.
- Sections that were purely `Outlet` wrappers become real `layout.tsx` files.
- `useSearch({ from: "/(main)/purchasing/" })` → the shim's `useSearch()`; drop
  `from`, read the key you need (`const { id } = useSearch() as { id: string }`).
- **Deleting `vite.config.ts` silently breaks the test suite** — it also carried
  the `@/` and `@workspace/ui` aliases. Both apps now have a `vitest.config.ts`
  that restores those aliases (Vite's resolver does not apply the package
  `exports` array fallback, so the aliases are explicit).
- **`packages/ui` `exports` map must offer both extensions.** Patterns declared
  as a single extension silently make mismatched files unresolvable for Next and
  tsc alike. Keep the `["./*.ts", "./*.tsx"]` fallbacks; verify with
  `bun run --cwd packages/ui test src/exports.test.ts` (the former standalone
  export-check script is now a Vitest regression test).
- **The HeroUI MCP `list_components` enum is incomplete** — it exposes ~30 of the
  ~86 components the installed package ships (no Card, Tabs, Switch, TextField,
  Separator…). For those, read
  `node_modules/@heroui/react/dist/components/<name>/index.d.ts`, which is the
  real API surface.
- **HeroUI `Separator` needs an explicit `elementType`.** React Aria renders
  through `DOMElement`, which asserts the produced element matches
  (`Expected <hr>, got <div>`); HeroUI's own `SeparatorRoot` defaults
  `elementType` to `"div"` while still passing a `render` function, tripping the
  assertion. Pass `elementType="hr"` for horizontal separators.
- **jsdom lacks `Element.getAnimations`**, which React Aria's
  `SharedElementTransition` (Tabs indicator, Accordion/Disclosure panels) calls.
  Without the stub the call throws inside `act()` and the interaction silently
  never completes. See `apps/*/vitest.setup.ts` and `packages/ui/vitest.setup.ts`.
- **jsdom also lacks `CSS.escape`** (there is no `CSS` object at all). React Aria's
  `getMetaValue` builds a `meta[name="…"]` selector with it, called from `Modal`'s
  layout effect to read the CSP nonce — so the moment any HeroUI `Modal` opened,
  it threw `TypeError: Cannot read properties of undefined (reading 'escape')`.
  Stubbed alongside `getAnimations` in all three setup files. Both throw from a
  *layout* effect, so the symptom is a confusing aggregate error from inside
  `act()`, not a readable assertion.
- **Test files are entry points, not dead code.** App import reachability alone
  cannot determine whether a test or its helpers are unused. The former heuristic
  dead-code scripts were removed after false positives; keep export validation
  in `packages/ui/src/exports.test.ts` and behavior checks in Vitest/E2E suites.
- **`tailwind-merge` does not treat `truncate` as conflicting with
  `whitespace-normal`.** They are different merge groups, and in the emitted CSS
  `.whitespace-normal` comes *after* `.truncate` (both in `@layer utilities`), so
  a call site cannot defeat a wrapper's `whitespace-normal` by passing `truncate`
  alone — it needs `whitespace-nowrap truncate`. Measured, not assumed; see the
  comment in `components/button.tsx`.
- **`tailwind-variants` `null` vs `undefined` for opting out of a default
  variant.** `modalVariants()` applies `defaultVariants.scroll = "inside"`, whose
  modifier clips a tall dialog (`max-h-full min-h-0 overflow-clip`). Only an
  explicit `null` clears it: `tailwind-variants` only overrides a default when
  `props[key] !== void 0`, so `{ scroll: undefined }` silently keeps the default.
  `VariantProps` omits `null` from the type, hence the single documented cast in
  `components/dialog.tsx`. Guarded by `dialog.test.tsx`.
- **HeroUI `Modal.Trigger` renders `Pressable` → `div[role=button]`, and its prop
  type is the intrinsic attributes of that `div`, which carry no `ref` in React
  19.** The pre-migration wrapper spread `ComponentProps<typeof RadixDialog.Trigger>`,
  and Radix's `Trigger` is a `forwardRef` component, so `ref` *was* public API.
  The port silently dropped it. Re-added in `DialogTrigger`; guarded by
  `dialog-trigger-ref.test.tsx`. Check every wrapper whose pre-migration type came
  from a Radix primitive for the same loss.
- **Review the real import graph before deleting modules.** Include relative
  imports, package self-references, dynamic imports, and test entry points.
  The historical audit missed the live
  `markdown -> rich-markdown-impl -> markdown-elements` chain; substring matches
  such as `data-slot="slider"` / `captcha.sliderRequired` are not module references.
  There is no standalone reference gate anymore.

## Post-migration logic parity (hash routing → App Router)

`main` ran legacy **hash** history (`createHashHistory()` in each app's
`src/main.tsx`), so a `#/...` fragment *was* a route and code freely wrote
`window.location.hash = "/x"`. Under the App Router a fragment is not a route.
Everything that still assumed hash routing was a silent breakage, because the URL
changed while the route never mounted:

| Site | Was | Now |
| --- | --- | --- |
| `utils/oauth/telegram-popup.ts` | `location.hash = "/oauth/telegram?…"` (assigning a fragment never fires a route change) | `location.assign("/oauth/telegram?…")` |
| `public/oauth/<p>/index.html`, `public/bind/<p>/index.html` | `location.replace("/#/oauth/<p>")`, `<meta refresh url=/#/auth>` | real pathname routes (10 files; `scripts/fix-oauth-bridge-hash.mjs`) |
| `utils/common.ts` `Logout()` | `location.href = "/#/auth"`, plus a hash branch that mis-detected the page | `location.href = "/auth"`, pathname only |
| referral share links (`affiliate/index.tsx`, `sidebar-right.tsx`) | `${origin}/#/auth?invite=…` | `${origin}/auth?invite=…` |
| payment `return_url` (`purchasing/create-order.ts`, `content.tsx`) | `${origin}${pathname}#/payment` | `${origin}/payment` |

`getRedirectUrl()`/`resolveInviteCode()` still *accept* the hash form, because
invitation links already in the wild and the OAuth provider round trip can carry
one; only link *generation* was moved to pathnames.

Also restored, having been dropped by the port rather than changed deliberately:

- **Dynamic site metadata.** `main`'s `routes/__root.tsx` set `document.title`
  from `site.site_name`, plus description/keywords/canonical/favicon. The port
  kept only each `app/layout.tsx`'s *static* `metadata`, so operator branding
  stopped reaching the document head. Re-implemented SSR-safely as
  `packages/ui/lib/site-metadata.tsx` (`useSiteMetadata`, effect-only) and mounted
  per app via `app/site-metadata.tsx`.
- **`window.logout`.** `main.tsx` assigned it at entry; `packages/ui/lib/request.ts`
  calls it on auth-expiry codes (40002–40005). The port dropped the assignment in
  admin, so an expired session threw `TypeError: window.logout is not a function`
  instead of clearing the cookie. Now installed in `app/bootstrap.tsx`.
- **`NavigationProgress`** (user app) — `main`'s root route rendered it; the port
  dropped it (admin kept its equivalent). Restored in `app/providers.tsx` with
  `dynamic(..., { ssr: false })`, because it reads `useSearchParams` and would
  otherwise resolve the root Suspense boundary and replace the prerendered shell.
- **`/version.lock`.** The Vite `versionLockPlugin` emitted `dist/version.lock`
  and `docs/guide/separation/frontend.md` documents `curl /version.lock`. Next has
  no `closeBundle`, so `scripts/write-version-lock.mjs` is now the first step of
  each app's `build` script (the file is generated, hence git-ignored).
- **Dev proxy (`next.config.ts`).** Two silent behaviour changes vs the Vite proxy:
  the API prefix must be **stripped** before forwarding (Vite did
  `path.slice(prefix.length)`; the port passed it through, so a `/api` prefix
  404'd), and the base URL must fall back on an **empty** value (`||`, not `??` —
  `.env.example` ships it empty). `v1`/`v2` are now two rewrite entries because
  Next's `source` has no regex character class for the original `v[12]`.

### Logic-parity guards added

- `packages/ui/src/lib/router-compat.test.tsx` — the shim's documented contract
  (`$param` interpolation, empty-value dropping, `useLocation`/`useRouterState`
  shapes).
- `packages/ui/src/components/as-child.test.tsx` — `asChild` projects classes,
  merges handlers (child first, slot last) and forwards `ref` to the child.
- `packages/ui/src/components/dialog-trigger-ref.test.tsx` — the `DialogTrigger`
  ref contract above.
- `apps/user/src/utils/redirect-parity.test.ts` — `getRedirectUrl`,
  `setRedirectUrl` (open-redirect rejection, stored-redirect consumption) and
  `Logout`.

**Note on the test environment:** these app suites run under `node` by default.
A DOM-dependent test needs a `/** @vitest-environment jsdom */` pragma, and this
repo's setups do **not** register testing-library's automatic cleanup, so each
such file must call `afterEach(cleanup)` itself.
