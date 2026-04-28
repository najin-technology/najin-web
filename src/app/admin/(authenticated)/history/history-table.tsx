"use client";

import { useState, useTransition } from "react";
import { deleteHistoryItem } from "./actions";
import { HistoryEditForm } from "./history-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "sonner";

type HistoryItemData = {
  id: string;
  year: number;
  month: number | null;
  description_ko: string;
  description_en: string | null;
  sort_order: number;
};

export function HistoryTable({ items }: { items: HistoryItemData[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteHistoryItem(id);
      toast.success("삭제되었습니다");
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">연도</TableHead>
            <TableHead className="w-[60px]">월</TableHead>
            <TableHead>설명 (한국어)</TableHead>
            <TableHead>설명 (영어)</TableHead>
            <TableHead className="w-[60px]">순서</TableHead>
            <TableHead className="w-[100px]">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) =>
            editingId === item.id ? (
              <TableRow key={item.id}>
                <TableCell colSpan={6} className="p-3">
                  <HistoryEditForm
                    item={item}
                    onCancel={() => setEditingId(null)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={item.id} className={`even:bg-gray-50/30 ${idx > 0 && items[idx - 1].year !== item.year ? "border-t border-gray-300" : ""}`}>
                <TableCell className="font-bold text-brand-navy tabular-nums">{item.year}</TableCell>
                <TableCell className="font-medium tabular-nums">{item.month ?? "-"}</TableCell>
                <TableCell className="font-medium text-brand-charcoal">{item.description_ko}</TableCell>
                <TableCell className="text-gray-600 font-medium">
                  {item.description_en || "-"}
                </TableCell>
                <TableCell className="font-medium tabular-nums">{item.sort_order}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditingId(item.id)}
                      aria-label="편집"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <ConfirmDialog
                      title="연혁 삭제"
                      description="이 연혁 항목을 삭제하시겠습니까?"
                      onConfirm={() => handleDelete(item.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </ConfirmDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          )}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="text-center py-8 text-sm text-gray-500 font-medium">등록된 연혁이 없습니다</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
