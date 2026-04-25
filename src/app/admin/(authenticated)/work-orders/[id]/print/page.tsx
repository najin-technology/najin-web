import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { getWorkOrderAttachments } from "../../actions";
import { dDayLabel, formatPhoneKr } from "@/lib/format-date";
import { PrintTrigger } from "./print-trigger";
import "./print.css";

export const metadata = { title: "작업지시서", robots: "noindex, nofollow" };

export default async function WorkOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!order) notFound();

  const attachments = await getWorkOrderAttachments(id);
  const dd = dDayLabel(order.deadline);
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* 인쇄 시 숨김 — 화면 컨트롤 */}
      <div className="screen-only sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/work-orders/${order.id}`}
            className="text-xs text-gray-500 hover:text-brand-navy"
          >
            ← 발주 상세로
          </Link>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs font-mono text-brand-copper">{order.order_number}</span>
        </div>
        <PrintTrigger />
      </div>

      <div className="print-page max-w-[210mm] mx-auto bg-white p-12 shadow-md print:shadow-none print:p-8 print:max-w-full">
        {/* Header */}
        <header className="border-b-2 border-brand-navy pb-4 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <h1 className="text-2xl font-bold text-brand-navy tracking-tight">작업 지시서</h1>
            <p className="font-mono text-sm text-brand-copper">{order.order_number}</p>
          </div>
          <div className="flex items-baseline justify-between text-xs text-gray-600">
            <p>나진테크 · NAJIN TECHNOLOGY</p>
            <p>발행일: {today}</p>
          </div>
        </header>

        {/* Top — 고객사/제품/마감 */}
        <section className="grid grid-cols-3 gap-4 mb-6">
          <div className="border-r border-gray-200 pr-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">고객사</p>
            <p className="text-base font-semibold text-brand-navy">{order.customer_name}</p>
            {order.contact_name && (
              <p className="text-xs text-gray-500 mt-1">담당: {order.contact_name}</p>
            )}
            {order.phone && (
              <p className="text-xs text-gray-500">{formatPhoneKr(order.phone)}</p>
            )}
          </div>
          <div className="border-r border-gray-200 pr-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">제품</p>
            <p className="text-base font-semibold text-brand-navy">{order.product_name}</p>
            {order.processing_type && (
              <p className="text-xs text-gray-500 mt-1">{order.processing_type}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">마감</p>
            {order.deadline ? (
              <>
                <p className="text-base font-semibold text-brand-navy">
                  {new Date(order.deadline).toLocaleDateString("ko-KR")}
                </p>
                <p
                  className={`text-xs mt-1 font-semibold ${
                    dd.tone === "overdue" ? "text-rose-700" : dd.tone === "urgent" ? "text-amber-700" : "text-gray-500"
                  }`}
                >
                  {dd.label}
                </p>
              </>
            ) : (
              <p className="text-base text-gray-400">미정</p>
            )}
          </div>
        </section>

        {/* Spec table */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-brand-navy mb-2 border-b border-gray-300 pb-1">
            가공 사양
          </h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-medium text-gray-500 w-32">소재</td>
                <td className="py-2">{order.material || "—"}</td>
                <td className="py-2 pr-4 font-medium text-gray-500 w-32">수량</td>
                <td className="py-2">{order.quantity || "—"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-medium text-gray-500">우선순위</td>
                <td className="py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      order.priority === "높음"
                        ? "bg-rose-100 text-rose-700"
                        : order.priority === "낮음"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.priority}
                  </span>
                </td>
                <td className="py-2 pr-4 font-medium text-gray-500">담당자</td>
                <td className="py-2">{order.assignee || "—"}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-gray-500">상태</td>
                <td className="py-2" colSpan={3}>{order.status}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 작업 지시 */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-brand-navy mb-2 border-b border-gray-300 pb-1">
            작업 지시 / 요구사항
          </h2>
          <div className="text-sm text-brand-charcoal whitespace-pre-wrap min-h-[80px]">
            {order.description?.trim() || (
              <span className="text-gray-300 italic">— 추가 지시사항 없음 —</span>
            )}
          </div>
        </section>

        {/* 첨부 도면 목록 */}
        {attachments.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-brand-navy mb-2 border-b border-gray-300 pb-1">
              첨부 도면 / 자료 ({attachments.length})
            </h2>
            <ul className="text-sm space-y-1">
              {attachments.map((att, i) => (
                <li key={att.id} className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-gray-400 w-6">{i + 1}.</span>
                  <span className="font-mono">{att.fileName}</span>
                  <span className="text-[10px] uppercase font-medium text-gray-400">
                    .{att.fileName.split(".").pop()}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {(att.fileSize / 1024 / 1024 < 1
                      ? `${(att.fileSize / 1024).toFixed(0)} KB`
                      : `${(att.fileSize / 1024 / 1024).toFixed(1)} MB`)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 서명 영역 */}
        <section className="mt-12 grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-12">발주 담당</p>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-xs text-gray-400">서명 / 일자</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-12">작업 담당</p>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-xs text-gray-400">서명 / 일자</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-12">검수 담당</p>
            <div className="border-t border-gray-300 pt-2">
              <p className="text-xs text-gray-400">서명 / 일자</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-gray-200 text-[10px] text-gray-400 flex items-center justify-between">
          <p>경상남도 양산시 산막공단남14길 170 · 055-367-2596</p>
          <p>www.najin-tech.com</p>
        </footer>
      </div>
    </div>
  );
}
