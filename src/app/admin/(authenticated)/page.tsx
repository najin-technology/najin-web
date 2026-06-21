import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  Briefcase,
  Inbox,
  Users,
  Bell,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const metadata = { title: "대시보드", description: "나진테크 관리자 대시보드", robots: "noindex, nofollow" };

function relativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const hours = Math.floor((now.getTime() - date.getTime()) / 3600000);
  const days = Math.floor(hours / 24);
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

// 경과 시간을 긴급도 3단계로 표시한다. 같은 "대기"라도 1일과 1주일은 다른 우선순위 —
// 공장 관리자가 목록을 훑을 때 가장 오래 방치된 건을 색으로 즉시 가려낸다.
// nowMs 는 부모(server component)에서 한 번 계산해 넘긴다 — render 중 Date.now() 호출 금지 규칙 회피.
function StaleTime({ date, nowMs }: { date: string; nowMs: number }) {
  const days = (nowMs - new Date(date).getTime()) / 86_400_000;
  const cls =
    days >= 3
      ? "text-red-600 font-bold"
      : days >= 1
        ? "text-amber-600 font-semibold"
        : "text-gray-600";
  const suffix = days >= 3 ? ` · ${Math.floor(days)}일 지연` : days >= 1 ? " · 1일+" : "";
  return (
    <span className={`text-[13px] tabular-nums flex-shrink-0 font-medium ${cls}`}>
      {relativeTime(date)}
      {suffix}
    </span>
  );
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

  const now = new Date();
  const nowMs = now.getTime();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
  const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7);
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

  const [
    { count: pendingQuotes },
    { count: pendingApps },
    { data: pendingQuoteList },
    { data: pendingAppList },
    { count: activeProducts },
    { count: activeJobs },
    { count: publishedNotices },
    { count: totalCustomers },
    { count: customersThisWeek },
    { count: customersPrevWeek },
    { count: quotesThisWeek },
    { count: quotesPrevWeek },
    { count: inProgressWorkOrders },
  ] = await Promise.all([
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "접수").is("deleted_at", null),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "서류검토").is("deleted_at", null),
    supabase.from("quotes").select("id, company_name, contact_name, processing_type, status, created_at, customer_id").eq("status", "접수").is("deleted_at", null).order("created_at", { ascending: true }).limit(5),
    supabase.from("applications").select("id, name, position, status, created_at, customer_id").eq("status", "서류검토").is("deleted_at", null).order("created_at", { ascending: true }).limit(5),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true).is("deleted_at", null),
    supabase.from("job_postings").select("*", { count: "exact", head: true }).eq("is_active", true).is("deleted_at", null),
    supabase.from("notices").select("*", { count: "exact", head: true }).eq("is_published", true).is("deleted_at", null),
    supabase.from("customers").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()).is("deleted_at", null),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", prevWeekStart.toISOString()).lt("created_at", weekStart.toISOString()).is("deleted_at", null),
    supabase.from("quotes").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()).is("deleted_at", null),
    supabase.from("quotes").select("*", { count: "exact", head: true }).gte("created_at", prevWeekStart.toISOString()).lt("created_at", weekStart.toISOString()).is("deleted_at", null),
    supabase.from("work_orders").select("*", { count: "exact", head: true }).not("status", "in", "(\"출하\",\"완료\")").is("deleted_at", null),
  ]);

  const hasUrgent = (pendingQuotes || 0) > 0 || (pendingApps || 0) > 0;
  const customerDelta = (customersThisWeek || 0) - (customersPrevWeek || 0);
  const quoteDelta = (quotesThisWeek || 0) - (quotesPrevWeek || 0);

  return (
    <div className="space-y-6">
      {/* ───────────── Greeting ───────────── */}
      <div>
        <h1 className="text-3xl font-bold text-brand-navy tracking-tight">{getGreeting()}</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">{formatToday()}</p>
      </div>

      {/* ───────────── Inbox: 오늘 처리할 것 ─────────────
        핵심 원칙: layout stability. pending 없어도 같은 영역 유지.
      */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-brand-navy" />
          <h2 className="text-base font-semibold text-brand-navy">오늘 처리할 일</h2>
          {hasUrgent ? (
            <span className="ml-auto text-sm font-bold text-red-600 tabular-nums">
              {(pendingQuotes || 0) + (pendingApps || 0)}건 대기
            </span>
          ) : (
            <span className="ml-auto text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              모두 처리됨
            </span>
          )}
        </div>

        {!hasUrgent ? (
          <div className="px-5 py-6 text-center text-sm text-gray-500 font-medium">
            새로 들어오는 견적·지원서는 여기에 자동으로 나타납니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(pendingQuoteList || []).map((q) => (
              <Link
                key={q.id}
                href={`/admin/quotes/${q.id}`}
                className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Inbox className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">견적</span>
                    <span className="text-sm font-semibold text-brand-navy truncate">
                      {q.company_name}
                    </span>
                    <span className="text-[13px] text-gray-500 font-medium truncate">{q.contact_name}</span>
                  </div>
                  <div className="text-[13px] text-gray-600 mt-0.5 font-medium">
                    {q.processing_type === "콜백요청" ? "📞 콜백요청" : q.processing_type}
                  </div>
                </div>
                <StaleTime date={q.created_at} nowMs={nowMs} />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
            {(pendingAppList || []).map((a) => (
              <Link
                key={a.id}
                href={`/admin/applications/${a.id}`}
                className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">지원서</span>
                    <span className="text-sm font-semibold text-brand-navy truncate">{a.name}</span>
                    <span className="text-[13px] text-gray-500 font-medium truncate">{a.position}</span>
                  </div>
                </div>
                <StaleTime date={a.created_at} nowMs={nowMs} />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
            {((pendingQuotes || 0) + (pendingApps || 0)) > (pendingQuoteList?.length || 0) + (pendingAppList?.length || 0) && (
              <div className="px-5 py-2.5 bg-gray-50/50 text-[13px] text-gray-600 font-medium flex items-center justify-between">
                <span>상위 {(pendingQuoteList?.length || 0) + (pendingAppList?.length || 0)}건만 표시</span>
                <div className="flex items-center gap-3">
                  {(pendingQuotes || 0) > (pendingQuoteList?.length || 0) && (
                    <Link href="/admin/quotes?status=접수" className="text-brand-blue hover:underline font-semibold">
                      견적 전체 {pendingQuotes}건 →
                    </Link>
                  )}
                  {(pendingApps || 0) > (pendingAppList?.length || 0) && (
                    <Link href="/admin/applications?status=서류검토" className="text-brand-blue hover:underline font-semibold">
                      지원서 전체 {pendingApps}건 →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ───────────── 이번 주 활동 (기존 그대로) ───────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-navy" />
          <h2 className="text-base font-semibold text-brand-navy">이번 주 활동</h2>
          <span className="ml-auto text-[13px] text-gray-600 font-medium">최근 7일 vs 전주</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
          <MetricCard label="신규 고객" value={customersThisWeek || 0} delta={customerDelta} href="/admin/customers" />
          <MetricCard label="새 견적" value={quotesThisWeek || 0} delta={quoteDelta} href="/admin/quotes" />
          <MetricCard label="진행 중 발주" value={inProgressWorkOrders || 0} href="/admin/work-orders" />
          <MetricCard label="총 고객" value={totalCustomers || 0} href="/admin/customers" unit="명" />
        </div>
      </section>

      {/* ───────────── 콘텐츠 현황 + 빠른 액션 ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-brand-navy flex items-center gap-2">
            <Package className="w-4 h-4" />
            콘텐츠 현황
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <ContentBadge icon={Package} label="제품" count={activeProducts || 0} href="/admin/products" color="blue" />
            <ContentBadge icon={Briefcase} label="채용공고" count={activeJobs || 0} href="/admin/job-postings" color="emerald" />
            <ContentBadge icon={Bell} label="회사소식" count={publishedNotices || 0} href="/admin/notices" color="violet" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-brand-navy">빠른 액션</h2>
          <div className="flex flex-wrap gap-2">
            <QuickAction href="/admin/notices/new" label="새 소식 작성" />
            <QuickAction href="/admin/products/new" label="새 제품" />
            <QuickAction href="/admin/job-postings/new" label="새 채용공고" />
            <QuickAction href="/admin/invites" label="관리자 초대" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  href,
  unit = "건",
}: {
  label: string;
  value: number;
  delta?: number;
  href: string;
  unit?: string;
}) {
  const isPositive = (delta ?? 0) > 0;
  const isNegative = (delta ?? 0) < 0;
  return (
    <Link href={href} className="block px-5 py-5 hover:bg-gray-50/50 transition-colors">
      <p className="text-[13px] text-gray-700 font-bold mb-1.5 uppercase tracking-[0.04em]">{label}</p>
      <p className="text-4xl font-bold text-brand-navy tabular-nums leading-none">
        {value}
        <span className="text-base font-medium text-gray-500 ml-1.5">{unit}</span>
      </p>
      {delta !== undefined && (
        <p
          className={`text-[13px] tabular-nums mt-2 font-semibold ${
            isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-gray-500"
          }`}
        >
          {isPositive ? "↑" : isNegative ? "↓" : "—"} {Math.abs(delta)}
        </p>
      )}
    </Link>
  );
}

function ContentBadge({
  icon: Icon,
  label,
  count,
  href,
  color,
}: {
  icon: typeof Package;
  label: string;
  count: number;
  href: string;
  color: "blue" | "emerald" | "violet";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <Link href={href} className="block p-3 rounded-lg border border-gray-200 hover:border-brand-navy/30 hover:bg-gray-50/50 transition-all">
      <div className={`w-7 h-7 rounded-md ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[13px] text-gray-700 font-semibold">{label}</p>
      <p className="text-lg font-bold text-brand-navy tabular-nums">
        {count}
        <span className="text-[13px] font-medium text-gray-500 ml-0.5">개</span>
      </p>
    </Link>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-[13px] font-semibold">
        <Plus className="w-4 h-4" />
        {label}
      </Button>
    </Link>
  );
}
