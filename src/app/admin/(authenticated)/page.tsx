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
  Package,
  Briefcase,
  Inbox,
  Users,
  Bell,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { StatusProgress } from "@/components/admin/status-progress";

export const metadata = { title: "대시보드", description: "나진테크 관리자 대시보드", robots: "noindex, nofollow" };

function relativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    if (hours < 1) return "방금";
    return `오늘 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
  if (isYesterday) return "어제";
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function isStale(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() > 86400000; // > 24h
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "좋은 아침입니다";
  if (h < 18) return "좋은 오후입니다";
  return "좋은 저녁입니다";
}

function formatToday() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: pendingQuotes },
    { count: pendingCallbacks },
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
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("status", "접수")
      .eq("processing_type", "콜백요청")
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

  const hasUrgent = (pendingQuotes || 0) > 0 || (pendingApps || 0) > 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-xl font-bold text-brand-navy tracking-tight">{getGreeting()}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{formatToday()}</p>
        <p className="text-xs text-gray-400 mt-1">현재 운영 현황을 한눈에 확인하세요</p>
        {((pendingQuotes || 0) > 0 || (pendingApps || 0) > 0) && (
          <p className="text-xs text-gray-500 tabular-nums mt-1">
            {(pendingQuotes || 0) > 0 && `처리 대기 견적 ${pendingQuotes}건`}
            {(pendingCallbacks || 0) > 0 && ` (콜백 ${pendingCallbacks}건)`}
            {(pendingQuotes || 0) > 0 && (pendingApps || 0) > 0 && " · "}
            {(pendingApps || 0) > 0 && `검토 대기 지원서 ${pendingApps}건`}
          </p>
        )}
      </div>

      {/* All caught up message */}
      {!hasUrgent && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-sm text-emerald-800">모든 견적과 지원서가 처리되었습니다</p>
        </div>
      )}

      {/* Urgent Action Banner — only when pending items exist */}
      {hasUrgent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/quotes"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-white/80">미처리 견적</p>
                </div>
                <p className="text-3xl font-bold tabular-nums stat-number">
                  {pendingQuotes || 0}<span className="text-base font-normal text-white/60 ml-1">건</span>
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
            </div>
            <span className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            {(pendingQuotes || 0) > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-pulse ring-2 ring-white/30" />
            )}
          </Link>
          <Link
            href="/admin/applications"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-white/80">미처리 지원서</p>
                </div>
                <p className="text-3xl font-bold tabular-nums stat-number">
                  {pendingApps || 0}<span className="text-base font-normal text-white/60 ml-1">건</span>
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
            </div>
            <span className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            {(pendingApps || 0) > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-pulse ring-2 ring-white/30" />
            )}
          </Link>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {!hasUrgent && (
          <>
            <Link
              href="/admin/quotes"
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                <Inbox className="w-[18px] h-[18px] text-amber-600" />
              </div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">미처리 견적</p>
              <p className="text-2xl font-bold text-brand-navy tabular-nums stat-number">
                {pendingQuotes || 0}<span className="text-xs font-normal text-gray-400 ml-0.5">건</span>
              </p>
            </Link>
            <Link
              href="/admin/applications"
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center mb-3">
                <Users className="w-[18px] h-[18px] text-rose-600" />
              </div>
              <p className="text-xs font-medium text-gray-400 mb-0.5">미처리 지원서</p>
              <p className="text-2xl font-bold text-brand-navy tabular-nums stat-number">
                {pendingApps || 0}<span className="text-xs font-normal text-gray-400 ml-0.5">건</span>
              </p>
            </Link>
          </>
        )}
        <Link
          href="/admin/products"
          className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <Package className="w-[18px] h-[18px] text-blue-600" />
          </div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">활성 제품</p>
          <p className="text-2xl font-bold text-gray-700 tabular-nums stat-number">
            {activeProducts || 0}<span className="text-xs font-normal text-gray-400 ml-0.5">개</span>
          </p>
        </Link>
        <Link
          href="/admin/job-postings"
          className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
            <Briefcase className="w-[18px] h-[18px] text-emerald-600" />
          </div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">활성 채용공고</p>
          <p className="text-2xl font-bold text-gray-700 tabular-nums stat-number">
            {activeJobs || 0}<span className="text-xs font-normal text-gray-400 ml-0.5">개</span>
          </p>
        </Link>
        <Link
          href="/admin/notices"
          className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
            <Bell className="w-[18px] h-[18px] text-violet-600" />
          </div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">공개 소식</p>
          <p className="text-2xl font-bold text-gray-700 tabular-nums stat-number">
            {publishedNotices || 0}<span className="text-xs font-normal text-gray-400 ml-0.5">개</span>
          </p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/notices/new">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" title="새 소식을 작성합니다">
            <Plus className="w-4 h-4" />
            새 소식 작성
          </Button>
        </Link>
        <Link href="/admin/products/new">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" title="새 제품을 등록합니다">
            <Plus className="w-4 h-4" />
            새 제품 등록
          </Button>
        </Link>
        <Link href="/admin/job-postings/new">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" title="새 채용공고를 작성합니다">
            <Plus className="w-4 h-4" />
            새 채용공고
          </Button>
        </Link>
      </div>

      {/* Recent Activity — 2-column on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* Recent Quotes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-brand-navy">최근 견적 요청</h2>
          <Link
            href="/admin/quotes"
            className="text-xs font-medium text-brand-blue hover:text-brand-blue-hover transition-colors flex items-center gap-1"
          >
            전체 보기
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentQuotes && recentQuotes.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100">
            <StatusProgress items={recentQuotes} />
          </div>
        )}
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
                      className="text-brand-blue hover:text-brand-blue-hover font-medium transition-colors"
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
                    <span className="flex items-center gap-1" title={new Date(q.created_at).toLocaleString("ko-KR")}>
                      {relativeTime(q.created_at)}
                      {q.status === "접수" && isStale(q.created_at) && (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="text-center py-8 text-sm text-gray-400">아직 견적 요청이 없습니다</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-brand-navy">최근 지원서</h2>
          <Link
            href="/admin/applications"
            className="text-xs font-medium text-brand-blue hover:text-brand-blue-hover transition-colors flex items-center gap-1"
          >
            전체 보기
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentApps && recentApps.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100">
            <StatusProgress items={recentApps} />
          </div>
        )}
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
                      className="text-brand-blue hover:text-brand-blue-hover font-medium transition-colors"
                    >
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell>{a.position}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} type="application" />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <span className="flex items-center gap-1" title={new Date(a.created_at).toLocaleString("ko-KR")}>
                      {relativeTime(a.created_at)}
                      {a.status === "서류검토" && isStale(a.created_at) && (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="text-center py-8 text-sm text-gray-400">아직 지원서가 없습니다</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      </div>{/* end 2-column grid */}
    </div>
  );
}
