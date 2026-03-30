"use client";

import { Switch } from "@/components/ui/switch";
import { toggleProductActive } from "./actions";
import { useTransition } from "react";

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
        startTransition(() => {
          toggleProductActive(productId);
        });
      }}
    />
  );
}
