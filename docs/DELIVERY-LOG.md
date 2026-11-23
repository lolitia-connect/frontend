{
  "ts": "2026-11-18T04:00:00+08:00",
  "kind": "delivery",
  "title": "frontend: Vite+legacy -> Next.js App Router + HeroUI v3, then 12 UI/i18n fixes",
  "task_summary": "Migrated frontend/ (apps/user, apps/admin, apps/payment-portal) from Vite + legacy router to Next.js 16 App Router + HeroUI v3 preserving the pink theme. Then delivered 12 follow-up fixes across tables, dropdowns, sidebar, headers, breadcrumb, dashboard cards, legacy-token control, app transitions, i18n language/theme behaviour, button overflow, and the auth page.",
  "records": [
    {
      "batch": 1,
      "items": "8 fixes: table width + address tooltips; legacy style audit; sidebar HeroUI; header HeroUI; dashboard card overflow; breadcrumb; dropdown overflow; transitions",
      "note": "sidebar (task-9) failed on first dispatch and was re-dispatched successfully (task-9 retry)."
    },
    {
      "batch": 2,
      "items": "4 fixes: language follows browser + persists + follow-system option; button overflow under long translations; auth page duplicate captcha + stray invite hint + backend wiring; theme persistence + switch UI parity"
    }
  ],
  "visible_pua_markers": [
    "[PUA-DIAGNOSIS]",
    "[PUA生效 🔥]",
    "[PUA-CHECKPOINT]",
    "[方法论切换 🔄]"
  ],
  "flavor": "alibaba",
  "subagent_sessions": 18,
  "evidence": {
    "typecheck": "packages/ui, apps/user, apps/admin, apps/payment-portal all exit 0",
    "build": "user 20/20, admin 37/37, payment-portal 3/3 pages; exit 0",
    "forbidden_strings": "window is not defined=0, ReferenceError=0, NO_I18NEXT_INSTANCE=0, Hydration failed=0",
    "theme": "pink #f1479c light / #fb79c8 dark present in all three built CSS bundles",
    "tests": "apps/user 19 files/107 tests, apps/admin 9/65, packages/ui 4/4 — all passing"
  },
  "root_causes_found": [
    "i18n loadPath was root-relative ('assets/...'), so every namespace 404'd on nested routes — detection set the language but the UI kept the bundled English fallback. Fixed to '/assets/...'",
    "i18n persistence was completely dead: listeners were registered AFTER .init(), and bundled resources make init synchronous, so 'initialized' had already fired and initSettled stayed false forever",
    "detection used to persist its own result, silently converting 'follow browser' into an explicit pin, so later browser-language changes did nothing",
    "theme had ZERO localStorage reads/writes — a chosen theme was lost on reload",
    "sidebar shadow outline used hsl(oklch(...)), which is invalid CSS, so that border never rendered",
    "tables capped EVERY column at 320px and pinned the container with a self-measured pixel width",
    "buttons overflowed because .button is fit-content + nowrap + inline-flex with min-width:auto as a flex item; overflow-wrap:break-word does NOT lower min-content, only 'anywhere' does",
    "OAuth login was gated behind the REGISTRATION-only forced_invite policy, disabling OAuth login for all existing users",
    "oauth-methods read a phantom field 'enable_register_verify' that a migration had deleted",
    "string_fixes: charts referenced var(--muted-foreground), which is defined nowhere, so a chart series rendered colourless"
  ],
  "failures_and_lessons": [
    "find-dead-ui / check-dead-ui-refs had false positives; the live markdown chain was nearly deleted (caught by a teammate)",
    "ui-sidebar v1 left sidebar.tsx BROKEN with duplicate VariantProps; lead reverted to keep the tree green, then re-dispatched with the failure lesson baked in",
    "globals.css comment contained '**/*.css', whose '*/' closed the comment early -> CssSyntaxError 'Unknown word HeroUI', breaking admin build (self-caught and fixed by its owner)",
    "i18n-language tests shared the i18next singleton across files; fixed with vi.doMock",
    "lead misattributed dialog.tsx and purchasing/** changes to i18n-lang; the agent corrected it with timestamps and grep evidence — its attribution was right",
    "tsc can pass while next build fails (different tsconfig strictness); always verify with next build"
  ],
  "telemetry": "none — no network reporting, no global dirs, no memory writes outside the repo",
  "scoring": "not recorded (per user instruction)"
}
