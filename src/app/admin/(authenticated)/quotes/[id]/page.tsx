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
      <div className="flex items-center gap-4">
        <Link href="/admin/quotes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-[#1B2A4A]">견적 상세</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-base font-semibold text-[#1B2A4A]">
                  {quote.company_name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{quote.contact_name} · {quote.processing_type || "미지정"}</p>
              </div>
              <StatusBadge status={quote.status} type="quote" />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">회사명</dt>
                <dd className="mt-1 text-sm font-medium">{quote.company_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">담당자</dt>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">
                첨부파일
              </h2>
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li key={att.id}>
                    {att.signedUrl ? (
                      <a
                        href={att.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#3182CE] hover:underline text-sm"
                      >
                        <Download className="w-4 h-4" />
                        {att.fileName}
                        {att.fileSize && (
                          <span className="text-gray-400">
                            ({(att.fileSize / 1024).toFixed(0)} KB)
                          </span>
                        )}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {att.fileName} (다운로드 불가)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Status Change Panel */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-fit">
          <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-[#1B2A4A]">상태 관리</h2>
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
