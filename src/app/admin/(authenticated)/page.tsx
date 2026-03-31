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
import {
  Plus,
  FileText,
  Package,
  Briefcase,
  Inbox,
  Users,
  Bell,
  AlertCircle,
} from "lucide-react";

export const metadata = { title: "대시보드" };

function relativeTime(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return "방금";
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

function isStale(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() > 86400000; // > 24h
}

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
      <h1 className="text-lg font-bold text-[#1B2A4A]">대시보드</h1>

      {/* Action Required + Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Urgent cards — warm accent for items needing action */}
        <Link
          href="/admin/quotes"
          className={`rounded-lg p-5 hover:shadow-md transition-shadow border-l-4 ${
            (pendingQuotes || 0) > 0
              ? "bg-amber-50 border-l-amber-500 border border-amber-200"
              : "bg-white border-l-gray-200 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-medium text-gray-500">미처리 견적</p>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">
            {pendingQuotes || 0}<span className="text-sm font-normal text-gray-400 ml-0.5">건</span>
          </p>
        </Link>
        <Link
          href="/admin/applications"
          className={`rounded-lg p-5 hover:shadow-md transition-shadow border-l-4 ${
            (pendingApps || 0) > 0
              ? "bg-amber-50 border-l-amber-500 border border-amber-200"
              : "bg-white border-l-gray-200 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-medium text-gray-500">미처리 지원서</p>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">
            {pendingApps || 0}<span className="text-sm font-normal text-gray-400 ml-0.5">건</span>
          </p>
        </Link>

        {/* Informational cards — neutral */}
        <Link
          href="/admin/products"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-medium text-gray-500">활성 제품</p>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            {activeProducts || 0}<span className="text-sm font-normal text-gray-400 ml-0.5">개</span>
          </p>
        </Link>
        <Link
          href="/admin/job-postings"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-green-500" />
            <p className="text-xs font-medium text-gray-500">활성 채용공고</p>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            {activeJobs || 0}<span className="text-sm font-normal text-gray-400 ml-0.5">개</span>
          </p>
        </Link>
        <Link
          href="/admin/notices"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-purple-500" />
            <p className="text-xs font-medium text-gray-500">공개 공지</p>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            {publishedNotices || 0}<span className="text-sm font-normal text-gray-400 ml-0.5">개</span>
          </p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/notices/new">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            새 공지 작성
          </Button>
        </Link>
        <Link href="/admin/products/new">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            새 제품 등록
          </Button>
        </Link>
        <Link href="/admin/job-postings/new">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            새 채용공고
          </Button>
        </Link>
      </div>

      {/* Recent Quotes */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">최근 견적 요청</h2>
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
                <TableRow key={q.id} className={q.status === "접수" && isStale(q.created_at) ? "bg-amber-50/50" : ""}>
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="text-[#3182CE] hover:underline font-medium"
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
                    {relativeTime(q.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="text-center py-6 text-sm text-gray-400">견적 요청이 없습니다</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">최근 지원서</h2>
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
                <TableRow key={a.id} className={a.status === "서류검토" && isStale(a.created_at) ? "bg-amber-50/50" : ""}>
                  <TableCell>
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="text-[#3182CE] hover:underline font-medium"
                    >
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell>{a.position}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} type="application" />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {relativeTime(a.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="text-center py-6 text-sm text-gray-400">지원서가 없습니다</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
