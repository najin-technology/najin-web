"use client";

import { Switch } from "@/components/ui/switch";
import { toggleProductActive } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function ProductActiveToggle({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(async () => {
          await toggleProductActive(productId);
          toast.success(isActive ? "비활성화되었습니다" : "활성화되었습니다");
        });
      }}
    />
  );
}
