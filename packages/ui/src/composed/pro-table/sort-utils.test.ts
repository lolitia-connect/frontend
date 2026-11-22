import { describe, expect, it } from "vitest";
import { reorderSortableItems, sortSortableItems } from "./sort-utils";

describe("sortable list utilities", () => {
  it("sorts missing and duplicate sort IDs deterministically without mutating input", () => {
    const input = [
      { id: "10", sort: 1 },
      { id: "2", sort: 1 },
      { id: "1", sort: undefined },
    ];

    expect(sortSortableItems(input).map((item) => item.id)).toEqual([
      "2",
      "10",
      "1",
    ]);
    expect(input[0]?.id).toBe("10");
  });

  it("reorders by stable IDs and assigns relative sort IDs", () => {
    const input = [
      { id: "a", sort: 20 },
      { id: "b", sort: 30 },
      { id: "c", sort: 40 },
    ];

    expect(reorderSortableItems(input, "c", "a")).toEqual([
      { id: "c", sort: 0 },
      { id: "a", sort: 1 },
      { id: "b", sort: 2 },
    ]);
    expect(input).toEqual([
      { id: "a", sort: 20 },
      { id: "b", sort: 30 },
      { id: "c", sort: 40 },
    ]);
  });
});
