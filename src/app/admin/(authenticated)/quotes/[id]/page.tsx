import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getQuoteAttachmentUrls } from "../actions";
import { QuoteStatusForm } from "./quote-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { InfoGrid } from "@/components/admin/info-grid";
import { CopyButton } from "@/components/admin/copy-button";
import { Button } from "@/components/ui/button";
import { Download, ClipboardList, ExternalLink } from "lucide-react";

export const metadata = { title: "견적 상세", description: "견적 요청 상세 정보", robots: "noindex, nofollow" };

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!quote) notFound();

  const attachments = await getQuoteAttachmentUrls(id);

  // 이 견적에 연결된 발주가 있는지
  const { data: existingWorkOrder } = await supabase
    .from("work_orders")
    .select("id, order_number, status")
    .eq("quote_id", id)
    .is("deleted_at", null)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <DetailPageHeader backHref="/admin/quotes" title="견적 상세" subtitle={`${new Date(quote.created_at).toLocaleDateString("ko-KR")} 접수`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">
                  {quote.company_name}
                </h2>
                <p className="text-[13px] text-gray-600 mt-1 font-medium">{quote.contact_name} · {quote.processing_type || "미지정"}</p>
              </div>
              <div className="flex items-center gap-2">
                {quote.processing_type === "콜백요청" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13px] font-bold bg-purple-100 text-purple-700">
                    📞 콜백
                  </span>
                )}
                <StatusBadge status={quote.status} type="quote" />
              </div>
            </div>

            <InfoGrid items={[
              { label: "회사명", value: quote.company_name },
              { label: "담당자", value: quote.contact_name },
              { label: "연락처", value: quote.phone ? (
                <span className="flex items-center gap-2">
                  <a href={`tel:${quote.phone}`} className="text-brand-blue hover:underline">{quote.phone}</a>
                  <CopyButton text={quote.phone} />
                </span>
              ) : null },
              { label: "이메일", value: quote.email ? (
                <span className="flex items-center gap-2">
                  <a
                    href={`mailto:${quote.email}?subject=${encodeURIComponent(`[나진테크] 견적 회신 — ${quote.company_name}`)}&body=${encodeURIComponent(`${quote.contact_name} 님 안녕하세요,\n\n나진테크 견적 담당자입니다.\n요청하신 견적을 아래와 같이 회신 드립니다.\n\n───\n• 가공종류: ${quote.processing_type}${quote.material ? `\n• 소재: ${quote.material}` : ""}${quote.quantity ? `\n• 수량: ${quote.quantity}` : ""}${quote.deadline ? `\n• 납기: ${new Date(quote.deadline).toLocaleDateString("ko-KR")}` : ""}\n───\n\n(견적 내용 입력)\n\n감사합니다.\n나진테크\n055-367-2596\n`)}`}
                    className="text-brand-blue hover:underline"
                  >
                    {quote.email}
                  </a>
                  <CopyButton text={quote.email} />
                </span>
              ) : null },
              { label: "가공종류", value: quote.processing_type },
              { label: "소재", value: quote.material },
              { label: "수량", value: quote.quantity },
              { label: "납기일", value: quote.deadline ? new Date(quote.deadline).toLocaleDateString("ko-KR") : null },
              { label: "상세 설명", value: quote.description ? <span className="whitespace-pre-wrap">{quote.description}</span> : null, fullWidth: true },
              { label: "접수일", value: new Date(quote.created_at).toLocaleString("ko-KR") },
            ]} />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-brand-navy">
                  첨부파일 <span className="text-gray-600 font-bold tabular-nums ml-1">{attachments.length}</span>
                </h2>
              </div>
              <div className="p-5 space-y-2">
                {attachments.map((att) => (
                  <div key={att.id}>
                    {att.signedUrl ? (
                      <a
                        href={att.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Download className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-brand-charcoal truncate">
                            {att.fileName}
                            <span className="ml-1.5 text-[11px] uppercase font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded tracking-wider">
                              {att.fileName.split(".").pop()}
                            </span>
                          </p>
                          {att.fileSize && (
                            <p className="text-[13px] text-gray-500 font-medium tabular-nums mt-0.5">{(att.fileSize / 1024).toFixed(0)} KB</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 py-3 px-4 rounded-lg border border-gray-200 opacity-50">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Download className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 min-w-0 truncate font-medium">{att.fileName} (다운로드 불가)</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* 발주 연결 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-brand-navy flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-copper" />
                발주
              </h2>
            </div>
            <div className="p-6">
              {existingWorkOrder ? (
                <Link href={`/admin/work-orders/${existingWorkOrder.id}`} className="block group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-brand-copper font-bold">
                      {existingWorkOrder.order_number}
                    </span>
                    <StatusBadge type="work_order" status={existingWorkOrder.status} />
                  </div>
                  <p className="text-[13px] text-gray-600 font-semibold group-hover:text-brand-navy inline-flex items-center gap-1">
                    발주 상세 열기
                    <ExternalLink className="w-3.5 h-3.5" />
                  </p>
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                    이 견적을 발주로 변환하면 상태 추적과 도면 관리가 가능합니다.
                  </p>
                  <Link href={`/admin/work-orders/new?from=${quote.id}`} className="block">
                    <Button className="w-full bg-brand-copper hover:bg-brand-copper-light text-white gap-1.5">
                      <ClipboardList className="w-4 h-4" />
                      이 견적으로 발주 생성
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit">
            <div className="px-6 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-brand-navy">상태 관리</h2>
            </div>
            <div className="p-6">
              <QuoteStatusForm
                quoteId={quote.id}
                currentStatus={quote.status}
                currentMemo={quote.admin_memo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
