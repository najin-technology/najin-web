import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Flame,
  CheckCircle2,
  Smartphone,
  Tablet,
  Monitor,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getSessionJourney,
  getSessionScore,
  referrerLabel,
  type JourneyStep,
} from "@/lib/analytics/queries";

export const metadata = {
  title: "세션 여정",
  robots: "noindex, nofollow",
};

function stripLocale(path: string): { locale: string | null; clean: string } {
  const parts = path.split("/").filter(Boolean);
  if (parts.length && ["ko", "en", "zh"].includes(parts[0])) {
    return { locale: parts[0], clean: "/" + parts.slice(1).join("/") };
  }
  return { locale: null, clean: path };
}

function deviceIcon(dc: string) {
  if (dc === "mobile") return <Smartphone className="w-4 h-4" strokeWidth={1.5} />;
  if (dc === "tablet") return <Tablet className="w-4 h-4" strokeWidth={1.5} />;
  return <Monitor className="w-4 h-4" strokeWidth={1.5} />;
}

function minutesBetween(a: string, b: string): string {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}초 후`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}분 후`;
  const hr = Math.floor(min / 60);
  return `${hr}시간 ${min % 60}분 후`;
}

export default async function SessionJourneyPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  await requireAdmin();
  const { hash } = await params;

  const supabase = await createSupabaseServerClient();
  const [journey, score] = await Promise.all([
    getSessionJourney(supabase, hash),
    getSessionScore(supabase, hash),
  ]);

  if (journey.length === 0) notFound();

  const first = journey[0];
  const last = journey[journey.length - 1];
  const duration =
    new Date(last.created_at).getTime() - new Date(first.created_at).getTime();
  const durationMins = Math.max(1, Math.round(duration / 60000));
  const company = first.asn_company ?? null;
  const loc = [first.city, first.country].filter(Boolean).join(", ") || "위치 미확인";

  const { data: quoteData } = await supabase
    .from("quotes")
    .select("id, company_name, contact_name, status, created_at")
    .eq("session_hash", hash)
    .is("deleted_at", null)
    .maybeSingle();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/admin/analytics"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-navy transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Analytics로 돌아가기
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-copper">
            세션 여정
          </p>
          <span className="text-xs font-mono text-gray-500 font-semibold">
            #{hash.slice(0, 12)}…
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-navy flex items-center gap-3">
          {company ? (
            <>
              <Building2 className="w-7 h-7 text-brand-copper" strokeWidth={2} />
              {company}
            </>
          ) : (
            "익명 방문자"
          )}
        </h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Flame} label="리드 점수" value={String(score)} accent />
        <SummaryCard
          icon={Clock}
          label="체류 시간"
          value={durationMins < 60 ? `${durationMins}분` : `${Math.floor(durationMins / 60)}시간 ${durationMins % 60}분`}
        />
        <SummaryCard icon={Monitor} label="페이지뷰" value={`${journey.length}건`} />
        <SummaryCard icon={MapPin} label="위치" value={loc} small />
      </div>

      {quoteData && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-900">견적 제출 완료</p>
              <p className="text-[13px] text-emerald-700 mt-1 font-medium">
                {quoteData.company_name} · {quoteData.contact_name} · {quoteData.status}
              </p>
            </div>
            <Link
              href={`/admin/quotes/${quoteData.id}`}
              className="text-[13px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 flex-shrink-0"
            >
              상세 보기 <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            타임라인 · 시간순
          </p>
        </div>

        <ol className="relative border-l border-gray-200 ml-4 pl-6 space-y-5">
          {journey.map((step: JourneyStep, i) => {
            const { locale, clean } = stripLocale(step.path);
            const ts = new Date(step.created_at);
            const diff = i > 0 ? minutesBetween(step.created_at, journey[i - 1].created_at) : null;
            return (
              <li key={step.id} className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-white border-2 border-brand-navy" />
                <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold font-mono text-brand-charcoal break-all">
                      {clean}
                    </p>
                    <span className="text-xs tabular-nums text-gray-600 flex-shrink-0 font-medium">
                      {ts.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[13px] text-gray-600 font-medium">
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-navy/5 text-brand-navy font-semibold uppercase tracking-widest">
                        진입
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      {deviceIcon(step.device_class)}
                      {step.browser ?? "—"}
                    </span>
                    <span>{referrerLabel(step.referrer_category)}</span>
                    {step.referrer_host && (
                      <span className="text-gray-500 font-mono truncate">{step.referrer_host}</span>
                    )}
                    {locale && locale !== "ko" && (
                      <span className="uppercase tracking-widest text-gray-500 font-bold">{locale}</span>
                    )}
                    {diff && <span className="text-gray-500 tabular-nums">+{diff.replace(" 후", "")}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="text-xs text-gray-500 pt-4 border-t border-gray-100 leading-relaxed font-medium">
        세션 해시는 하루 단위로 회전됩니다 (ip + user-agent + 날짜). 다음 날 같은 방문자는 새 세션으로 기록됩니다.
      </footer>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent = false,
  small = false,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-4 ${
        accent ? "border-brand-copper/30" : "border-gray-200/80"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${accent ? "text-brand-copper" : "text-gray-500"}`} strokeWidth={1.5} />
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-600">{label}</p>
      </div>
      <p
        className={`font-semibold tabular-nums tracking-tight ${
          accent ? "text-brand-copper" : "text-brand-navy"
        } ${small ? "text-base truncate" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
