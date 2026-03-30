"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createJobPosting(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const department = formData.get("department") as string;
  const employmentType = formData.get("employment_type") as string;
  const descriptionKo = formData.get("description_ko") as string;
  const descriptionEn = formData.get("description_en") as string;
  const requirementsKo = formData.get("requirements_ko") as string;
  const requirementsEn = formData.get("requirements_en") as string;
  const benefitsKo = formData.get("benefits_ko") as string;
  const benefitsEn = formData.get("benefits_en") as string;
  const isActive = formData.get("is_active") === "true";
  const deadline = formData.get("deadline") as string;

  if (!titleKo) {
    return { error: "제목(한국어)은 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("job_postings")
    .insert({
      title_ko: titleKo,
      title_en: titleEn || null,
      department: department || null,
      employment_type: employmentType || null,
      description_ko: descriptionKo || null,
      description_en: descriptionEn || null,
      requirements_ko: requirementsKo || null,
      requirements_en: requirementsEn || null,
      benefits_ko: benefitsKo || null,
      benefits_en: benefitsEn || null,
      is_active: isActive,
      deadline: deadline || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "채용공고 등록에 실패했습니다." };
  }

  await logAudit({
    action: "create",
    targetTable: "job_postings",
    targetId: data.id,
    details: { title_ko: titleKo },
  });

  revalidatePath("/admin/job-postings");
  redirect("/admin/job-postings");
}

export async function updateJobPosting(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const department = formData.get("department") as string;
  const employmentType = formData.get("employment_type") as string;
  const descriptionKo = formData.get("description_ko") as string;
  const descriptionEn = formData.get("description_en") as string;
  const requirementsKo = formData.get("requirements_ko") as string;
  const requirementsEn = formData.get("requirements_en") as string;
  const benefitsKo = formData.get("benefits_ko") as string;
  const benefitsEn = formData.get("benefits_en") as string;
  const isActive = formData.get("is_active") === "true";
  const deadline = formData.get("deadline") as string;

  if (!id || !titleKo) {
    return { error: "제목(한국어)은 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("job_postings")
    .update({
      title_ko: titleKo,
      title_en: titleEn || null,
      department: department || null,
      employment_type: employmentType || null,
      description_ko: descriptionKo || null,
      description_en: descriptionEn || null,
      requirements_ko: requirementsKo || null,
      requirements_en: requirementsEn || null,
      benefits_ko: benefitsKo || null,
      benefits_en: benefitsEn || null,
      is_active: isActive,
      deadline: deadline || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "채용공고 수정에 실패했습니다." };
  }

  await logAudit({
    action: "update",
    targetTable: "job_postings",
    targetId: id,
    details: { title_ko: titleKo },
  });

  revalidatePath("/admin/job-postings");
  redirect("/admin/job-postings");
}

export async function toggleJobPostingActive(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: posting } = await supabase
    .from("job_postings")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!posting) return;

  const newActive = !posting.is_active;

  await supabase
    .from("job_postings")
    .update({
      is_active: newActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAudit({
    action: newActive ? "activate" : "deactivate",
    targetTable: "job_postings",
    targetId: id,
  });

  revalidatePath("/admin/job-postings");
}

export async function deleteJobPosting(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("job_postings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Failed to delete job posting:", error);
    return;
  }

  await logAudit({
    action: "delete",
    targetTable: "job_postings",
    targetId: id,
  });

  revalidatePath("/admin/job-postings");
}
