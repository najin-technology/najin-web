import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  categorizeReferrer,
  classifyBrowser,
  classifyDevice,
  isBot,
  sessionHash,
} from "@/lib/analytics/classify";

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
  if (isBot(userAgent)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const ownHost = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  const referrerRaw = typeof body.referrer === "string" ? body.referrer : null;
  const { category, host: referrerHost } = categorizeReferrer(referrerRaw, ownHost);
  const deviceClass = classifyDevice(userAgent);
  const browser = classifyBrowser(userAgent);
  const session = sessionHash(ip, userAgent);

  const country = request.headers.get("x-vercel-ip-country") ?? null;
  const city = request.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(request.headers.get("x-vercel-ip-city")!)
    : null;
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 8) : null;

  // fire-and-forget: do not block response on insert
  supabase
    .from("page_views")
    .insert({
      path,
      session_hash: session,
      referrer_host: referrerHost,
      referrer_category: category,
      device_class: deviceClass,
      browser,
      country,
      city,
      locale,
    })
    .then(({ error }) => {
      if (error) console.warn("[analytics] insert failed", error.message);
    });

  return NextResponse.json({ ok: true });
}
