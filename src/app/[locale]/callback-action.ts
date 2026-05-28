"use server";

import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { sessionHash } from "@/lib/analytics/classify";
import { getClientIp } from "@/lib/ratelimit";

type CallbackState = {
  success: boolean;
  error: string;
};

export async function submitCallback(
  prevState: CallbackState,
  formData: FormData
): Promise<CallbackState> {
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

  const h = await headers();
  const ip = getClientIp(h);
  const userAgent = h.get("user-agent") ?? "";
  const submitSession = sessionHash(ip, userAgent);

  const { error } = await supabase.from("quotes").insert({
    company_name,
    contact_name: company_name,
    phone,
    processing_type: "콜백요청",
    description: preferred_time ? `희망 연락 시간: ${preferred_time}` : undefined,
    privacy_agreed,
    session_hash: submitSession,
  });

  if (error) {
    console.error("Callback insert error:", error);
    return { success: false, error: "제출 중 오류가 발생했습니다." };
  }

  return { success: true, error: "" };
}
