"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendQuoteNotification } from "@/lib/email";
import { sessionHash } from "@/lib/analytics/classify";
import { formLimiter, getClientIp } from "@/lib/ratelimit";

type CallbackState = {
  success: boolean;
  error: string;
};

export async function submitCallback(
  prevState: CallbackState,
  formData: FormData
): Promise<CallbackState> {
  const h = await headers();
  const ip = getClientIp(h);

  // 견적 접수 중단(site_settings.quotes_paused) 동안에는 이 폼이 사이트의
  // 유일한 문의 창구다. 견적 폼과 동일한 rate limit 을 건다.
  const { success: rlOk } = await formLimiter.limit(`callback:${ip}`);
  if (!rlOk) {
    return { success: false, error: "제출이 너무 잦습니다. 잠시 후 다시 시도해주세요." };
  }

  const company_name = formData.get("company_name") as string;
  const phone = formData.get("phone") as string;
  const preferred_time = (formData.get("preferred_time") as string) || undefined;
  const privacy_agreed = formData.get("privacy_agreed") === "on";

  if (!company_name || !phone) {
    return { success: false, error: "필수 항목을 입력해주세요." };
  }

  if (!privacy_agreed) {
    return { success: false, error: "개인정보 수집 동의가 필요합니다." };
  }

  const userAgent = h.get("user-agent") ?? "";
  const submitSession = sessionHash(ip, userAgent);

  const db = getSupabaseAdmin();
  if (!db) {
    console.error("Callback insert: SUPABASE_SERVICE_ROLE_KEY missing");
    return { success: false, error: "제출 중 오류가 발생했습니다." };
  }

  const description = preferred_time ? `희망 연락 시간: ${preferred_time}` : undefined;

  const { error } = await db.from("quotes").insert({
    company_name,
    contact_name: company_name,
    phone,
    processing_type: "콜백요청",
    description,
    privacy_agreed,
    session_hash: submitSession,
  });

  if (error) {
    console.error("Callback insert error:", error);
    return { success: false, error: "제출 중 오류가 발생했습니다." };
  }

  // 견적 폼과 달리 알림 메일이 빠져 있어서, 접수돼도 아무도 모르는 상태였다.
  await sendQuoteNotification({
    company_name,
    contact_name: company_name,
    phone,
    processing_type: "콜백요청 (견적 접수 중단 중)",
    description,
  });

  return { success: true, error: "" };
}
