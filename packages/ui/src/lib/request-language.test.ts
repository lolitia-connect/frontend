import { describe, expect, it } from "vitest";
import { getRequestLanguage } from "./request-language";

const supported = ["en-US", "zh-CN", "zh-TW", "zh-HK", "ja-JP"];

describe("Accept-Language negotiation", () => {
  it.each([
    ["en-US;q=0.3, ja-JP;q=0.9, zh-CN;q=0.5", "ja-JP"],
    ["JA-jp;q=0.8, zh-CN;q=0.8", "ja-JP"],
    ["de-DE, zh-CN;q=0.7, en-US;q=0.5", "zh-CN"],
    ["en-GB", "en-US"],
    ["zh-Hant", "zh-TW"],
    ["zh-Hant-HK", "zh-HK"],
    ["zh-Hans, en;q=0.8", "zh-CN"],
    ["ja-JP;q=0, zh;q=0.7", "zh-CN"],
    ["en-US;q=0, *;q=0.5", "zh-CN"],
    ["zh;q=0, zh-HK;q=1", "zh-HK"],
    ["ja-JP;q=2, zh-CN;q=invalid, en-US;q=0.5", "en-US"],
    ["<script>, ../zh-CN, de-DE", "en-US"],
    ["*", "en-US"],
    [null, "en-US"],
    ["", "en-US"],
  ])("selects a supported language for %s", (header, expected) => {
    expect(getRequestLanguage(header, supported, "en-US")).toBe(expected);
  });

  it("uses only languages offered by the target app", () => {
    expect(
      getRequestLanguage("ja-JP, zh-HK;q=0.8", ["en-US", "zh-CN"], "en-US")
    ).toBe("zh-CN");
  });
});
