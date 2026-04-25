"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { WORK_ORDER_STATUSES, getStatusStyle } from "@/lib/status-colors";
import { WorkOrderCard } from "./work-order-card";
import { updateWorkOrderStatus } from "../actions";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  processing_type: string | null;
  material: string | null;
  quantity: string | null;
  deadline: string | null;
  priority: string;
  status: string;
  assignee: string | null;
  created_at: string;
};

function DraggableCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: order.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`mb-2 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}
    >
      <WorkOrderCard order={order} />
    </div>
  );
}

function Column({
  status,
  orders,
}: {
  status: string;
  orders: Order[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status}` });
  const style = getStatusStyle("work_order", status);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border border-gray-200 bg-gray-50/50 transition-colors ${
        isOver ? "bg-brand-copper/5 ring-2 ring-brand-copper/20" : ""
      }`}
    >
      <div className="px-3 py-2.5 border-b border-gray-200/80 flex items-center justify-between gap-2 sticky top-0 bg-gray-50/95 backdrop-blur z-10 rounded-t-xl">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          <p className="text-xs font-semibold text-brand-charcoal truncate">{status}</p>
        </div>
        <span className="text-[10px] tabular-nums text-gray-400">{orders.length}</span>
      </div>
      <div className="p-2 flex-1 min-h-[120px] overflow-y-auto max-h-[calc(100vh-280px)]">
        {orders.length === 0 ? (
          <p className="text-[11px] text-gray-300 text-center py-6 italic">비어있음</p>
        ) : (
          orders.map((o) => <DraggableCard key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}

export function BoardView({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const targetStatus = (over.id as string).replace("col-", "");
    const order = orders.find((o) => o.id === active.id);
    if (!order || order.status === targetStatus) return;

    // Optimistic update
    const prev = orders;
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: targetStatus } : o)));

    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", order.id as string);
      fd.append("status", targetStatus);
      const res = await updateWorkOrderStatus({}, fd);
      if (res.error) {
        setOrders(prev);
        toast.error(`상태 변경 실패: ${res.error}`);
      } else {
        toast.success(`'${targetStatus}'로 이동`);
        router.refresh();
      }
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {WORK_ORDER_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            orders={orders.filter((o) => o.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
