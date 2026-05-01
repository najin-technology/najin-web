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
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
          active === "list"
            ? "bg-brand-navy text-white shadow-sm"
            : "text-gray-600 hover:text-brand-navy"
        }`}
      >
        <List className="w-4 h-4" />
        리스트
      </button>
      <button
        type="button"
        onClick={() => setView("board")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
          active === "board"
            ? "bg-brand-navy text-white shadow-sm"
            : "text-gray-600 hover:text-brand-navy"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        칸반
      </button>
    </div>
  );
}
