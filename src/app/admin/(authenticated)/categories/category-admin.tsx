"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory, deleteCategory, reorderCategories } from "./actions";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Cat = { id: string; name: string; color: string | null; count: number };

export function CategoryAdmin({ categories }: { categories: Cat[] }) {
  const [state, formAction, pending] = useActionState(createCategory, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="space-y-6">
      <form ref={formRef} action={formAction} className="flex gap-2 items-start">
        <div className="flex-1 max-w-sm">
          <Input name="name" placeholder="새 카테고리 이름 (예: 사출)" required />
          {state.error && <p className="text-sm text-red-600 mt-1.5 font-medium">{state.error}</p>}
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4 mr-1" />
          {pending ? "추가 중..." : "추가"}
        </Button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center">
          <span className="text-[13px] text-gray-700 font-bold tabular-nums">{categories.length}개 카테고리</span>
          {categories.length > 1 && (
            <span className="text-xs text-gray-500 ml-auto font-medium">← 좌측 핸들을 드래그해 순서 변경</span>
          )}
        </div>

        {categories.length > 0 ? (
          <SortableList
            items={categories}
            onReorder={async (ids) => await reorderCategories(ids)}
            renderItem={(c, dragHandle) => (
              <div className="flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50/50">
                {dragHandle}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] font-bold ${c.color || "bg-gray-100 text-gray-700"}`}
                >
                  {c.name}
                </span>
                <span className="text-[13px] text-gray-600 font-semibold tabular-nums">제품 {c.count}개</span>
                <div className="ml-auto">
                  <ConfirmDialog
                    title="카테고리 삭제"
                    description={`'${c.name}' 카테고리를 삭제하시겠습니까?`}
                    onConfirm={async () => {
                      const res = await deleteCategory(c.id);
                      if (res?.error) toast.error(res.error);
                      else toast.success("삭제되었습니다");
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
            )}
          />
        ) : (
          <p className="px-5 py-10 text-center text-sm text-gray-500">등록된 카테고리가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
