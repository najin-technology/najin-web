"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export function SearchFilterBar({
  searchPlaceholder = "검색...",
  filters = [],
}: {
  searchPlaceholder?: string;
  filters?: FilterOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const handleSearch = (value: string) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateParams("q", value);
    }, 300);
  };

  const clearSearch = () => {
    if (inputRef.current) inputRef.current.value = "";
    updateParams("q", "");
  };

  const currentQuery = searchParams.get("q") || "";
  const activeFilterCount = filters.filter((f) => searchParams.get(f.key)).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={searchPlaceholder}
          defaultValue={currentQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A]/20 focus-visible:border-[#1B2A4A]/40"
        />
        {currentQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="검색 초기화"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {filters.map((filter) => {
        const isFiltered = !!searchParams.get(filter.key);
        return (
          <div key={filter.key} className="relative">
            <select
              defaultValue={searchParams.get(filter.key) || ""}
              onChange={(e) => updateParams(filter.key, e.target.value)}
              className={`h-9 rounded-lg border bg-white pl-3 pr-8 text-sm transition-all appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A]/20 focus-visible:border-[#1B2A4A]/40 ${
                isFiltered
                  ? "border-[#1B2A4A]/30 text-[#1B2A4A] font-medium"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
