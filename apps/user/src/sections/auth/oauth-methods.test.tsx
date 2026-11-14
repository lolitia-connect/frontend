// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthMethods } from "./oauth-methods";

const mocks = vi.hoisted(() => ({
  oauthLogin: vi.fn(),
}));

vi.mock("@workspace/ui/services/common/common", () => ({
  postAuthOauthLogin: mocks.oauthLogin,
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({ invite: "invite-code" }),
}));

vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({
    common: {
      oauth_methods: ["google"],
      verify: {
        enable_register_verify: true,
        turnstile_site_key: "site-key",
      },
    },
  }),
}));

vi.mock("./turnstile", () => ({
  default: ({ onChange }: { onChange: (token: string) => void }) => (
    <button onClick={() => onChange("turnstile-token")} type="button">
      Solve challenge
    </button>
  ),
}));

beforeEach(() => {
  mocks.oauthLogin.mockResolvedValue({ data: { data: {} } });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OAuth methods", () => {
  it("uses the local OAuth contract without an unsupported registration challenge", async () => {
    render(<OAuthMethods />);

    const google = screen.getByRole("button", {
      name: "Continue with google",
    }) as HTMLButtonElement;
    expect(google.disabled).toBe(false);
    expect(
      screen.queryByRole("button", { name: "Solve challenge" })
    ).toBeNull();
    fireEvent.click(google);

    await waitFor(() => {
      expect(mocks.oauthLogin).toHaveBeenCalledWith({
        method: "google",
        redirect: "http://localhost:3000/oauth/google/",
      });
    });
  });
});
