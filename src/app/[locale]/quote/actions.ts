"use server";

import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { sendQuoteNotification } from "@/lib/email";
import { formLimiter, getClientIp } from "@/lib/ratelimit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sessionHash } from "@/lib/analytics/classify";

type QuoteState = {
  success: boolean;
  error: string;
  errorKey?: string;
};

export async function submitQuote(
  prevState: QuoteState,
  formData: FormData
): Promise<QuoteState> {
  const h = await headers();
  const ip = getClientIp(h);

  const { success: rlOk } = await formLimiter.limit(`quote:${ip}`);
  if (!rlOk) {
    return { success: false, error: "제출이 너무 잦습니다. 잠시 후 다시 시도해주세요." };
  }

  const turnstileToken = formData.get("turnstileToken");
  const tokenStr = typeof turnstileToken === "string" ? turnstileToken : null;
  const botOk = await verifyTurnstileToken(tokenStr, ip);
  if (!botOk) {
    return { success: false, error: "봇 검증에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요." };
  }

  const company_name = formData.get("company_name") as string;
  const contact_name = formData.get("contact_name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || undefined;
  const processing_type = formData.get("processing_type") as string;
  const material = (formData.get("material") as string) || undefined;
  const quantity = (formData.get("quantity") as string) || undefined;
  const deadline = (formData.get("deadline") as string) || undefined;
  const description = (formData.get("description") as string) || undefined;
  const privacy_agreed = formData.get("privacy_agreed") === "on";
  const file = formData.get("attachment") as File | null;

  // Validate required fields
  if (!company_name || !contact_name || !phone || !email || !processing_type) {
    return { success: false, error: "", errorKey: "requiredFields" };
  }

  if (!privacy_agreed) {
    return { success: false, error: "", errorKey: "privacyAgreed" };
  }

  // Validate file before DB insert to prevent orphaned rows
  if (file && file.size > 0) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_EXTENSIONS = ["pdf", "dwg", "dxf", "step", "igs", "stp", "jpg", "jpeg", "png"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "", errorKey: "fileSize" };
    }
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { success: false, error: "", errorKey: "fileType" };
    }
  }

  const userAgent = h.get("user-agent") ?? "";
  const submitSession = sessionHash(ip, userAgent);

  // Insert quote
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      company_name,
      contact_name,
      phone,
      email,
      processing_type,
      material,
      quantity,
      deadline: deadline || null,
      description,
      privacy_agreed,
      session_hash: submitSession,
    })
    .select("id")
    .single();

  if (quoteError) {
    console.error("Quote insert error:", quoteError);
    return { success: false, error: "", errorKey: "submitFailed" };
  }

  // Upload file if exists (already validated above)
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const filePath = `${quote.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("quote-attachments")
      .upload(filePath, file);

    if (uploadError) {
      console.error("File upload error:", uploadError);
      return { success: false, error: "", errorKey: "fileUploadFailed" };
    }

    await supabase.from("attachments").insert({
      parent_table: "quotes",
      parent_id: quote.id,
      file_url: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
    });
  }

  // Send email notification (non-blocking)
  await sendQuoteNotification({
    company_name,
    contact_name,
    phone,
    email,
    processing_type,
    material,
    quantity,
    deadline,
    description,
  });

  return { success: true, error: "" };
}
