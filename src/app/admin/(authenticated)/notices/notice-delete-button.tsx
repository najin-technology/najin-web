"use client";

import { useTransition } from "react";
import { deleteNotice } from "./actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function NoticeDeleteButton({ noticeId }: { noticeId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      onConfirm={() => {
        startTransition(async () => {
          await deleteNotice(noticeId);
          toast.success("삭제되었습니다");
        });
      }}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </ConfirmDialog>
  );
}
