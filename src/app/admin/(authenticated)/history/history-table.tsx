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
    if (confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      startTransition(() => {
        deleteHistoryItem(id);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
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
          {items.map((item) =>
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
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.year}</TableCell>
                <TableCell>{item.month ?? "-"}</TableCell>
                <TableCell>{item.description_ko}</TableCell>
                <TableCell className="text-gray-500">
                  {item.description_en || "-"}
                </TableCell>
                <TableCell>{item.sort_order}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditingId(item.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          )}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-12 text-gray-500"
              >
                등록된 연혁이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
