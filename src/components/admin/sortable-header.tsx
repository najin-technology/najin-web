"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export function SortableHeader({
  column,
  label,
  className,
}: {
  column: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSort = searchParams.get("sort");
  const currentOrder = searchParams.get("order") || "asc";
  const isActive = currentSort === column;

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive && currentOrder === "asc") {
      params.set("sort", column);
      params.set("order", "desc");
    } else if (isActive && currentOrder === "desc") {
      params.delete("sort");
      params.delete("order");
    } else {
      params.set("sort", column);
      params.set("order", "asc");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <TableHead className={className}>
      <button
        onClick={toggle}
        className="flex items-center gap-1 hover:text-brand-navy transition-colors group"
        aria-label={`${label} 정렬`}
      >
        {label}
        {isActive ? (
          currentOrder === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5 text-brand-navy" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-brand-navy" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-500" />
        )}
      </button>
    </TableHead>
  );
}
