/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));
afterEach(cleanup);

function Navigation({ open }: { open: boolean }) {
  return (
    <SidebarProvider defaultOpen={open}>
      <SidebarTrigger />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Order management">
            <a href="/orders">Orders</a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarProvider>
  );
}

describe("sidebar link tooltips", () => {
  it("does not introduce a second focusable button around an expanded navigation link", () => {
    render(<Navigation open />);
    const link = screen.getByRole("link", { name: "Orders" });
    expect(screen.queryByRole("button", { name: "Orders" })).toBeNull();
    link.focus();
    expect(document.activeElement).toBe(link);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("describes the original link on keyboard focus when the sidebar is collapsed", async () => {
    render(<Navigation open={false} />);
    const link = screen.getByRole("link", { name: "Orders" });
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => link.focus());
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Order management");
    expect(link.getAttribute("aria-describedby")).toContain(tooltip.id);
    fireEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(document.cookie).toContain("sidebar_state=true");
  });
});
