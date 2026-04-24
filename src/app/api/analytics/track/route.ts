import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  categorizeReferrer,
  classifyAiCrawler,
  classifyBrowser,
  classifyDevice,
  isBot,
  sessionHash,
} from "@/lib/analytics/classify";
import { lookupAsn } from "@/lib/analytics/asn";

type TrackPayload = {
  path?: string;
  referrer?: string | null;
  locale?: string | null;
};

export async function POST(request: NextRequest) {
  let body: TrackPayload;
  try {
    body = (await request.json()) as TrackPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 512) : null;
  if (!path || path.startsWith("/admin") || path.startsWith("/api/")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const ownHost = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  const referrerRaw = typeof body.referrer === "string" ? body.referrer : null;
  const { category, host: referrerHost } = categorizeReferrer(referrerRaw, ownHost);
  const deviceClass = classifyDevice(userAgent);
  const aiCrawler = classifyAiCrawler(userAgent);
  const browser = aiCrawler ?? classifyBrowser(userAgent);
  const session = sessionHash(ip, userAgent);

  // Generic bot (not AI crawler) — skip
  if (deviceClass === "bot" || (isBot(userAgent) && !aiCrawler)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const country = request.headers.get("x-vercel-ip-country") ?? null;
  const city = request.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(request.headers.get("x-vercel-ip-city")!)
    : null;
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 8) : null;

  // fire-and-forget: ASN lookup + insert
  (async () => {
    let asnOrg: string | null = null;
    let asnCompany: string | null = null;
    if (deviceClass !== "ai-crawler") {
      const asn = await lookupAsn(ip);
      asnOrg = asn?.asnOrg ?? null;
      asnCompany = asn?.asnCompany ?? null;
    }

    const { error } = await supabase.from("page_views").insert({
      path,
      session_hash: session,
      referrer_host: referrerHost,
      referrer_category: category,
      device_class: deviceClass,
      browser,
      country,
      city,
      locale,
      asn_org: asnOrg,
      asn_company: asnCompany,
    });
    if (error) console.warn("[analytics] insert failed", error.message);
  })().catch((e) => console.warn("[analytics] async failure", e));

  return NextResponse.json({ ok: true });
}
