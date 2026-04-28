import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { DetailPageHeader } from "@/components/admin/detail-page-header";
import { Building2, Phone, Mail, Calendar, FileText, Users, ExternalLink, Tag } from "lucide-react";
import { CustomerStatusForm, CustomerNotesForm, CustomerDisplayForm } from "./client";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata = { title: "고객 상세", robots: "noindex, nofollow" };

const SOURCE_LABELS: Record<string, string> = {
  quote: "견적 요청",
  application: "채용 지원서",
  manual: "수동 등록",
  client_delivery: "거래처 시드",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!customer) notFound();

  // Load related quotes, applications, posts
  const [{ data: quotes }, { data: applications }, { data: posts }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, processing_type, material, status, created_at")
      .eq("customer_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, position, status, created_at")
      .eq("customer_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("posts")
      .select("id, slug, title_ko, category, original_date, published_at, is_published")
      .eq("customer_id", id)
      .is("deleted_at", null)
      .order("original_date", { ascending: false, nullsFirst: false }),
  ]);

  type TimelineEvent = {
    type: "quote" | "application" | "post" | "created";
    id: string;
    label: string;
    sublabel?: string;
    status?: string;
    date: string;
    href?: string;
  };

  const timeline: TimelineEvent[] = [
    ...(quotes || []).map((q) => ({
      type: "quote" as const,
      id: q.id,
      label: `견적 요청 — ${q.processing_type || "기타"}`,
      sublabel: q.material || undefined,
      status: q.status,
      date: q.created_at,
      href: `/admin/quotes/${q.id}`,
    })),
    ...(applications || []).map((a) => ({
      type: "application" as const,
      id: a.id,
      label: `채용 지원 — ${a.position || ""}`,
      status: a.status,
      date: a.created_at,
      href: `/admin/applications/${a.id}`,
    })),
    ...(posts || []).map((p) => ({
      type: "post" as const,
      id: p.id,
      label: `${p.category} — ${p.title_ko}`,
      status: p.is_published ? "공개" : "비공개",
      date: p.original_date || p.published_at,
      href: `/admin/posts/${p.id}/edit`,
    })),
    {
      type: "created" as const,
      id: customer.id,
      label: `${SOURCE_LABELS[customer.source] || customer.source}로 등록`,
      date: customer.created_at,
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title={customer.display_name || customer.company_name}
        backHref="/admin/customers"
      />

      {/* Top: 2-col summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: contact & status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-navy to-brand-navy-dark flex items-center justify-center text-white shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-brand-navy tracking-tight">
                  {customer.display_name || customer.company_name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-[13px] text-gray-600">
                  <StatusBadge status={customer.status} type="customer" />
                  <span className="text-gray-300">·</span>
                  <span>{SOURCE_LABELS[customer.source] || customer.source}</span>
                  {customer.client_slug && (
                    <>
                      <span className="text-gray-300">·</span>
                      <Link
                        href={`/ko/clients/${customer.client_slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        거래처 페이지
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {customer.primary_contact_name && (
                <Field icon={Users} label="담당자" value={customer.primary_contact_name} />
              )}
              {customer.primary_contact_phone && (
                <Field icon={Phone} label="전화" value={customer.primary_contact_phone} href={`tel:${customer.primary_contact_phone}`} />
              )}
              {customer.primary_contact_email && (
                <Field icon={Mail} label="이메일" value={customer.primary_contact_email} href={`mailto:${customer.primary_contact_email}`} />
              )}
              <Field icon={Calendar} label="등록일" value={new Date(customer.created_at).toLocaleDateString("ko-KR")} />
            </dl>

            {customer.tags && customer.tags.length > 0 && (
              <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                {customer.tags.map((t: string) => (
                  <span key={t} className="text-[13px] text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-brand-navy mb-4">활동 타임라인</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center font-medium">기록된 활동이 없습니다.</p>
            ) : (
              <ol className="relative border-l-2 border-gray-200 pl-5 space-y-4">
                {timeline.map((ev) => (
                  <li key={`${ev.type}-${ev.id}`} className="relative">
                    <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                      ev.type === "quote" ? "bg-amber-500" :
                      ev.type === "application" ? "bg-rose-500" :
                      ev.type === "post" ? "bg-indigo-500" :
                      "bg-gray-300"
                    }`} />
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {ev.href ? (
                        <Link href={ev.href} className="text-sm font-semibold text-brand-blue hover:underline">
                          {ev.label}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-brand-charcoal">{ev.label}</span>
                      )}
                      {ev.status && (
                        <span className="text-[11px] text-gray-700 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                          {ev.status}
                        </span>
                      )}
                    </div>
                    {ev.sublabel && <p className="text-[13px] text-gray-500 mt-0.5 font-medium">{ev.sublabel}</p>}
                    <p className="text-xs text-gray-500 tabular-nums mt-0.5 font-medium">
                      {new Date(ev.date).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Right: status + display + notes */}
        <div className="space-y-4">
          <CustomerStatusForm customerId={customer.id} status={customer.status} tags={customer.tags || []} />
          <CustomerDisplayForm
            customerId={customer.id}
            initial={{
              client_slug: customer.client_slug ?? null,
              logo_url: customer.logo_url ?? null,
              name_en: customer.name_en ?? null,
              needs_dark_bg: !!customer.needs_dark_bg,
              display_category: customer.display_category ?? null,
              display_order: customer.display_order ?? 0,
              registered_year: customer.registered_year ?? null,
            }}
          />
          <CustomerNotesForm customerId={customer.id} notes={customer.notes || ""} />
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-600 mb-1 flex items-center gap-1 font-bold uppercase tracking-[0.04em]">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </dt>
      <dd className="text-sm text-brand-charcoal font-semibold">
        {href ? (
          <a href={href} className="hover:text-brand-blue hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
