// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GroupDetailTable } from "./group-detail-table";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
afterEach(cleanup);

it("opens the clicked snapshot row, including legacy fields and repeated node groups", async () => {
  render(
    <GroupDetailTable
      details={[
        { node_group_id: "3", user_count: 0 },
        {
          NodeGroupId: 3,
          UserCount: 1,
          UserData: JSON.stringify([{ id: 42, email: "member@example.test" }]),
        },
      ]}
    />
  );
  expect(
    screen.getByRole<HTMLButtonElement>("button", {
      name: "#3 · User List (0)",
    }).disabled
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "#3 · User List (1)" }));
  const dialog = await screen.findByRole("dialog", { name: "#3 · User List" });
  expect(within(dialog).getByText("member@example.test")).toBeTruthy();
});
