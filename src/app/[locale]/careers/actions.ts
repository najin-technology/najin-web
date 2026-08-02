"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendApplicationNotification } from "@/lib/email";
import { formLimiter, getClientIp } from "@/lib/ratelimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

type ApplicationState = {
  success: boolean;
  error: string;
  errorKey?: string;
};

export async function submitApplication(
  prevState: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  const h = await headers();
  const ip = getClientIp(h);

  const { success: rlOk } = await formLimiter.limit(`apply:${ip}`);
  if (!rlOk) {
    return { success: false, error: "제출이 너무 잦습니다. 잠시 후 다시 시도해주세요." };
  }

  const turnstileToken = formData.get("turnstileToken");
  const tokenStr = typeof turnstileToken === "string" ? turnstileToken : null;
  const botOk = await verifyTurnstileToken(tokenStr, ip);
  if (!botOk) {
    return { success: false, error: "봇 검증에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요." };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || undefined;
  const position = formData.get("position") as string;
  const cover_letter = (formData.get("cover_letter") as string) || undefined;
  const privacy_agreed = formData.get("privacy_agreed") === "on";
  const file = formData.get("resume") as File | null;

  if (!name || !phone || !position) {
    return { success: false, error: "", errorKey: "requiredFields" };
  }

  if (!privacy_agreed) {
    return { success: false, error: "", errorKey: "privacyAgreed" };
  }

  // Validate file before DB insert to prevent orphaned rows
  if (file && file.size > 0) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "", errorKey: "fileSize" };
    }
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { success: false, error: "", errorKey: "fileType" };
    }
  }

  // 견적과 동일하게 service-role 로 쓴다. anon 클라이언트로는
  // `.insert().select()` 가 INSERT..RETURNING 을 만들어 applications 의
  // SELECT 정책 부재로 42501 이 나고 트랜잭션 전체가 롤백된다 → 지원서 전량 유실.
  const db = getSupabaseAdmin();
  if (!db) {
    console.error("Application insert: SUPABASE_SERVICE_ROLE_KEY missing");
    return { success: false, error: "", errorKey: "submitFailed" };
  }

  const { data: application, error: insertError } = await db
    .from("applications")
    .insert({
      name,
      phone,
      email,
      position,
      cover_letter,
      privacy_agreed,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Application insert error:", insertError);
    return { success: false, error: "", errorKey: "submitFailed" };
  }

  // Upload resume if exists (already validated above)
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const filePath = `${application.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await db.storage
      .from("resumes")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Resume upload error:", uploadError);
      return { success: false, error: "", errorKey: "fileUploadFailed" };
    }

    const { error: attachError } = await db.from("attachments").insert({
      parent_table: "applications",
      parent_id: application.id,
      file_url: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
    });
    if (attachError) console.error("Resume attachment insert error:", attachError);
  }

  await sendApplicationNotification({
    name,
    phone,
    email,
    position,
    cover_letter,
  });

  return { success: true, error: "" };
}
