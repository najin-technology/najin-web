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

export async function createNotice(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const contentKo = formData.get("content_ko") as string;
  const contentEn = formData.get("content_en") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!titleKo) {
    return { error: "제목(한국어)은 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("notices")
    .insert({
      title_ko: titleKo,
      title_en: titleEn || null,
      content_ko: contentKo || null,
      content_en: contentEn || null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "공지사항 등록에 실패했습니다." };
  }

  await logAudit({
    action: "create",
    targetTable: "notices",
    targetId: data.id,
    details: { title_ko: titleKo },
  });

  revalidatePath("/admin/notices");
  redirect("/admin/notices");
}

export async function updateNotice(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const contentKo = formData.get("content_ko") as string;
  const contentEn = formData.get("content_en") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!id || !titleKo) {
    return { error: "제목(한국어)은 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  // Get current notice to check published_at
  const { data: current } = await supabase
    .from("notices")
    .select("is_published, published_at")
    .eq("id", id)
    .single();

  const publishedAt =
    isPublished && !current?.is_published
      ? new Date().toISOString()
      : isPublished
        ? current?.published_at
        : null;

  const { error } = await supabase
    .from("notices")
    .update({
      title_ko: titleKo,
      title_en: titleEn || null,
      content_ko: contentKo || null,
      content_en: contentEn || null,
      is_published: isPublished,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "공지사항 수정에 실패했습니다." };
  }

  await logAudit({
    action: "update",
    targetTable: "notices",
    targetId: id,
    details: { title_ko: titleKo },
  });

  revalidatePath("/admin/notices");
  redirect("/admin/notices");
}

export async function toggleNoticePublish(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: notice } = await supabase
    .from("notices")
    .select("is_published")
    .eq("id", id)
    .single();

  if (!notice) return;

  const newPublished = !notice.is_published;

  await supabase
    .from("notices")
    .update({
      is_published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAudit({
    action: newPublished ? "publish" : "unpublish",
    targetTable: "notices",
    targetId: id,
  });

  revalidatePath("/admin/notices");
}

export async function deleteNotice(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("notices")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return;

  await logAudit({
    action: "delete",
    targetTable: "notices",
    targetId: id,
  });

  revalidatePath("/admin/notices");
}
