import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Package, Briefcase } from "lucide-react";

export const metadata = { title: "대시보드" };

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: pendingQuotes },
    { count: pendingApps },
    { count: activeProducts },
    { count: activeJobs },
    { count: publishedNotices },
    { data: recentQuotes },
    { data: recentApps },
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("status", "접수")
      .is("deleted_at", null),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "서류검토")
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("job_postings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("notices")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .is("deleted_at", null),
    supabase
      .from("quotes")
      .select("id, company_name, contact_name, processing_type, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("applications")
      .select("id, name, position, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">대시보드</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link
          href="/admin/quotes"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-xs text-gray-500">미처리 견적</p>
          <p className="text-2xl font-bold text-[#3182CE] mt-1">
            {pendingQuotes || 0}건
          </p>
        </Link>
        <Link
          href="/admin/applications"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-xs text-gray-500">미처리 지원서</p>
          <p className="text-2xl font-bold text-[#3182CE] mt-1">
            {pendingApps || 0}건
          </p>
        </Link>
        <Link
          href="/admin/products"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-xs text-gray-500">활성 제품</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">
            {activeProducts || 0}개
          </p>
        </Link>
        <Link
          href="/admin/job-postings"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-xs text-gray-500">활성 채용공고</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">
            {activeJobs || 0}개
          </p>
        </Link>
        <Link
          href="/admin/notices"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-xs text-gray-500">공개 공지</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">
            {publishedNotices || 0}개
          </p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/notices/new">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <FileText className="w-4 h-4" />
            새 공지 작성
          </Button>
        </Link>
        <Link href="/admin/products/new">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <Package className="w-4 h-4" />
            새 제품 등록
          </Button>
        </Link>
        <Link href="/admin/job-postings/new">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <Briefcase className="w-4 h-4" />
            새 채용공고
          </Button>
        </Link>
      </div>

      {/* Recent Quotes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1B2A4A]">최근 견적 요청</h2>
          <Link
            href="/admin/quotes"
            className="text-sm text-[#3182CE] hover:underline"
          >
            전체 보기
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>회사명</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>가공종류</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>접수일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentQuotes && recentQuotes.length > 0 ? (
              recentQuotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="text-[#3182CE] hover:underline"
                    >
                      {q.company_name}
                    </Link>
                  </TableCell>
                  <TableCell>{q.contact_name}</TableCell>
                  <TableCell>{q.processing_type}</TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} type="quote" />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(q.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  견적 요청이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1B2A4A]">최근 지원서</h2>
          <Link
            href="/admin/applications"
            className="text-sm text-[#3182CE] hover:underline"
          >
            전체 보기
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>포지션</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>지원일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentApps && recentApps.length > 0 ? (
              recentApps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="text-[#3182CE] hover:underline"
                    >
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell>{a.position}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} type="application" />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(a.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  지원서가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
