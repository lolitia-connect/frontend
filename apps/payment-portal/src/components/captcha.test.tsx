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

it("keeps the puzzle visible and prevents refreshing while the answer is being verified", async () => {
  let finish!: (response: { data: { data: { token?: string } } }) => void;
  api.generate.mockResolvedValue({
    data: { data: { id: "slider", image, block_image: image } },
  });
  api.verify.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  render(<SliderCaptcha onChange={vi.fn()} resetKey={0} value="" />);
  fireEvent.click(screen.getByRole("button", { name: "点击完成滑块验证" }));
  const piece = await screen.findByAltText("captcha block");
  Object.defineProperty(piece, "setPointerCapture", { value: vi.fn() });
  fireEvent.pointerDown(piece, { pointerId: 1, clientX: 20, clientY: 20 });
  fireEvent.pointerUp(piece, { pointerId: 1, clientX: 60, clientY: 20 });

  expect(screen.getByRole("progressbar", { name: "Loading" })).toBeTruthy();
  expect(screen.getByAltText("captcha background")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "刷新验证" }));
  expect(api.generate).toHaveBeenCalledOnce();
  finish({ data: { data: {} } });
  await screen.findByText("请重试");
  expect(screen.queryByRole("progressbar")).toBeNull();
  await waitFor(() => expect(api.generate).toHaveBeenCalledTimes(2), {
    timeout: 3000,
  });
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
