"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  title = "삭제 확인",
  description = "이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  confirmLabel = "삭제",
  variant = "destructive",
  onConfirm,
  children,
}: {
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: "destructive" | "warning";
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const iconColors = variant === "destructive"
    ? "bg-red-100 text-red-600"
    : "bg-amber-100 text-amber-600";
  const buttonColors = variant === "destructive"
    ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-amber-600 hover:bg-amber-700 text-white";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span />}>{children}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="pt-0.5">
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-1.5 leading-relaxed text-sm text-gray-700 font-medium">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
            취소
          </Button>
          <Button
            className={`flex-1 sm:flex-none ${buttonColors}`}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
