"use server";

import { supabase } from "@/lib/supabase";
import { sendApplicationNotification } from "@/lib/email";

type ApplicationState = {
  success: boolean;
  error: string;
};

export async function submitApplication(
  prevState: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || undefined;
  const position = formData.get("position") as string;
  const cover_letter = (formData.get("cover_letter") as string) || undefined;
  const privacy_agreed = formData.get("privacy_agreed") === "on";
  const file = formData.get("resume") as File | null;

  if (!name || !phone || !position) {
    return { success: false, error: "필수 항목을 입력해주세요." };
  }

  if (!privacy_agreed) {
    return { success: false, error: "개인정보 수집 동의가 필요합니다." };
  }

  // Validate file before DB insert to prevent orphaned rows
  if (file && file.size > 0) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "파일 크기는 10MB 이하만 가능합니다." };
    }
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { success: false, error: "허용되지 않는 파일 형식입니다. (PDF, DOC, DOCX만 가능)" };
    }
  }

  const { data: application, error: insertError } = await supabase
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
    return { success: false, error: "제출 중 오류가 발생했습니다." };
  }

  // Upload resume if exists (already validated above)
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const filePath = `${application.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);

    if (!uploadError) {
      await supabase.from("attachments").insert({
        parent_table: "applications",
        parent_id: application.id,
        file_url: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
      });
    }
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
