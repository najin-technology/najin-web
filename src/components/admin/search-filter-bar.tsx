"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useCallback } from "react";
import { Search } from "lucide-react";

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

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1B2A4A] w-56"
        />
      </div>
      {filters.map((filter) => (
        <select
          key={filter.key}
          defaultValue={searchParams.get(filter.key) || ""}
          onChange={(e) => updateParams(filter.key, e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1B2A4A] appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%239ca3af%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.427%206.427l3.396%203.396a.25.25%200%2000.354%200l3.396-3.396A.25.25%200%2011.396%206H4.604a.25.25%200%20.177.427z%22/%3E%3C/svg%3E')] bg-[position:right_8px_center] bg-no-repeat"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
