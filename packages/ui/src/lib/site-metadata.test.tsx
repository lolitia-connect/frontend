/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { type SiteMetadataOptions, useSiteMetadata } from "./site-metadata";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("site title synchronization", () => {
  it.each([
    "User Portal",
    "Admin Portal",
    "Payment Portal",
  ])("restores the configured title after Next writes %s later", async (fallback) => {
    renderHook(() =>
      useSiteMetadata({ title: "LoliTia Connect", pageTitle: "Dashboard" })
    );
    expect(document.title).toBe("Dashboard | LoliTia Connect");

    await act(async () => {
      document.title = fallback;
    });
    await waitFor(() =>
      expect(document.title).toBe("Dashboard | LoliTia Connect")
    );

    await act(async () => {
      document.querySelector("title")?.remove();
      const replacement = document.createElement("title");
      replacement.textContent = fallback;
      document.head.appendChild(replacement);
    });
    await waitFor(() =>
      expect(document.title).toBe("Dashboard | LoliTia Connect")
    );
  });

  it("uses the latest config, route, and translations after delayed metadata updates", async () => {
    const initialProps: SiteMetadataOptions = {
      title: "Admin Portal",
      pathname: "/dashboard",
    };
    const { rerender } = renderHook(useSiteMetadata, { initialProps });
    rerender({
      title: "LoliTia Connect",
      pageTitle: "Dashboard",
      titleSuffix: " @ Admin",
      pathname: "/dashboard",
    });
    rerender({
      title: "LoliTia Connect",
      pageTitle: "User Management",
      titleSuffix: " @ Admin",
      pathname: "/dashboard/user",
    });
    expect(document.title).toBe("User Management | LoliTia Connect @ Admin");
    rerender({
      title: "LoliTia Connect",
      pageTitle: "用户管理",
      titleSuffix: " @ 管理",
      pathname: "/dashboard/user",
    });
    await act(async () => {
      document.querySelector("title")!.firstChild!.nodeValue = "Admin Portal";
    });
    await waitFor(() =>
      expect(document.title).toBe("用户管理 | LoliTia Connect @ 管理")
    );
  });

  it("stops enforcing the title after unmount", async () => {
    const { unmount } = renderHook(() =>
      useSiteMetadata({ title: "LoliTia Connect" })
    );
    unmount();
    await act(async () => {
      document.title = "Another application";
    });
    expect(document.title).toBe("Another application");
  });
});
