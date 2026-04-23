"use server";

import { supabase } from "@/lib/supabase";
import { sendApplicationNotification } from "@/lib/email";

type ApplicationState = {
  success: boolean;
  error: string;
  errorKey?: string;
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
    return { success: false, error: "", errorKey: "submitFailed" };
  }

  // Upload resume if exists (already validated above)
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const filePath = `${application.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Resume upload error:", uploadError);
      return { success: false, error: "", errorKey: "submitFailed" };
    }

    await supabase.from("attachments").insert({
      parent_table: "applications",
      parent_id: application.id,
      file_url: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
    });
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
