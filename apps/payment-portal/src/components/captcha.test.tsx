// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LocalCaptcha } from "./local-captcha";
import { SliderCaptcha } from "./slider-captcha";

const api = vi.hoisted(() => ({ generate: vi.fn(), verify: vi.fn() }));
vi.mock("@workspace/ui/services/common/auth", () => ({
  generateCaptcha: api.generate,
  verifyCaptchaSlider: api.verify,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='32'/%3E";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("labels the captcha input and clears the old answer when a challenge is refreshed", async () => {
  api.generate
    .mockResolvedValueOnce({ data: { data: { id: "first", image } } })
    .mockResolvedValueOnce({ data: { data: { id: "second", image } } });
  const onChange = vi.fn();
  const onCaptchaIdChange = vi.fn();
  render(
    <LocalCaptcha
      onCaptchaIdChange={onCaptchaIdChange}
      onChange={onChange}
      resetKey={0}
      value=""
    />
  );
  await waitFor(() =>
    expect(onCaptchaIdChange).toHaveBeenLastCalledWith("first")
  );
  fireEvent.change(screen.getByRole("textbox", { name: "图形验证码" }), {
    target: { value: "1234" },
  });
  expect(onChange).toHaveBeenLastCalledWith("1234");
  fireEvent.click(screen.getByRole("button", { name: "刷新验证码" }));
  await waitFor(() =>
    expect(onCaptchaIdChange).toHaveBeenLastCalledWith("second")
  );
  expect(onChange).toHaveBeenLastCalledWith("");
});

it("opens and dismisses the controlled slider dialog without starting verification", async () => {
  api.generate.mockResolvedValue({
    data: { data: { id: "slider", image, block_image: image } },
  });
  render(<SliderCaptcha onChange={vi.fn()} resetKey={0} value="" />);
  fireEvent.click(screen.getByRole("button", { name: "点击完成滑块验证" }));
  await screen.findByRole("dialog", { name: "滑块验证" });
  await screen.findByAltText("captcha background");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(api.verify).not.toHaveBeenCalled();
});
