"use client";

import Link from "next/link";
import Image from "next/image";
import { SortableList } from "@/components/admin/sortable-list";
import { reorderClientCustomers } from "./actions";
import { ExternalLink } from "lucide-react";

type ClientCustomer = {
  id: string;
  client_slug: string | null;
  company_name: string;
  name_en: string | null;
  logo_url: string | null;
  needs_dark_bg: boolean;
  display_category: string | null;
};

export function SortableClientsPanel({ items }: { items: ClientCustomer[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="inline-flex items-center text-[13px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          거래처 그리드
        </span>
        <span className="text-[13px] text-gray-700 tabular-nums font-bold">{items.length}개</span>
        <span className="text-xs text-gray-500 ml-auto font-medium">← 좌측 핸들 드래그로 순서 변경 · 홈/포트폴리오 그리드에 즉시 반영</span>
      </div>
      <SortableList
        items={items}
        onReorder={async (ids) => await reorderClientCustomers(ids)}
        renderItem={(c, dragHandle) => (
          <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/50">
            {dragHandle}
            <div className={`flex-shrink-0 w-20 h-10 rounded-md border border-gray-200 flex items-center justify-center ${
              c.needs_dark_bg ? "bg-brand-navy" : "bg-white"
            }`}>
              {c.logo_url && (
                <Image
                  src={c.logo_url}
                  alt={c.company_name}
                  width={80}
                  height={32}
                  className="max-h-7 max-w-[72px] w-auto object-contain"
                  unoptimized
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <Link href={`/admin/customers/${c.id}`} className="font-semibold text-sm text-brand-navy hover:underline truncate">
                  {c.company_name}
                </Link>
                {c.name_en && c.name_en !== c.company_name && (
                  <span className="text-[13px] text-gray-500 truncate font-medium">{c.name_en}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 font-medium">
                <code className="font-mono">{c.client_slug}</code>
                {c.display_category && (
                  <>
                    <span>·</span>
                    <span>{c.display_category}</span>
                  </>
                )}
              </div>
            </div>
            {c.client_slug && (
              <Link
                href={`/ko/clients/${c.client_slug}`}
                target="_blank"
                className="text-xs text-gray-600 hover:text-brand-navy inline-flex items-center gap-1 flex-shrink-0 font-semibold"
                title="공개 페이지 보기"
              >
                공개
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      />
    </div>
  );
}
