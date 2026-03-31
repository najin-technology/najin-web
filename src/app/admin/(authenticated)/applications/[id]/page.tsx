import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getResumeUrl } from "../actions";
import { ApplicationStatusForm } from "./application-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

export const metadata = { title: "지원서 상세" };

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!application) notFound();

  const attachments = await getResumeUrl(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/applications">
          <Button variant="ghost" size="icon-sm" className="rounded-lg" aria-label="뒤로 가기">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-brand-navy">지원서 상세</h1>
          <p className="text-xs text-gray-400">
            {new Date(application.created_at).toLocaleDateString("ko-KR")} 지원
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Application Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-brand-navy">
                  {application.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{application.position || "포지션 미지정"} · {application.email || ""}</p>
              </div>
              <StatusBadge status={application.status} type="application" />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              <div>
                <dt className="text-xs text-gray-400">이름</dt>
                <dd className="mt-1 text-sm font-medium">{application.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">연락처</dt>
                <dd className="mt-1 text-sm font-medium">
                  {application.phone || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">이메일</dt>
                <dd className="mt-1 text-sm font-medium">
                  {application.email || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">지원 포지션</dt>
                <dd className="mt-1 text-sm font-medium">
                  {application.position || "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">자기소개서</dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {application.cover_letter || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">지원일</dt>
                <dd className="mt-1 text-sm text-gray-600">
                  {new Date(application.created_at).toLocaleString("ko-KR")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Resume Attachments */}
          {attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-brand-navy">
                  첨부파일 (이력서) <span className="text-gray-400 font-normal ml-1">{attachments.length}</span>
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
          <ApplicationStatusForm
            applicationId={application.id}
            currentStatus={application.status}
            currentMemo={application.admin_memo}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
