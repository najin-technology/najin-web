"use client";

import { Switch } from "@/components/ui/switch";
import { toggleJobPostingActive } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function JobPostingActiveToggle({
  postingId,
  isActive,
}: {
  postingId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={isPending ? "opacity-50 transition-opacity" : "transition-opacity"}>
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(async () => {
          await toggleJobPostingActive(postingId);
          toast.success(isActive ? "비활성화되었습니다" : "활성화되었습니다");
        });
      }}
    />
    </div>
  );
}
