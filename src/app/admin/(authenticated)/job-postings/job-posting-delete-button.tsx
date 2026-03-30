"use client";

import { useTransition } from "react";
import { deleteJobPosting } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function JobPostingDeleteButton({
  postingId,
}: {
  postingId: string;
}) {
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
            deleteJobPosting(postingId);
          });
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
