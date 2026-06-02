"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { HighlightText } from "@/components/admin/highlight-text";
import { BulkSelectBar } from "@/components/admin/bulk-select-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bulkUpdateApplicationStatus } from "./actions";

type Application = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  position: string;
  status: string;
  created_at: string;
};

const APPLICATION_STATUSES = ["서류검토", "면접예정", "합격", "불합격"];

export function BulkApplicationsTable({
  applications,
  searchQuery,
}: {
  applications: Application[];
  searchQuery?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleRow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === applications.length) setSelected(new Set());
    else setSelected(new Set(applications.map((a) => a.id)));
  };

  const allSelected = applications.length > 0 && selected.size === applications.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <>
      <BulkSelectBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        statusOptions={APPLICATION_STATUSES}
        onApply={async (status) => {
          const ids = Array.from(selected);
          return await bulkUpdateApplicationStatus(ids, status);
        }}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="전체 선택"
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
              </TableHead>
              <TableHead>이름</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>포지션</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>지원일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((a) => {
              const isSelected = selected.has(a.id);
              return (
                <TableRow
                  key={a.id}
                  className={`group hover:bg-gray-50/50 ${isSelected ? "bg-blue-50/40" : ""}`}
                >
                  <TableCell className="admin-card-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRow(a.id);
                      }}
                      aria-label={`${a.name} 선택`}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="text-brand-blue hover:text-brand-blue-hover group-hover:underline font-medium transition-colors"
                    >
                      <HighlightText text={a.name} query={searchQuery} />
                    </Link>
                  </TableCell>
                  <TableCell data-label="연락처">{a.phone || "-"}</TableCell>
                  <TableCell data-label="포지션">
                    <HighlightText text={a.position || "-"} query={searchQuery} />
                  </TableCell>
                  <TableCell data-label="상태">
                    <StatusBadge status={a.status} type="application" />
                  </TableCell>
                  <TableCell data-label="지원일" className="text-sm text-gray-600 font-medium tabular-nums">
                    {new Date(a.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {applications.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-[13px] text-gray-500 tabular-nums font-medium">
            총 {applications.length}건
          </div>
        )}
      </div>
    </>
  );
}
