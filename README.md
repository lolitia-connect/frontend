<a name="readme-top"></a>

<div align="center">

<img width="160" src="https://raw.githubusercontent.com/perfect-panel/ppanel-assets/refs/heads/main/logo.svg">

<h1>PPanel web</h1>

This is a PPanel web powered by PPanel

English
·
[Chinese](./README.zh-CN.md)
·
[Changelog](../../CHANGELOG.md)
·
[Report Bug][issues-link]
·
[Request Feature][issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![][split]

</div>

> **Article 1.**
> All human beings are born free and equal in dignity and rights.
> They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.
>
> **Article 12.**
> No one shall be subjected to arbitrary interference with his privacy, family, home or correspondence, nor to attacks upon his honour and reputation.
> Everyone has the right to the protection of the law against such interference or attacks.
>
> **Article 19.**
> Everyone has the right to freedom of opinion and expression; this right includes freedom to hold opinions without interference and to seek, receive and impart information and ideas through any media and regardless of frontiers.
>
> _Source: [United Nations – Universal Declaration of Human Rights (UN.org)](https://www.un.org/sites/un2.un.org/files/2021/03/udhr.pdf)_

## 📦 Application List

| 📦 Application                                                                                                                                                                                                                                                                                                                                | 🖼️ Preview                                                     |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| [**PPanel User Web**][ppanel-user-web-github]<br/>Developed with modern frontend technologies (Next.js, TypeScript, TailwindCSS), providing basic user features with support for multiple languages and themes.<br/>[![One-Click Deploy](https://img.shields.io/badge/Deploy%20with-Vercel-blue?style=for-the-badge)][ppanel-user-web-deploy] | [![Preview][ppanel-user-web-cover]][ppanel-user-web-github]    |
| [**PPanel Admin Web**][ppanel-admin-web-github]<br/>Developed with modern frontend technologies, this admin web provides basic data management features with support for multiple languages and themes.<br/>[![One-Click Deploy](https://img.shields.io/badge/Deploy%20with-Vercel-blue?style=for-the-badge)][ppanel-admin-web-deploy]        | [![Preview][ppanel-admin-web-cover]][ppanel-admin-web-preview] |

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][codespaces-shield]][codespaces-link]

You can use Gitpod for online development:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-link]

or clone it for local development:

```bash
git clone https://github.com/perfect-panel/frontend.git
cd frontend

# Install dependencies
bun install
```

## 🔤 Typography

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
[SIL Open Font License 1.1](./packages/ui/src/styles/fonts/swei-gothic/OFL.txt)
when redistributing them.

## 🧪 Testing

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
- `scripts/`: only maintained generators: backend contract/OpenAPI generation
  (`backend-contract.mjs` and its Go extractor), locale resources, and version locks.
  Repeatable checks belong in Vitest or Playwright. One-off migration codemods
  and heuristic dead-code/progress reporters have been removed; do not add new
  standalone check runners here. CI triage utilities live in `.github/automation`.
  Each app's `next.config.ts` owns its API rewrites; `tests/functions` covers the
  separate Cloudflare Pages proxy. The retired Vite proxy and its tests are removed.

Retire tests when their production entry point is removed. For example, the old
admin sponsor-card test was removed after the dashboard stopped importing that
component. Compatibility names alone do not make a test obsolete: the router
adapter uses `next/navigation`, the UI adapters render HeroUI, and both still have
production callers. Keep their behavior tests while those callers remain.

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

The [payment portal](apps/payment-portal) uses HeroUI v3 components directly,
with an [app-local stylesheet](apps/payment-portal/app/globals.css) importing
Tailwind v4, HeroUI, and the [shared semantic theme](packages/ui/src/styles/theme.css).
All three applications use the same HeroUI accent, surface, field, radius, and
light/dark tokens. The [shared auth shell](packages/ui/src/composed/auth-shell.tsx)
also keeps their login panel width, responsive spacing, and mobile presentation
in sync. The portal does not use compatibility UI wrappers or import the shared
component overrides. Language/theme persistence and backend services remain
shared; API error notifications are rendered by HeroUI rather than the shared
Sonner toaster.

`NEXT_PUBLIC_PAYMENT_PORTAL_AMOUNTS` preserves the original `main` configuration
rule: values below `10000` are major currency units (`10` means $10 with USD),
while legacy values at or above `10000` are cents (`10000` means $100).
The UI uses major units after parsing; backend amounts are converted exactly once.
`NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT` sets the custom-input floor
(default 1; smaller configured values are clamped to 1). Custom input is numeric,
steps by 0.01, allows clearing, and immediately raises a smaller non-empty value
to that minimum. Preset amounts are not subject to the custom-input minimum.

The confirmation dialog always displays the backend's amount, fee, and total;
checkout is requested only by **Pay Now**. Cancel dismisses confirmation without
closing the already-created backend order. As on `main`, selections remain
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

## 🤝 Contributing

Contributions of all types are more than welcome,
if you're interested in contributing code, feel free to check out our GitHub
[Issues][github-issues-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]

[![][contributors-contrib]][contributors-url]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

## 📝 License

Copyright © 2024 [PPanel][profile-link]. <br />
This project is [GNU](../../LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[codespaces-link]: https://codespaces.new/perfect-panel/ppanel-web
[codespaces-shield]: https://github.com/codespaces/badge.svg
[contributors-contrib]: https://contrib.rocks/image?repo=perfect-panel/ppanel-web
[contributors-url]: https://github.com/perfect-panel/frontend/graphs/contributors
[github-action-release-link]: https://github.com/perfect-panel/frontend/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/perfect-panel/ppanel-web/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/perfect-panel/frontend/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/perfect-panel/ppanel-web/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/perfect-panel/frontend/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/perfect-panel/ppanel-web?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/perfect-panel/frontend/network/members
[github-forks-shield]: https://img.shields.io/github/forks/perfect-panel/ppanel-web?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/perfect-panel/frontend/issues
[github-issues-shield]: https://img.shields.io/github/issues/perfect-panel/ppanel-web?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/perfect-panel/frontend/blob/master/LICENSE
[github-license-shield]: https://img.shields.io/github/license/perfect-panel/ppanel-web?color=white&labelColor=black&style=flat-square
[github-release-link]: https://github.com/perfect-panel/frontend/releases
[github-release-shield]: https://img.shields.io/github/v/release/perfect-panel/ppanel-web?style=flat-square&sort=semver&logo=github
[github-releasedate-link]: https://github.com/perfect-panel/frontend/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/perfect-panel/ppanel-web?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/perfect-panel/frontend/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/perfect-panel/ppanel-web?color=ffcb47&labelColor=black&style=flat-square
[gitpod-link]: https://gitpod.io/#https://github.com/perfect-panel/frontend
[issues-link]: https://github.com/perfect-panel/frontend/issues/new/choose
[pr-welcome-link]: https://github.com/perfect-panel/frontend/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/perfect-panel
[split]: https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png
[ppanel-user-web-github]: https://github.com/perfect-panel/frontend/tree/main/apps/user
[ppanel-user-web-cover]: https://urlscan.io/liveshot/?width=1920&height=1080&url=https://user.ppanel.dev
[ppanel-user-web-preview]: https://user.ppanel.dev
[ppanel-user-web-deploy]: https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool%2C%20designed%20to%20be%20your%20ideal%20choice%20for%20learning%20and%20practical%20use&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fuser.ppanel.dev&demo-title=PPanel%20User%20Web&demo-url=https%3A%2F%2Fuser.ppanel.dev%2F&from=.&project-name=ppanel-user-web&repository-name=ppanel-web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Fppanel-web&root-directory=apps%2Fuser&skippable-integrations=1
[ppanel-admin-web-github]: https://github.com/perfect-panel/frontend/tree/main/apps/admin
[ppanel-admin-web-cover]: https://urlscan.io/liveshot/?width=1920&height=1080&url=https://admin.ppanel.dev
[ppanel-admin-web-preview]: https://admin.ppanel.dev
[ppanel-admin-web-deploy]: https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool%2C%20designed%20to%20be%20your%20ideal%20choice%20for%20learning%20and%20practical%20use&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fadmin.ppanel.dev&demo-title=PPanel%20Admin%20Web&demo-url=https%3A%2F%2Fadmin.ppanel.dev%2F&from=.&project-name=ppanel-admin-web&repository-name=ppanel-web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Fppanel-web&root-directory=apps%2Fadmin&skippable-integrations=1
