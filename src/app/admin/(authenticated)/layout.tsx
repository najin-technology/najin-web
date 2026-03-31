import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { ScrollToTop } from "@/components/admin/scroll-to-top";
import { SessionGuard } from "@/components/admin/session-guard";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const [{ count: pendingQuotes }, { count: pendingApps }] = await Promise.all([
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
  ]);

  const badges: Record<string, number> = {};
  if (pendingQuotes && pendingQuotes > 0) badges["/admin/quotes"] = pendingQuotes;
  if (pendingApps && pendingApps > 0) badges["/admin/applications"] = pendingApps;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
      >
        콘텐츠로 바로 가기
      </a>
      <AdminSidebar badges={badges} />
      <div className="admin-main relative">
        <AdminTopbar userEmail={user.email || ""} pendingCount={(pendingQuotes || 0) + (pendingApps || 0)} />
        <main id="main-content" className="p-6 pb-20 lg:p-8 lg:pb-8 max-w-7xl mx-auto">{children}</main>
      </div>
      <SessionGuard />
      <ScrollToTop />
    </div>
  );
}
