// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChangePassword from "./change-password";

const mocks = vi.hoisted(() => ({ update: vi.fn(), logout: vi.fn() }));
vi.mock("@workspace/ui/services/user/user", () => ({
  updateUserPassword: mocks.update,
}));
vi.mock("@/utils/common", () => ({ Logout: mocks.logout }));
vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({
    user: {
      auth_methods: [
        { auth_type: "email", auth_identifier: "owner@example.com" },
      ],
    },
  }),
}));
vi.mock("@/sections/auth/send-code", () => ({
  default: () => <button type="button">Get Code</button>,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string, values?: Record<string, string>) =>
      fallback.replace("{{email}}", values?.email ?? ""),
  }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
beforeEach(() => {
  mocks.update.mockResolvedValue({});
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function fillNewPassword(password: string) {
  fireEvent.change(
    screen.getByPlaceholderText("New Password (at least 8 characters)"),
    { target: { value: password } }
  );
  fireEvent.change(screen.getByPlaceholderText("Repeat New Password"), {
    target: { value: password },
  });
}

describe("password credentials", () => {
  it("rejects short passwords and sends only the current password", async () => {
    render(<ChangePassword />);
    fireEvent.change(screen.getByPlaceholderText("Current password"), {
      target: { value: "old-secret" },
    });
    fillNewPassword("short");
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));
    expect(
      await screen.findByText("Password must be 8-128 characters")
    ).toBeTruthy();
    expect(mocks.update).not.toHaveBeenCalled();
    fillNewPassword("new-secret");
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        password: "new-secret",
        old_password: "old-secret",
      })
    );
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it("clears the old password when switching to a security code", async () => {
    render(<ChangePassword />);
    fireEvent.change(screen.getByPlaceholderText("Current password"), {
      target: { value: "discard-secret" },
    });
    const tab = screen.getByRole("tab", { name: "No password set" });
    // Tabs is React Aria-backed now: `usePress` activates on the pointer
    // sequence a real click produces. The previous Radix implementation also
    // activated on a bare `mouseDown`, so simulating the full sequence is the
    // faithful interaction for the current primitive.
    fireEvent.pointerDown(tab, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(tab, { button: 0, pointerType: "mouse" });
    fillNewPassword("new-secret");
    fireEvent.change(
      await screen.findByPlaceholderText("Code sent to owner@example.com"),
      { target: { value: "123456" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        password: "new-secret",
        current_code: "123456",
      })
    );
    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
