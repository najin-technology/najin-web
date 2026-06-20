"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/status-badge";
import { HighlightText } from "@/components/admin/highlight-text";
import { BulkSelectBar } from "@/components/admin/bulk-select-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bulkUpdateQuoteStatus, bulkCancelQuotes, softDeleteQuotes } from "./actions";
import { QuoteDeleteDialog } from "./quote-delete-dialog";

type Quote = {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  email: string | null;
  processing_type: string;
  status: string;
  created_at: string;
};

const QUOTE_STATUSES = ["접수", "검토중", "견적발송", "완료"];

function formatElapsed(createdAt: string, status: string) {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
  const isPending = status === "접수";
  if (!isPending) return { text: new Date(createdAt).toLocaleDateString("ko-KR"), overdue: false, pending: false };
  const text =
    hours < 1 ? "방금" : hours < 24 ? `${hours}시간 전` : `${Math.floor(hours / 24)}일 ${hours % 24}시간 전`;
  return { text, overdue: hours >= 24, pending: true };
}

export function BulkQuotesTable({
  quotes,
  searchQuery,
}: {
  quotes: Quote[];
  searchQuery?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [pending, start] = useTransition();

  const runCancel = () => {
    const reason = cancelReason.trim();
    if (!reason) {
      toast.error("취소 사유를 입력해주세요.");
      return;
    }
    const ids = Array.from(selected);
    start(async () => {
      const res = await bulkCancelQuotes(ids, reason);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${res.count ?? ids.length}건을 취소하고 안내 메일을 발송했습니다`);
      setCancelOpen(false);
      setCancelReason("");
      setSelected(new Set());
      router.refresh();
    });
  };

  const runDelete = () => {
    const ids = Array.from(selected);
    start(async () => {
      const res = await softDeleteQuotes(ids);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${res.count ?? ids.length}건을 삭제했습니다`);
      setDeleteOpen(false);
      setSelected(new Set());
      router.refresh();
    });
  };

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
    if (selected.size === quotes.length) setSelected(new Set());
    else setSelected(new Set(quotes.map((q) => q.id)));
  };

  const allSelected = quotes.length > 0 && selected.size === quotes.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <>
      <BulkSelectBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        statusOptions={QUOTE_STATUSES}
        onApply={async (status) => {
          const ids = Array.from(selected);
          return await bulkUpdateQuoteStatus(ids, status);
        }}
        onCancelClick={() => setCancelOpen(true)}
        onDeleteClick={() => setDeleteOpen(true)}
      />

      {/* 일괄 취소: 공유 사유 입력 → 각 고객 언어로 취소 메일 */}
      <Dialog
        open={cancelOpen}
        onOpenChange={(v) => {
          setCancelOpen(v);
          if (!v) setCancelReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>견적 {selected.size}건 일괄 취소</DialogTitle>
            <DialogDescription>
              선택한 견적 전체에 동일한 사유로 취소 안내 메일이 발송됩니다. 이미 취소된 건은 제외됩니다.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="고객에게 전달될 취소 사유"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)} disabled={pending}>
              닫기
            </Button>
            <Button
              onClick={runCancel}
              disabled={pending || !cancelReason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {pending ? "취소 중..." : `${selected.size}건 취소`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuoteDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        count={selected.size}
        pending={pending}
        onConfirm={runDelete}
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
              <TableHead>회사명</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>가공종류</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>접수일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => {
              const isSelected = selected.has(q.id);
              return (
                <TableRow
                  key={q.id}
                  className={`group hover:bg-gray-50/50 ${isSelected ? "bg-blue-50/40" : ""}`}
                >
                  <TableCell className="admin-card-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRow(q.id);
                      }}
                      aria-label={`${q.company_name} 선택`}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="text-brand-blue hover:text-brand-blue-hover group-hover:underline font-medium transition-colors"
                    >
                      <HighlightText text={q.company_name} query={searchQuery} />
                    </Link>
                  </TableCell>
                  <TableCell data-label="담당자">
                    <HighlightText text={q.contact_name} query={searchQuery} />
                  </TableCell>
                  <TableCell data-label="가공종류">
                    {q.processing_type === "콜백요청" ? (
                      <span className="inline-flex items-center gap-1 text-purple-700 font-bold">📞 콜백</span>
                    ) : (
                      <span className="font-medium">{q.processing_type}</span>
                    )}
                  </TableCell>
                  <TableCell data-label="상태">
                    <StatusBadge status={q.status} type="quote" />
                  </TableCell>
                  <TableCell data-label="접수일" className="text-sm">
                    {(() => {
                      const e = formatElapsed(q.created_at, q.status);
                      if (!e.pending) return <span className="text-gray-600 font-medium tabular-nums">{e.text}</span>;
                      return (
                        <span className={e.overdue ? "text-red-700 font-bold" : "text-amber-700 font-semibold"}>
                          {e.text}
                          {e.overdue && (
                            <span className="ml-1 text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              초과
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {quotes.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-100 text-[13px] text-gray-500 tabular-nums font-medium">
            총 {quotes.length}건
          </div>
        )}
      </div>
    </>
  );
}
