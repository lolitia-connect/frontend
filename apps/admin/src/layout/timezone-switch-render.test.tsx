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
    t: (_k: string, d?: string) => d ?? _k,
    i18n: { language: "en-US" },
  }),
}));

vi.mock("@workspace/ui/composed/icon", () => ({
  Icon: ({ icon }: { icon?: string }) => <span data-icon={icon} />,
}));

import TimezoneSwitch from "./timezone-switch";

afterEach(cleanup);

describe("TimezoneSwitch", () => {
  it("renders the trigger without throwing", () => {
    expect(() => render(<TimezoneSwitch />)).not.toThrow();
    expect(screen.getByLabelText("Timezone")).toBeTruthy();
  });

  it("opens a populated, filterable timezone list", async () => {
    render(<TimezoneSwitch />);
    fireEvent.click(screen.getByLabelText("Timezone"));
    await waitFor(
      () => {
        expect(screen.getByText("Recommended")).toBeTruthy();
        expect(screen.getByText("All")).toBeTruthy();
      },
      { timeout: 5000 }
    );
    const rowsBefore = document.querySelectorAll(
      'button[type="button"]'
    ).length;
    expect(rowsBefore).toBeGreaterThan(1);

    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Tokyo" } });
    await waitFor(
      () => {
        expect(screen.getByText("Asia/Tokyo")).toBeTruthy();
        expect(screen.queryByText("America/New_York")).toBeNull();
      },
      { timeout: 5000 }
    );
  });
});
