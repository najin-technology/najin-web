"use client";

import { Switch } from "@/components/ui/switch";
import { toggleNoticePublish } from "./actions";
import { useTransition } from "react";

export function NoticePublishToggle({
  noticeId,
  isPublished,
}: {
  noticeId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isPublished}
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(() => {
          toggleNoticePublish(noticeId);
        });
      }}
    />
  );
}
