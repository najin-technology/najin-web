"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export type SortableItem = { id: string };

/**
 * Reusable sortable list with drag handle + keyboard support.
 * The parent provides items + renderItem. On reorder, onReorder is called
 * with the new id order. The server action should update sort_order based
 * on array index (id at index i → sort_order = (i+1)*10).
 */
export function SortableList<T extends SortableItem>({
  items,
  renderItem,
  onReorder,
  reorderDisabled,
}: {
  items: T[];
  renderItem: (item: T, dragHandle: React.ReactNode) => React.ReactNode;
  onReorder: (newOrder: string[]) => Promise<{ error?: string } | void>;
  reorderDisabled?: boolean;
}) {
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);

    startTransition(async () => {
      const result = await onReorder(newOrder);
      if (result && "error" in result && result.error) {
        // rollback on error
        setOrder(order);
        toast.error(result.error);
      } else {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1600);
      }
    });
  };

  const itemsById = new Map(items.map((i) => [i.id, i] as const));
  const orderedItems = order.map((id) => itemsById.get(id)).filter(Boolean) as T[];

  return (
    <div className="relative">
      {(pending || justSaved) && (
        <div className="absolute -top-7 right-0 text-xs flex items-center gap-1.5 text-gray-700 font-semibold bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
          {pending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              순서 저장됨
            </>
          )}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={reorderDisabled ? undefined : handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-gray-100">
            {orderedItems.map((item) => (
              <SortableRow key={item.id} id={item.id} disabled={reorderDisabled}>
                {(handle) => renderItem(item, handle)}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    boxShadow: isDragging ? "0 10px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)" : undefined,
    background: isDragging ? "#fff" : undefined,
  };

  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      disabled={disabled}
      aria-label="순서 변경 (드래그)"
      className="flex-shrink-0 w-7 h-7 inline-flex items-center justify-center text-gray-400 hover:text-brand-navy hover:bg-gray-50 rounded transition-colors cursor-grab active:cursor-grabbing disabled:opacity-0 disabled:cursor-not-allowed"
    >
      <GripVertical className="w-4 h-4" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "relative" : ""}>
      {children(handle)}
    </div>
  );
}
