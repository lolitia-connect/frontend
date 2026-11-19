import { createI18nInstance } from "@workspace/ui/lib/i18n";
import { expect, it } from "vitest";
import { fallbackResources } from "./locale-resources";

it("resolves a hyphenated namespace during synchronous server rendering", () => {
  const instance = createI18nInstance({
    lng: "en-US",
    ns: ["auth-control"],
    resources: fallbackResources,
  });
  expect(instance.t("communicationMethods", { ns: "auth-control" })).toBe(
    "Communication Methods"
  );
});
