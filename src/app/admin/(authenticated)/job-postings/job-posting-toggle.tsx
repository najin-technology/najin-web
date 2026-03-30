"use client";

import { Switch } from "@/components/ui/switch";
import { toggleJobPostingActive } from "./actions";
import { useTransition } from "react";

export function JobPostingActiveToggle({
  postingId,
  isActive,
}: {
  postingId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(() => {
          toggleJobPostingActive(postingId);
        });
      }}
    />
  );
}
