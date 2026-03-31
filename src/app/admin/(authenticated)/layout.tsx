import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
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
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar badges={badges} />
      <div className="lg:ml-64">
        <AdminTopbar userEmail={user.email || ""} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
