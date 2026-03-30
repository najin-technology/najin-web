"use server";

import { supabase } from "@/lib/supabase";
import { sendQuoteNotification } from "@/lib/email";

type QuoteState = {
  success: boolean;
  error: string;
};

export async function submitQuote(
  prevState: QuoteState,
  formData: FormData
): Promise<QuoteState> {
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
  if (!company_name || !contact_name || !phone || !processing_type) {
    return { success: false, error: "필수 항목을 입력해주세요." };
  }

  if (!privacy_agreed) {
    return { success: false, error: "개인정보 수집 동의가 필요합니다." };
  }

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
    })
    .select("id")
    .single();

  if (quoteError) {
    console.error("Quote insert error:", quoteError);
    return { success: false, error: "제출 중 오류가 발생했습니다." };
  }

  // Upload file if exists
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${quote.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("quote-attachments")
      .upload(filePath, file);

    if (!uploadError) {
      await supabase.from("attachments").insert({
        parent_table: "quotes",
        parent_id: quote.id,
        file_url: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
      });
    }
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
