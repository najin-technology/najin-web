"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function FormStatusBar({
  checked,
  onCheckedChange,
  activeLabel = "활성",
  inactiveLabel = "비활성",
  activeDescription = "웹사이트에 표시됩니다",
  inactiveDescription = "관리자만 볼 수 있습니다",
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  activeDescription?: string;
  inactiveDescription?: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <div>
        <Label className="text-sm font-medium">
          {checked ? activeLabel : inactiveLabel}
        </Label>
        <p className="text-xs text-gray-400 mt-0.5">
          {checked ? activeDescription : inactiveDescription}
        </p>
      </div>
    </div>
  );
}
