/**
 * @vitest-environment jsdom
 *
 * Language detection reads `window.navigator` and `localStorage`, so this file
 * needs a DOM. The directive is per-file because the rest of the suite runs in
 * the faster `node` environment.
 *
 * Regression coverage for two bugs that shipped here:
 *  1. `initializeI18n` spread the caller's config FIRST, so hardcoded defaults
 *     silently clobbered the caller's `ns` / `defaultNS` / `react.useSuspense`.
 *  2. Browser-language detection must NOT run during init (that caused a
 *     hydration mismatch) but must still happen right after mount.
 *
 * i18next init is asynchronous and `initializeI18n` is guarded by a module-level
 * flag, so each test reloads the module and awaits readiness.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supportedLngs } from "@/config/i18n";
import { fallbackNamespaces } from "@/config/locale-resources";

type I18nModule = typeof import("@workspace/ui/lib/i18n");
type ReadTranslation = (
  language: string,
  namespace: string,
  callback: (err: unknown, data: unknown) => void
) => void;

function setNavigatorLanguage(
  language: string,
  languages: string[] = [language]
) {
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    get: () => language,
  });
  Object.defineProperty(window.navigator, "languages", {
    configurable: true,
    get: () => languages,
  });
}

/**
 * Build a fully isolated i18next instance and inject it into the module registry.
 *
 * `initializeI18n` guards on a module-level `initialized` flag and mutates the
 * shared i18next singleton. Other test files in this package import
 * `react-i18next`, which initialises that singleton first — so `vi.resetModules()`
 * alone is NOT enough: the reloaded module would see an already-initialised
 * i18next and immediately return it, making every "fresh" test share state.
 *
 * Stubbing `i18next` itself gives each test its own instance, so assertions do
 * not depend on other files in the run.
 */
async function freshI18n(
  config: Parameters<I18nModule["initializeI18n"]>[0] = {
    fallbackLng: "en-US",
  },
  read: ReadTranslation = (_language, _namespace, callback) =>
    callback(null, false)
) {
  vi.resetModules();

  const { default: createI18next } = await vi.importActual<{
    default: typeof import("i18next")["default"];
  }>("i18next");

  // A brand-new instance per test, mimicking a cold page load.
  const instance = createI18next.createInstance();

  vi.doMock("i18next", () => ({
    default: instance,
  }));
  // Minimal but complete plugins: i18next calls `backend.read(...)` and
  // `detector.detect()/cacheUserLanguage()`, so a bare `{ type }` stub throws
  // "Cannot read properties of undefined (reading 'bind')" as an unhandled error.
  vi.doMock("i18next-http-backend", () => ({
    default: {
      type: "backend",
      init: () => undefined,
      read,
      save: () => undefined,
    },
  }));
  vi.doMock("i18next-browser-languagedetector", () => ({
    default: {
      type: "languageDetector",
      init: () => undefined,
      detect: () => undefined,
      cacheUserLanguage: () => undefined,
    },
  }));

  const mod = (await import("@workspace/ui/lib/i18n")) as I18nModule;
  const i18n = mod.initializeI18n(config);
  return { i18n, mod };
}

/**
 * Wait until i18next reports itself initialised.
 *
 * The suite runs without a locale HTTP server, so the backend request never
 * settles and `resolvedLanguage` can stay undefined. Tests therefore assert on
 * `options.lng` / `i18n.language` (set synchronously) and on
 * `detectBrowserLanguage()` (pure), which are the values that actually decide
 * which language the UI renders.
 */
async function waitForInit(i18n: { isInitialized: boolean }, timeoutMs = 2000) {
  const start = Date.now();
  while (!i18n.isInitialized && Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 25));
  }
  return i18n.isInitialized;
}

/** Let queued microtasks (the fire-and-forget changeLanguage) settle. */
async function flush() {
  await new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.doUnmock("i18next");
  vi.doUnmock("i18next-http-backend");
  vi.doUnmock("i18next-browser-languagedetector");
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("detectBrowserLanguage", () => {
  it("detects a supported browser language", async () => {
    const { mod } = await freshI18n();
    setNavigatorLanguage("zh-CN");

    expect(mod.detectBrowserLanguage()).toBe("zh-CN");
  });

  it("maps a bare language onto a supported regional variant", async () => {
    const { mod } = await freshI18n();
    setNavigatorLanguage("zh");

    expect(mod.detectBrowserLanguage()).toMatch(/^zh-/);
  });

  it("keeps Traditional Chinese script and region matching consistent with SSR", async () => {
    const { mod } = await freshI18n();
    setNavigatorLanguage("zh-Hant");
    expect(mod.detectBrowserLanguage()).toBe("zh-TW");
    setNavigatorLanguage("zh-Hant-HK");
    expect(mod.detectBrowserLanguage()).toBe("zh-HK");
  });

  it("prefers localStorage over navigator", async () => {
    const { mod } = await freshI18n();
    window.localStorage.setItem("language", "ja-JP");
    setNavigatorLanguage("zh-CN");

    expect(mod.detectBrowserLanguage()).toBe("ja-JP");
  });

  it("ignores an unsupported stored language", async () => {
    const { mod } = await freshI18n();
    window.localStorage.setItem("language", "de-DE");
    setNavigatorLanguage("ja-JP");

    expect(mod.detectBrowserLanguage()).toBe("ja-JP");
  });

  it("returns undefined when nothing supported matches", async () => {
    const { mod } = await freshI18n();
    setNavigatorLanguage("de-DE");

    expect(mod.detectBrowserLanguage()).toBeUndefined();
  });

  it("honours a non-English fallback when detecting", async () => {
    const { mod } = await freshI18n({ fallbackLng: "zh-CN" });
    setNavigatorLanguage("de-DE");
    window.localStorage.setItem("language", "de-DE");

    // Nothing supported matches, so detection yields nothing and the pinned
    // fallback (zh-CN) stays in effect.
    expect(mod.detectBrowserLanguage()).toBeUndefined();
  });
});

describe("applyDetectedLanguage", () => {
  it("returns the detected language", async () => {
    const { i18n, mod } = await freshI18n();
    setNavigatorLanguage("zh-CN");

    // The pinned init language is en-US (see the init tests below).
    expect(i18n.options.lng).toBe("en-US");
    expect(mod.applyDetectedLanguage()).toBe("zh-CN");
  });

  it("is a no-op when the detected language matches the pinned one", async () => {
    const { mod } = await freshI18n();
    setNavigatorLanguage("en-US");

    expect(mod.applyDetectedLanguage()).toBeUndefined();
  });

  it("is a no-op when nothing supported is detected", async () => {
    const { i18n, mod } = await freshI18n();
    setNavigatorLanguage("de-DE");

    expect(mod.applyDetectedLanguage()).toBeUndefined();
    expect(i18n.options.lng).toBe("en-US");
  });
});

describe("language persistence", () => {
  it("does NOT overwrite a stored preference during init", async () => {
    window.localStorage.setItem("language", "ja-JP");
    setNavigatorLanguage("zh-CN");

    await freshI18n();

    // Regression: the detector's `caches: ["localStorage"]` used to persist the
    // PINNED init language over the saved choice on every load.
    expect(window.localStorage.getItem("language")).toBe("ja-JP");
  });

  it("honours the stored preference when detection runs", async () => {
    window.localStorage.setItem("language", "ja-JP");
    setNavigatorLanguage("zh-CN");

    const { mod } = await freshI18n();

    expect(mod.detectBrowserLanguage()).toBe("ja-JP");
  });

  it("persists an explicit language change", async () => {
    const { i18n } = await freshI18n();
    await waitForInit(i18n);

    i18n.emit("languageChanged", "zh-CN");

    expect(window.localStorage.getItem("language")).toBe("zh-CN");
  });

  // Regression: the persistence listeners used to be attached AFTER `init()`
  // returned. When the caller bundles `resources` (all three apps pass
  // `fallbackResources` so the server HTML and the hydration render match),
  // i18next runs `load()` synchronously inside `init()`, so `initialized` had
  // already fired and `initSettled` stayed `false` — every write was rejected and
  // a chosen language was never saved. This locks in the ordered registration.
  it("persists even when init settles synchronously (bundled resources)", async () => {
    const { i18n } = await freshI18n({
      fallbackLng: "en-US",
      resources: { "en-US": { components: { language: "Language" } } },
    });

    // Synchronous init: `initialized` has already fired at this point.
    expect(i18n.isInitialized).toBe(true);

    i18n.emit("languageChanged", "zh-CN");

    expect(window.localStorage.getItem("language")).toBe("zh-CN");
  });

  it("clears the stored preference", async () => {
    const { mod } = await freshI18n();
    window.localStorage.setItem("language", "ja-JP");

    mod.clearStoredLanguage();

    expect(window.localStorage.getItem("language")).toBeNull();
    expect(mod.getStoredLanguage()).toBeUndefined();
  });

  it("treats an empty stored value as no preference", async () => {
    const { mod } = await freshI18n();
    window.localStorage.setItem("language", "");

    expect(mod.getStoredLanguage()).toBeUndefined();
  });
});

describe("default detection (nothing stored)", () => {
  it("applies the browser language and does NOT create a stored preference", async () => {
    const { i18n, mod } = await freshI18n();
    setNavigatorLanguage("zh-CN");

    const applied = mod.applyDetectedLanguage();
    await flush();

    expect(applied).toBe("zh-CN");
    expect(i18n.language).toBe("zh-CN");
    // Regression: detection used to persist its result, which silently converted
    // "follow the browser" into an explicit choice — after that, changing the
    // browser's language had no effect on the next load.
    expect(window.localStorage.getItem("language")).toBeNull();
  });

  it("ignores cimode, which i18next appends to supportedLngs", async () => {
    const { i18n, mod } = await freshI18n();
    // i18next mutates `supportedLngs` by appending "cimode" during init.
    expect(i18n.options.supportedLngs).toContain("cimode");
    setNavigatorLanguage("cimode");

    expect(mod.detectBrowserLanguage()).toBeUndefined();
    expect(mod.detectBrowserLanguage({ ignoreStored: true })).toBeUndefined();
  });

  it("keeps an explicit choice over the browser when detection runs", async () => {
    const { i18n, mod } = await freshI18n();
    window.localStorage.setItem("language", "ja-JP");
    setNavigatorLanguage("zh-CN");
    await waitForInit(i18n);

    expect(mod.applyDetectedLanguage()).toBe("ja-JP");
    await flush();
    expect(window.localStorage.getItem("language")).toBe("ja-JP");
  });
});

describe("language switch loading", () => {
  it.each([
    "explicit choice",
    "follow system",
  ])("shows progress during an uncached %s and clears it when loading settles", async (mode) => {
    let finish!: (error: Error | null) => void;
    const promise = new Promise<Error | null>((resolve) => {
      finish = resolve;
    });
    const { i18n, mod } = await freshI18n(
      {
        fallbackLng: "en-US",
        ns: ["components"],
        resources: { "en-US": { components: { hello: "Hello" } } },
      },
      (_language, _namespace, callback) => {
        promise.then((error: Error | null) =>
          callback(error, error ? false : { hello: "你好" })
        );
      }
    );
    const { isLanguageProgressPending } = await import(
      "@workspace/ui/lib/navigation-progress"
    );
    await waitForInit(i18n);
    setNavigatorLanguage("zh-CN");

    const change =
      mode === "explicit choice"
        ? mod.setLanguagePreference("zh-CN")
        : mod.followSystemLanguage();
    expect(isLanguageProgressPending()).toBe(true);
    finish(
      mode === "follow system" ? new Error("Translation request failed") : null
    );
    await change;
    await flush();
    expect(isLanguageProgressPending()).toBe(false);

    const cachedChange = mod.setLanguagePreference("en-US");
    expect(isLanguageProgressPending()).toBe(false);
    await cachedChange;
  });
});

describe("explicit choice across a simulated reload", () => {
  it.each([
    "ja-JP",
    "ja-x-pseudo",
    "en-x-emoji",
  ])("restores %s after a reload with a different browser language", async (language) => {
    setNavigatorLanguage("zh-CN");
    const config = { fallbackLng: "en-US", supportedLngs: [...supportedLngs] };
    const first = await freshI18n(config);
    await waitForInit(first.i18n);

    await first.mod.setLanguagePreference(language);
    expect(window.localStorage.getItem("language")).toBe(language);

    const second = await freshI18n(config);
    await waitForInit(second.i18n);
    expect(second.i18n.options.lng).toBe("en-US");
    expect(second.mod.applyDetectedLanguage()).toBe(language);
    await flush();
    expect(second.i18n.language).toBe(language);
    expect(window.localStorage.getItem("language")).toBe(language);
  });

  it("does not leak the follow-system suppression onto the next explicit choice", async () => {
    setNavigatorLanguage("zh-CN");
    const { i18n, mod } = await freshI18n();
    await waitForInit(i18n);

    // A follow-system change happens first...
    mod.followSystemLanguage();
    await flush();
    expect(window.localStorage.getItem("language")).toBeNull();

    // ...then the user picks a language explicitly: it must be recorded.
    await mod.setLanguagePreference("ja-JP");
    expect(window.localStorage.getItem("language")).toBe("ja-JP");
  });
});

describe("follow system", () => {
  it("clears the stored value and re-applies the browser language", async () => {
    const { i18n, mod } = await freshI18n();
    window.localStorage.setItem("language", "ja-JP");
    setNavigatorLanguage("zh-CN");
    await waitForInit(i18n);

    const applied = mod.followSystemLanguage();
    await flush();

    // Storage is cleared so the next load detects from scratch...
    expect(window.localStorage.getItem("language")).toBeNull();
    // ...and the browser's preference is applied right away.
    expect(applied).toBe("zh-CN");
    expect(i18n.language).toBe("zh-CN");
  });

  it("re-applies the browser language even when a choice was active", async () => {
    const { i18n, mod } = await freshI18n();
    setNavigatorLanguage("ja-JP");
    await waitForInit(i18n);

    // The browser language differs from the pinned fallback, so "follow system"
    // has a real change to apply.
    mod.followSystemLanguage();
    await flush();
    expect(i18n.language).toBe("ja-JP");

    // Picking a language explicitly...
    await mod.setLanguagePreference("zh-CN");
    expect(window.localStorage.getItem("language")).toBe("zh-CN");

    // ...and going back to system must forget it and follow the browser again.
    setNavigatorLanguage("ja-JP");
    mod.followSystemLanguage();
    await flush();

    expect(window.localStorage.getItem("language")).toBeNull();
    expect(i18n.language).toBe("ja-JP");
  });

  it("leaves the stored value cleared when the browser preference is unsupported", async () => {
    const { mod } = await freshI18n();
    window.localStorage.setItem("language", "ja-JP");
    setNavigatorLanguage("de-DE");

    const applied = mod.followSystemLanguage();
    await flush();

    expect(applied).toBeUndefined();
    expect(window.localStorage.getItem("language")).toBeNull();
  });

  it("does not re-persist the language it applies", async () => {
    const { i18n, mod } = await freshI18n();
    setNavigatorLanguage("zh-CN");
    await waitForInit(i18n);

    mod.followSystemLanguage();
    await flush();

    // Regression: `changeLanguage` emits `languageChanged`, and the persistence
    // listener used to write that value straight back, so "follow system" never
    // actually forgot the preference.
    expect(window.localStorage.getItem("language")).toBeNull();
    expect(i18n.language).toBe("zh-CN");
  });
});

describe("initializeI18n", () => {
  it("keeps caller-provided ns / defaultNS / useSuspense", async () => {
    const { i18n } = await freshI18n({
      defaultNS: "app",
      fallbackLng: "en-US",
      ns: ["app", "components"],
      react: { useSuspense: false },
    });

    expect(i18n.options.defaultNS).toBe("app");
    expect(i18n.options.ns).toContain("app");
    expect(i18n.options.ns).toContain("components");
    expect(i18n.options.react?.useSuspense).toBe(false);
  });

  it("pins the initial language even when the browser prefers another", async () => {
    setNavigatorLanguage("zh-CN");
    const { i18n } = await freshI18n();

    // Detection must not run during init, or SSR and hydration disagree.
    expect(i18n.options.lng).toBe("en-US");
  });

  it("is idempotent", async () => {
    const { mod } = await freshI18n();
    const first = mod.initializeI18n({ fallbackLng: "zh-CN" });
    const second = mod.initializeI18n({ fallbackLng: "zh-CN" });

    expect(second).toBe(first);
    expect(first.options.lng).toBe("en-US");
  });
});

describe("follow system label", () => {
  it("uses the per-language wording, not the theme's bare 'System'", async () => {
    const { mod } = await freshI18n();

    // "System" alone is ambiguous beside real language names, and it belongs to
    // the theme setting; the option is a mode and reads "System default".
    expect(mod.getFollowSystemLabel("en-US")).toBe("System default");
    expect(mod.getFollowSystemLabel("zh-CN")).toBe("系统默认");
    expect(mod.getFollowSystemLabel("zh-TW")).toBe("系統預設");
    expect(mod.getFollowSystemLabel("zh-HK")).toBe("系統預設");
    expect(mod.getFollowSystemLabel("ja-JP")).toBe("システムの既定値");
    expect(mod.getFollowSystemLabel("ja-x-pseudo")).toBe("端末設定追従");
    expect(mod.getFollowSystemLabel("en-x-emoji")).toBe("💻🔄");
  });

  it("does not return the subject's bare '系统' for Chinese", async () => {
    const { mod } = await freshI18n();

    expect(mod.getFollowSystemLabel("zh-CN")).not.toBe("系统");
    expect(mod.getFollowSystemLabel("zh-CN")).toContain("默认");
  });

  it("falls back to the base language for unlisted regional variants", async () => {
    const { mod } = await freshI18n();

    expect(mod.getFollowSystemLabel("zh")).toBe("系统默认");
    expect(mod.getFollowSystemLabel("zh-Hans-CN")).toBe("系统默认");
    expect(mod.getFollowSystemLabel("ZH-cn")).toBe("系统默认");
  });

  it("falls back to English for unknown or missing languages", async () => {
    const { mod } = await freshI18n();

    expect(mod.getFollowSystemLabel("de-DE")).toBe("System default");
    expect(mod.getFollowSystemLabel(undefined)).toBe("System default");
    expect(mod.getFollowSystemLabel("")).toBe("System default");
  });
});

describe("novelty locale catalogs", () => {
  const localeDirectory = resolve(
    import.meta.dirname,
    "../../public/assets/locales"
  );
  const readCatalog = (language: string, namespace: string) =>
    JSON.parse(
      readFileSync(
        resolve(localeDirectory, language, `${namespace}.json`),
        "utf8"
      )
    );
  const flatten = (
    value: Record<string, unknown>,
    prefix = ""
  ): [string, string][] =>
    Object.entries(value).flatMap(([key, entry]) => {
      const name = prefix ? `${prefix}.${key}` : key;
      if (typeof entry === "string") return [[name, entry]];
      return flatten(entry as Record<string, unknown>, name);
    });
  const placeholders = (value: string) =>
    (value.match(/\{\{[^}]+\}\}/g) ?? []).sort();
  const emojiPattern = "^(?:\\p{RGI_Emoji}|\\s)+$";
  const emojiOnly = new RegExp(emojiPattern, "v");

  it.each([
    "ja-x-pseudo",
    "en-x-emoji",
  ])("%s covers every fallback key without losing interpolation or leaking prose into emoji", (language) => {
    for (const namespace of fallbackNamespaces) {
      const source = new Map(flatten(readCatalog("en-US", namespace)));
      const translated = new Map(flatten(readCatalog(language, namespace)));
      expect([...translated.keys()].sort()).toEqual([...source.keys()].sort());
      for (const [key, original] of source) {
        const text = translated.get(key)!;
        expect(text.trim(), `${namespace}.${key}`).not.toBe("");
        expect(placeholders(text), `${namespace}.${key}`).toEqual(
          placeholders(original)
        );
        if (language === "en-x-emoji") {
          expect(
            text.replace(/\{\{[^}]+\}\}/g, ""),
            `${namespace}.${key}`
          ).toMatch(emojiOnly);
        }
      }
    }
  });

  it.each([
    "ja-x-pseudo",
    "en-x-emoji",
  ])("uses %s resources for pluralization and interpolation", async (language) => {
    const { default: createI18next } = await vi.importActual<{
      default: typeof import("i18next")["default"];
    }>("i18next");
    const instance = createI18next.createInstance();
    const catalog = readCatalog(language, "main");
    await instance.init({
      lng: language,
      fallbackLng: "en-US",
      supportedLngs: [...supportedLngs],
      resources: { [language]: { main: catalog } },
      defaultNS: "main",
    });
    expect(instance.resolvedLanguage).toBe(language);
    expect(instance.t("welcome")).toBe(catalog.welcome);
    for (const count of [1, 2]) {
      expect(instance.t("more_features", { count })).toBe(
        catalog.more_features_other.replace("{{count}}", String(count))
      );
    }
  });
});

describe("generated locale resources", () => {
  const configDir = resolve(import.meta.dirname, "../config");

  it("exists and covers the namespaces the app needs for SSR", () => {
    const generated = resolve(configDir, "locale-resources.ts");
    expect(existsSync(generated)).toBe(true);

    const raw = readFileSync(generated, "utf8");
    for (const ns of [
      "components",
      "document",
      "layout",
      "main",
      "subscribe",
    ]) {
      expect(raw).toContain(`assets/locales/en-US/${ns}.json`);
    }
  });

  it("uses a quoted language key so the file is valid TypeScript", () => {
    const raw = readFileSync(resolve(configDir, "locale-resources.ts"), "utf8");

    expect(raw).toContain('"en-US": {');
  });
});
