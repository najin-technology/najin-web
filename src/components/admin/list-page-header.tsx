import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ListPageHeader({
  title,
  count,
  createHref,
  createLabel,
}: {
  title: string;
  count?: number;
  createHref?: string;
  createLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-brand-navy">{title}</h1>
        {count != null && count > 0 && (
          <span className="text-xs text-gray-400 tabular-nums">
            {count}건
          </span>
        )}
      </div>
      {createHref && createLabel && (
        <Link href={createHref}>
          <Button className="bg-brand-navy hover:bg-brand-navy-light text-white gap-1.5 rounded-lg shadow-sm">
            <Plus className="w-4 h-4" />
            {createLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
