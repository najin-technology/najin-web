"use client";

import { Switch } from "@/components/ui/switch";
import { togglePostPublish } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function PostPublishToggle({
  postId,
  isPublished,
}: {
  postId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={isPending ? "opacity-50 transition-opacity" : "transition-opacity"}>
    <Switch
      checked={isPublished}
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(async () => {
          await togglePostPublish(postId);
          toast.success(isPublished ? "비공개로 변경되었습니다" : "공개로 변경되었습니다");
        });
      }}
    />
    </div>
  );
}
