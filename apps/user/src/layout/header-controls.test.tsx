// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, d?: unknown) =>
      typeof d === "string" ? d : ((d as any)?.defaultValue ?? _k),
    i18n: { language: "en-US" },
  }),
}));

vi.mock("@workspace/ui/integrations/language", () => ({
  useLanguage: () => ({
    language: "en-US",
    changeLanguage: vi.fn(),
    supportedLanguages: ["en-US", "zh-CN"],
    isFollowingSystem: false,
    followSystem: vi.fn(),
  }),
}));

vi.mock("@workspace/ui/integrations/theme", () => ({
  useTheme: () => ({
    theme: "system",
    setTheme: vi.fn(),
    resetTheme: vi.fn(),
    resolvedTheme: "light",
  }),
}));

import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";

afterEach(cleanup);

describe("header icon-only triggers", () => {
  it("LanguageSwitch trigger is flex-centered and opens a populated menu", async () => {
    render(<LanguageSwitch />);
    const trigger = screen.getByTestId("language-switch-trigger");
    // The inline-flex centering utility must be present on the trigger so the
    // icon is centered despite HeroUI's `.dropdown__trigger { display:inline-block }`.
    expect(trigger.className).toContain("inline-flex");
    expect(trigger.className).toContain("items-center");
    expect(trigger.className).toContain("justify-center");
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(
        document.querySelectorAll('[role="menuitem"]').length
      ).toBeGreaterThan(0)
    );
    expect(screen.getByText(/English/)).toBeTruthy();
  });

  it("ThemeSwitch trigger is flex-centered and opens a populated menu", async () => {
    render(<ThemeSwitch />);
    const trigger = screen.getByLabelText("Toggle theme");
    expect(trigger.className).toContain("inline-flex");
    expect(trigger.className).toContain("justify-center");
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(
        document.querySelectorAll('[role="menuitem"]').length
      ).toBeGreaterThan(0)
    );
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
  });
});
