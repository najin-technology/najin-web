import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { KpiCards } from "./_components/kpi-cards";
import { DashboardLinks } from "./_components/dashboard-links";

export const metadata = {
  title: "Analytics",
  description: "나진테크 웹 분석 대시보드",
  robots: "noindex, nofollow",
};

export default async function AnalyticsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = monthStart;
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [
    quotesThisMonth,
    quotesPrevMonth,
    appsThisMonth,
    appsPrevMonth,
    postsLast7,
    noticesLast7,
    auditThisMonth,
    auditPrevMonth,
  ] = await Promise.all([
    supabase.from("quotes").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()).is("deleted_at", null),
    supabase.from("quotes").select("*", { count: "exact", head: true }).gte("created_at", prevMonthStart.toISOString()).lt("created_at", prevMonthEnd.toISOString()).is("deleted_at", null),
    supabase.from("applications").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()).is("deleted_at", null),
    supabase.from("applications").select("*", { count: "exact", head: true }).gte("created_at", prevMonthStart.toISOString()).lt("created_at", prevMonthEnd.toISOString()).is("deleted_at", null),
    supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()).is("deleted_at", null),
    supabase.from("notices").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()).is("deleted_at", null),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }).gte("created_at", prevMonthStart.toISOString()).lt("created_at", prevMonthEnd.toISOString()),
  ]);

  const kpis = [
    {
      label: "이번 달 견적 문의",
      value: quotesThisMonth.count ?? 0,
      prev: quotesPrevMonth.count ?? 0,
      href: "/admin/quotes",
    },
    {
      label: "이번 달 채용 지원",
      value: appsThisMonth.count ?? 0,
      prev: appsPrevMonth.count ?? 0,
      href: "/admin/applications",
    },
    {
      label: "최근 7일 콘텐츠 발행",
      value: (postsLast7.count ?? 0) + (noticesLast7.count ?? 0),
      prev: null,
      href: "/admin/posts",
    },
    {
      label: "이번 달 관리자 활동",
      value: auditThisMonth.count ?? 0,
      prev: auditPrevMonth.count ?? 0,
      href: "/admin/history",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">Analytics</h1>
        <p className="text-sm text-gray-500">자체 KPI와 외부 분석 대시보드를 한곳에서.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">핵심 지표</h2>
        <KpiCards kpis={kpis} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">외부 대시보드</h2>
        <DashboardLinks />
      </section>
    </div>
  );
}
