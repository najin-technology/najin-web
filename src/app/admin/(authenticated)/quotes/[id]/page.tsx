import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getQuoteAttachmentUrls } from "../actions";
import { QuoteStatusForm } from "./quote-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

export const metadata = { title: "견적 상세" };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/quotes">
          <Button variant="ghost" size="icon-sm" className="rounded-lg" aria-label="뒤로 가기">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-brand-navy">견적 상세</h1>
          <p className="text-xs text-gray-400">
            {new Date(quote.created_at).toLocaleDateString("ko-KR")} 접수
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-brand-navy">
                  {quote.company_name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{quote.contact_name} · {quote.processing_type || "미지정"}</p>
              </div>
              <StatusBadge status={quote.status} type="quote" />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              <div>
                <dt className="text-xs text-gray-400 font-medium">회사명</dt>
                <dd className="mt-1 text-sm font-medium">{quote.company_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium">담당자</dt>
                <dd className="mt-1 text-sm font-medium">{quote.contact_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">연락처</dt>
                <dd className="mt-1 text-sm font-medium">{quote.phone || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">이메일</dt>
                <dd className="mt-1 text-sm font-medium">{quote.email || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">가공종류</dt>
                <dd className="mt-1 text-sm font-medium">
                  {quote.processing_type || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">소재</dt>
                <dd className="mt-1 text-sm font-medium">{quote.material || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">수량</dt>
                <dd className="mt-1 text-sm font-medium">{quote.quantity || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">납기일</dt>
                <dd className="mt-1 text-sm font-medium">
                  {quote.deadline
                    ? new Date(quote.deadline).toLocaleDateString("ko-KR")
                    : "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">상세 설명</dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {quote.description || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">접수일</dt>
                <dd className="mt-1 text-sm text-gray-600">
                  {new Date(quote.created_at).toLocaleString("ko-KR")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-brand-navy">
                  첨부파일 <span className="text-gray-400 font-normal ml-1">{attachments.length}</span>
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {attachments.map((att) => (
                  <div key={att.id}>
                    {att.signedUrl ? (
                      <a
                        href={att.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Download className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-700 truncate">{att.fileName}</p>
                          {att.fileSize && (
                            <p className="text-xs text-gray-400">{(att.fileSize / 1024).toFixed(0)} KB</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 opacity-50">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Download className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">{att.fileName} (다운로드 불가)</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Change Panel */}
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
  );
}
