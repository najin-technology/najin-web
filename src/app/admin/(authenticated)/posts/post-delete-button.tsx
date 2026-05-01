"use client";

import { useTransition } from "react";
import { deletePost } from "./actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function PostDeleteButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      onConfirm={() => {
        startTransition(async () => {
          await deletePost(postId);
          toast.success("삭제되었습니다");
        });
      }}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        aria-label="삭제"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </ConfirmDialog>
  );
}
