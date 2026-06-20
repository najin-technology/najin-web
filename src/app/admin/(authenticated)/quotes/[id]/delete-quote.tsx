"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { softDeleteQuotes } from "../actions";
import { QuoteDeleteDialog } from "../quote-delete-dialog";

export function DeleteQuote({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const onConfirm = () => {
    start(async () => {
      const res = await softDeleteQuotes([quoteId]);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("견적 기록을 삭제했습니다.");
      setOpen(false);
      // 삭제 후엔 목록·고객 조회에서 사라지므로 목록으로 복귀.
      router.push("/admin/quotes");
    });
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        견적 기록 삭제
      </Button>
      <QuoteDeleteDialog
        open={open}
        onOpenChange={setOpen}
        count={1}
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
