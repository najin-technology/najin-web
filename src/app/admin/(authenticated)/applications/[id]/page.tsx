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
      <div className="flex items-center gap-4">
        <Link href="/admin/applications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-[#1B2A4A]">지원서 상세</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-base font-semibold text-[#1B2A4A]">
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">
                첨부파일 (이력서)
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
