import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { WorkOrderForm } from "./work-order-form";
import { WorkOrderStatusForm } from "./status-form";
import { AttachmentsSection } from "./attachments-section";
import {
  getWorkOrderAttachments,
  getWorkOrderStatusHistory,
} from "../actions";
import { ExternalLink, History, Printer } from "lucide-react";
import { dDayLabel } from "@/lib/format-date";

export const metadata = { title: "발주 상세", robots: "noindex, nofollow" };

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: order } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!order) notFound();

  const [attachments, history] = await Promise.all([
    getWorkOrderAttachments(id),
    getWorkOrderStatusHistory(id),
  ]);

  const closed = order.status === "완료" || order.status === "출하";
  const dd = dDayLabel(order.deadline);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DetailPageHeader
          backHref="/admin/work-orders"
          title={
            <span className="flex items-center gap-3">
              <span className="font-mono text-sm text-brand-copper">{order.order_number}</span>
              <span>{order.product_name}</span>
              {!closed && order.deadline && dd.label && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums ${
                    dd.tone === "overdue"
                      ? "bg-rose-100 text-rose-700"
                      : dd.tone === "urgent"
                        ? "bg-amber-100 text-amber-700"
                        : dd.tone === "soon"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {dd.label}
                </span>
              )}
            </span>
          }
          subtitle={`${order.customer_name} · ${new Date(order.created_at).toLocaleDateString("ko-KR")} 작성`}
        />
        <Link href={`/admin/work-orders/${order.id}/print`}>
          <Button variant="outline" className="gap-1.5">
            <Printer className="w-4 h-4" />
            작업지시서 인쇄
          </Button>
        </Link>
      </div>

      {order.quote_id && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-blue-800">
            이 발주는 견적에서 변환되었습니다.
          </p>
          <Link
            href={`/admin/quotes/${order.quote_id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            원본 견적 보기 <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-brand-navy">발주 정보</h2>
              <StatusBadge type="work_order" status={order.status} />
            </div>
            <WorkOrderForm
              order={{
                id: order.id,
                customer_name: order.customer_name,
                contact_name: order.contact_name,
                phone: order.phone,
                product_name: order.product_name,
                processing_type: order.processing_type,
                material: order.material,
                quantity: order.quantity,
                deadline: order.deadline,
                priority: order.priority,
                description: order.description,
                internal_memo: order.internal_memo,
                assignee: order.assignee,
              }}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-brand-navy mb-4">
              도면 / 작업지시서 첨부 <span className="text-gray-400 font-normal">{attachments.length}</span>
            </h2>
            <AttachmentsSection
              workOrderId={order.id}
              attachments={attachments}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-brand-navy mb-4">상태 관리</h2>
            <WorkOrderStatusForm
              workOrderId={order.id}
              currentStatus={order.status}
            />
          </div>

          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-gray-400" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  변경 이력
                </h2>
              </div>
              <ul className="space-y-2.5">
                {history.map((h) => {
                  const details = (h.details ?? {}) as Record<string, unknown>;
                  const isCreate = h.action === "create";
                  return (
                    <li key={h.id} className="text-xs">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-brand-charcoal">
                          {isCreate ? "발주 생성" : `${details.from} → ${details.to}`}
                        </span>
                        <span className="text-[10px] tabular-nums text-gray-400">
                          {formatRelative(h.created_at)}
                        </span>
                      </div>
                      {h.user_email && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {h.user_email}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
