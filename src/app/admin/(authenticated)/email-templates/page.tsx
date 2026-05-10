import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { Mail, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "메일 자동발송",
  description: "고객 자동 발송 메일 템플릿 관리",
  robots: "noindex, nofollow",
};

type EmailTemplateRow = {
  key: string;
  trigger_label_ko: string;
  subject_ko: string;
  enabled: boolean;
  updated_at: string | null;
};

export default async function EmailTemplatesPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: templates } = await supabase
    .from("email_templates")
    .select("key, trigger_label_ko, subject_ko, enabled, updated_at")
    .order("key", { ascending: true });

  const rows = (templates ?? []) as EmailTemplateRow[];

  return (
    <div className="space-y-6">
      <ListPageHeader title="메일 자동발송" count={rows.length} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table className="admin-card-table">
          <TableHeader>
            <TableRow>
              <TableHead>키 / 발송 시점</TableHead>
              <TableHead>제목 (KO)</TableHead>
              <TableHead className="w-[120px]">활성화</TableHead>
              <TableHead className="w-[160px]">최근 수정</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((t) => (
                <TableRow key={t.key} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium text-brand-navy">{t.trigger_label_ko}</div>
                    <code className="text-[12px] text-gray-500">{t.key}</code>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 max-w-[280px] truncate">
                    {t.subject_ko || "—"}
                  </TableCell>
                  <TableCell data-label="활성화">
                    {t.enabled ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-bold border border-gray-200">
                        비활성
                      </span>
                    )}
                  </TableCell>
                  <TableCell data-label="최근 수정" className="text-sm text-gray-500">
                    {t.updated_at
                      ? new Date(t.updated_at).toLocaleString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell data-label="관리">
                    <Link href={`/admin/email-templates/${t.key}`}>
                      <Button variant="ghost" size="icon-sm" aria-label="편집">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    message="등록된 템플릿이 없습니다."
                    description="DB seed 가 완료되었는지 확인해주세요."
                    icon={Mail}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
