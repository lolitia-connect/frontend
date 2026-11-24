// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import EmailBroadcastForm from "./broadcast-form";

const api = vi.hoisted(() => ({
  postMarketingEmailBatchSend: vi.fn(),
  postMarketingEmailBatchPreSendCount: vi.fn(),
}));
vi.mock("@workspace/ui/services/admin/admin", () => api);
vi.mock("@workspace/ui/composed/editor/html", () => ({
  HTMLEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="Email content"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  ),
}));
vi.mock("@workspace/ui/composed/icon", () => ({ Icon: () => null }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.clearAllMocks();
  api.postMarketingEmailBatchSend.mockResolvedValue({ data: { code: 200 } });
  api.postMarketingEmailBatchPreSendCount.mockResolvedValue({
    data: { data: { count: 12 } },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function openSettings() {
  render(<EmailBroadcastForm />);
  fireEvent.click(screen.getByRole("button", { name: /emailBroadcast/ }));
  fireEvent.change(await screen.findByLabelText("subject"), {
    target: { value: "Campaign subject" },
  });
  fireEvent.change(screen.getByLabelText("Email content"), {
    target: { value: "<p>Campaign content</p>" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "sendSettings" }));
  await screen.findByLabelText("additionalRecipientEmails");
}

async function selectScope(name: string) {
  fireEvent.click(screen.getByRole("button", { name: /selectSendScope/ }));
  fireEvent.click(await screen.findByRole("option", { name }));
}

it("switches to send settings and back while preserving content and the selected scope", async () => {
  await openSettings();
  expect(
    screen.getByRole("button", { name: /selectSendScope/ }).textContent
  ).toContain("allUsers");
  for (const name of [
    "subscribedUsersOnly",
    "expiredSubscriptionUsersOnly",
    "noSubscriptionUsersOnly",
  ]) {
    await selectScope(name);
    expect(
      screen.getByRole("button", { name: /selectSendScope/ }).textContent
    ).toContain(name);
  }
  fireEvent.click(screen.getByRole("tab", { name: "content" }));
  expect(
    (await screen.findByLabelText<HTMLInputElement>("subject")).value
  ).toBe("Campaign subject");
  expect(screen.getByDisplayValue("<p>Campaign content</p>")).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "sendSettings" }));
  await screen.findByLabelText("additionalRecipientEmails");
  expect(
    screen.getByRole("button", { name: /selectSendScope/ }).textContent
  ).toContain("noSubscriptionUsersOnly");
  fireEvent.click(screen.getByRole("button", { name: "sendNow" }));
  await waitFor(() =>
    expect(api.postMarketingEmailBatchSend).toHaveBeenCalledWith({
      subject: "Campaign subject",
      content: "<p>Campaign content</p>",
      scope: 4,
      register_start_time: 0,
      register_end_time: 0,
      additional: undefined,
      scheduled: undefined,
      interval: 1,
      limit: 1000,
    })
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("supports additional emails only and scheduled sending from the settings tab", async () => {
  await openSettings();
  await selectScope("specificUsersOnly");
  for (const label of ["registrationStartDate", "registrationEndDate"]) {
    const input = screen.getByLabelText<HTMLInputElement>(label);
    expect(input.disabled).toBe(true);
  }
  const emails = "first@example.com\nsecond@example.com";
  fireEvent.change(screen.getByLabelText("additionalRecipientEmails"), {
    target: { value: emails },
  });
  const scheduled = "2099-01-01T12:00:00";
  const scheduleInput =
    screen.getByLabelText<HTMLInputElement>("scheduledSend");
  fireEvent.change(scheduleInput, { target: { value: scheduled } });
  fireEvent.click(screen.getByRole("button", { name: "scheduleSend" }));
  await waitFor(() =>
    expect(api.postMarketingEmailBatchSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Campaign subject",
        content: "<p>Campaign content</p>",
        scope: 5,
        additional: emails,
        scheduled: new Date(scheduled).getTime(),
      })
    )
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
