// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  user: {
    id: 1,
    avatar: "",
    auth_methods: [{ auth_identifier: "admin@example.test" }],
  } as any,
}));

vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({ user: store.user }),
}));

vi.mock("@/utils/common", () => ({ Logout: vi.fn() }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => d ?? _k }),
}));

import { UserNav } from "./user-nav";

afterEach(cleanup);

describe("admin UserNav", () => {
  it("renders a flex-centered avatar trigger without throwing", () => {
    expect(() => render(<UserNav />)).not.toThrow();
    const trigger = document.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.className).toContain("inline-flex");
    expect(trigger.className).toContain("justify-center");
  });

  it("opens a menu containing Logout", async () => {
    render(<UserNav />);
    const trigger = document.querySelector(
      '[data-slot="dropdown-trigger"]'
    ) as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByText("Logout")).toBeTruthy());
  });
});
