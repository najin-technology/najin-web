import { createSupabaseServerClient } from "@/lib/supabase-server";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { CsvExportButton } from "@/components/admin/csv-export";
import { FileText } from "lucide-react";
import { BulkQuotesTable } from "./bulk-quotes-table";

export const metadata = { title: "견적 관리", description: "고객 견적 요청 관리", robots: "noindex, nofollow" };

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const { q: searchQuery, status, type } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("quotes")
    .select("id, company_name, contact_name, phone, email, processing_type, status, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery) query = query.or(`company_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`);
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("processing_type", type);

  const { data: quotes } = await query;

  return (
    <div className="space-y-6">
      <ListPageHeader title="견적 관리" count={quotes?.length} />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchFilterBar
            searchPlaceholder="회사명/담당자 검색..."
            resultCount={quotes?.length}
            filters={[
              {
                key: "status",
                label: "전체 상태",
                options: [
                  { value: "접수", label: "접수" },
                  { value: "검토중", label: "검토중" },
                  { value: "견적발송", label: "견적발송" },
                  { value: "완료", label: "완료" },
                ],
              },
              {
                key: "type",
                label: "전체 유형",
                options: [
                  { value: "콜백요청", label: "📞 콜백요청" },
                  { value: "우레탄 성형", label: "우레탄 성형" },
                  { value: "합성수지 가공", label: "합성수지 가공" },
                  { value: "CNC 정밀가공", label: "CNC 정밀가공" },
                  { value: "금형 제작", label: "금형 제작" },
                  { value: "EV 부품", label: "EV 부품" },
                ],
              },
            ]}
          />
        </div>
        <CsvExportButton
          filename="quotes"
          headers={["회사명", "담당자", "연락처", "이메일", "가공종류", "상태", "접수일"]}
          rows={(quotes || []).map((q) => [
            q.company_name || "",
            q.contact_name || "",
            q.phone || "",
            q.email || "",
            q.processing_type || "",
            q.status || "",
            new Date(q.created_at).toLocaleDateString("ko-KR"),
          ])}
        />
      </div>

      {quotes && quotes.length > 0 ? (
        <BulkQuotesTable quotes={quotes} searchQuery={searchQuery} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            message="견적 요청이 없습니다."
            description="고객이 웹사이트에서 견적을 요청하면 여기에 표시됩니다."
            icon={FileText}
          />
        </div>
      )}
    </div>
  );
}
