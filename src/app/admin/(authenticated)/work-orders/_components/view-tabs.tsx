"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

export function ViewTabs({ active }: { active: "board" | "list" }) {
  const router = useRouter();
  const params = useSearchParams();

  const setView = (next: "board" | "list") => {
    const usp = new URLSearchParams(params.toString());
    if (next === "list") usp.delete("view");
    else usp.set("view", "board");
    router.push(`?${usp.toString()}`);
  };

  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
      <button
        type="button"
        onClick={() => setView("list")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          active === "list"
            ? "bg-brand-navy text-white shadow-sm"
            : "text-gray-500 hover:text-brand-navy"
        }`}
      >
        <List className="w-3.5 h-3.5" />
        리스트
      </button>
      <button
        type="button"
        onClick={() => setView("board")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          active === "board"
            ? "bg-brand-navy text-white shadow-sm"
            : "text-gray-500 hover:text-brand-navy"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        칸반
      </button>
    </div>
  );
}
