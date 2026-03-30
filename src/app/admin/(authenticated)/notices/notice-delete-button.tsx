"use client";

import { useTransition } from "react";
import { deleteNotice } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function NoticeDeleteButton({ noticeId }: { noticeId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      className="text-red-500 hover:text-red-700"
      onClick={() => {
        if (confirm("정말 삭제하시겠습니까?")) {
          startTransition(() => {
            deleteNotice(noticeId);
          });
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
