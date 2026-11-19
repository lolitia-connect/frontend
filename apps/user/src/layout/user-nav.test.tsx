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
    auth_methods: [{ auth_identifier: "member@example.test" }],
  } as any,
  setUser: vi.fn(),
}));

vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({ user: store.user, setUser: store.setUser }),
}));

vi.mock("@/layout/navs", () => ({
  useNavs: () => [
    {
      title: "Personal",
      items: [{ title: "User Detail", url: "/profile", icon: "uil:user" }],
    },
    { title: "Dashboard", url: "/dashboard", icon: "uil:dashboard" },
  ],
}));

vi.mock("@/utils/common", () => ({ Logout: vi.fn() }));

vi.mock("@workspace/ui/lib/router-compat", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@workspace/ui/composed/icon", () => ({
  Icon: ({ icon }: { icon?: string }) => <span data-icon={icon} />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => d ?? _k }),
}));

import { UserNav } from "./user-nav";

afterEach(cleanup);

describe("UserNav avatar menu", () => {
  it("renders the trigger without throwing", () => {
    expect(() => render(<UserNav />)).not.toThrow();
    expect(screen.getByText("member")).toBeTruthy();
  });

  it("opens a non-empty menu", async () => {
    render(<UserNav />);
    const trigger = screen
      .getByText("member")
      .closest('[data-slot="dropdown-menu-trigger"], [role="button"], button');
    expect(trigger).toBeTruthy();
    fireEvent.click(trigger as Element);
    await waitFor(() => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(items.length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Logout")).toBeTruthy();
    expect(screen.getByText("User Detail")).toBeTruthy();
  });
});
