export type SortableItem = {
  id?: string | number;
  sort?: number | null;
};

const idCollator = new Intl.Collator(undefined, { numeric: true });

export function compareSortableItems<T extends SortableItem>(a: T, b: T) {
  const aSort =
    typeof a.sort === "number" && Number.isFinite(a.sort)
      ? a.sort
      : Number.POSITIVE_INFINITY;
  const bSort =
    typeof b.sort === "number" && Number.isFinite(b.sort)
      ? b.sort
      : Number.POSITIVE_INFINITY;
  return (
    aSort - bSort || idCollator.compare(String(a.id ?? ""), String(b.id ?? ""))
  );
}

export function sortSortableItems<T extends SortableItem>(items: readonly T[]) {
  return [...items].sort(compareSortableItems);
}

export function reorderSortableItems<T extends SortableItem>(
  items: readonly T[],
  sourceId: string | number,
  targetId: string | number
) {
  const sourceIndex = items.findIndex(
    (item) => String(item.id) === String(sourceId)
  );
  const targetIndex = items.findIndex(
    (item) => String(item.id) === String(targetId)
  );
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return [...items];
  }

  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved!);
  return next.map((item, index) => ({ ...item, sort: index }));
}
