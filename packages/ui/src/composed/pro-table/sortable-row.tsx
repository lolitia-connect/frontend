import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@heroui/react";
import { GripVertical } from "lucide-react";
import { type ComponentProps, createContext, useContext } from "react";

const SortableRowContext = createContext<ReturnType<typeof useSortable> | null>(
  null
);

export function SortableRow({
  sortableId,
  ref,
  style,
  ...props
}: ComponentProps<"tr"> & { sortableId: string }) {
  const sortable = useSortable({ id: sortableId });

  return (
    <SortableRowContext.Provider value={sortable}>
      <tr
        {...props}
        ref={(node) => {
          sortable.setNodeRef(node);
          if (typeof ref === "function") return ref(node);
          if (ref) ref.current = node;
        }}
        style={{
          ...style,
          transform: CSS.Transform.toString(
            sortable.transform && { ...sortable.transform, x: 0 }
          ),
          transition: sortable.transition,
        }}
      />
    </SortableRowContext.Provider>
  );
}

export function SortHandle({ label }: { label: string }) {
  const sortable = useContext(SortableRowContext);
  if (!sortable) return null;

  return (
    <Button
      {...sortable.attributes}
      {...sortable.listeners}
      aria-label={label}
      className="cursor-grab touch-none"
      isIconOnly
      ref={sortable.setActivatorNodeRef}
      size="sm"
      variant="ghost"
    >
      <GripVertical className="size-4" />
    </Button>
  );
}
