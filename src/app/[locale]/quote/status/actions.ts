"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { quoteStatusLimiter, getClientIp } from "@/lib/ratelimit";

type LookupResult =
  | { ok: true; status: string; updated_at: string; cancel_reason: string | null }
  | { ok: false; reason: "rate_limited"; retryAfterSec: number }
  | { ok: false; reason: "not_found" | "service_unavailable" };

export async function lookupQuoteStatus(input: {
  quoteIdShort: string;
  email: string;
}): Promise<LookupResult> {
  const ip = getClientIp(await headers());
  const { success, reset } = await quoteStatusLimiter.limit(`quote-status:${ip}`);
  if (!success) {
    return {
      ok: false,
      reason: "rate_limited",
      retryAfterSec: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  }

  // 견적번호 = UUID 앞 8 hex. uuid 컬럼엔 ilike(텍스트 연산)가 안 되므로,
  // 8자리로 uuid 범위를 만들어 prefix 매칭한다.
  const short = input.quoteIdShort.trim().toLowerCase().replace(/[^0-9a-f]/g, "").slice(0, 8);
  const email = input.email.trim();
  if (short.length < 8 || !email) return { ok: false, reason: "not_found" };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "service_unavailable" };

  const lower = `${short}-0000-0000-0000-000000000000`;
  const upper = `${short}-ffff-ffff-ffff-ffffffffffff`;
  // 이메일은 대소문자 무시 정확 일치. LIKE 와일드카드(%, _, \)는 이스케이프.
  const emailPattern = email.replace(/[%_\\]/g, "\\$&");

  const { data } = await supabase
    .from("quotes")
    .select("id, status, updated_at, email, cancel_reason")
    .gte("id", lower)
    .lte("id", upper)
    .ilike("email", emailPattern)
    .limit(1)
    .maybeSingle();

  if (!data) return { ok: false, reason: "not_found" };
  return {
    ok: true,
    status: data.status,
    updated_at: data.updated_at,
    cancel_reason: data.cancel_reason ?? null,
  };
}
