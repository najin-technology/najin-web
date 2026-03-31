"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useCallback } from "react";

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
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder={searchPlaceholder}
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="flex h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3182CE] w-64"
      />
      {filters.map((filter) => (
        <select
          key={filter.key}
          defaultValue={searchParams.get(filter.key) || ""}
          onChange={(e) => updateParams(filter.key, e.target.value)}
          className="flex h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3182CE]"
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
