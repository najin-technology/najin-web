"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formLimiter, getClientIp } from "@/lib/ratelimit";

type LookupResult =
  | { ok: true; status: string; updated_at: string; cancel_reason: string | null }
  | { ok: false; reason: "rate_limited" | "not_found" | "service_unavailable" };

export async function lookupQuoteStatus(input: {
  quoteIdShort: string;
  email: string;
}): Promise<LookupResult> {
  const ip = getClientIp(await headers());
  const { success } = await formLimiter.limit(`quote-status:${ip}`);
  if (!success) return { ok: false, reason: "rate_limited" };

  const id = input.quoteIdShort.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  if (!id || !email) return { ok: false, reason: "not_found" };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "service_unavailable" };

  const { data } = await supabase
    .from("quotes")
    .select("id, status, updated_at, email, cancel_reason")
    .ilike("id", `${id}%`)
    .ilike("email", email)
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
