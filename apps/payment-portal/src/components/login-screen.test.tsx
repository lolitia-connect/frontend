// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginScreen } from "./login-screen";

vi.mock("@/components/preferences", () => ({ Preferences: () => null }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    i18n: { language: "en-US" },
  }),
}));

function renderLogin(
  overrides: Partial<Parameters<typeof LoginScreen>[0]> = {}
) {
  const props = {
    account: "",
    configLoading: false,
    loading: false,
    onAccountChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn(),
    password: "",
    siteName: "Acme Pay",
    ...overrides,
  };
  render(<LoginScreen {...props} />);
  return props;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginScreen (HeroUI)", () => {
  it("renders the site name, heading and both credential fields", () => {
    renderLogin();

    expect(screen.getByText("Acme Pay")).toBeTruthy();
    expect(screen.getByText("登录充值中心")).toBeTruthy();
    expect(screen.getByLabelText("账号 / 邮箱")).toBeTruthy();
    expect(screen.getByLabelText("密码")).toBeTruthy();
  });

  it("reports the account value as a string through HeroUI onChange", () => {
    const props = renderLogin();

    fireEvent.change(screen.getByLabelText("账号 / 邮箱"), {
      target: { value: "member@example.test" },
    });

    expect(props.onAccountChange).toHaveBeenCalledWith("member@example.test");
  });

  it("reports the password value as a string through HeroUI onChange", () => {
    const props = renderLogin();

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "s3cret" },
    });

    expect(props.onPasswordChange).toHaveBeenCalledWith("s3cret");
  });

  it("submits the form when the submit button is pressed", () => {
    const props = renderLogin();

    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables the submit button and shows the config label while loading config", () => {
    renderLogin({ configLoading: true });

    const button = screen.getByRole("button", {
      name: "加载配置中...",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("projects the captcha slot into the form", () => {
    renderLogin({ captchaSlot: <div data-testid="captcha" /> });

    expect(screen.getByTestId("captcha")).toBeTruthy();
  });
});
