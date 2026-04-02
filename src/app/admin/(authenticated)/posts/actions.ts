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

export async function createPost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const slug = formData.get("slug") as string;
  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const excerptKo = formData.get("excerpt_ko") as string;
  const excerptEn = formData.get("excerpt_en") as string;
  const contentKo = formData.get("content_ko") as string;
  const contentEn = formData.get("content_en") as string;
  const category = formData.get("category") as string;
  const tagsStr = formData.get("tags") as string;
  const thumbnailUrl = formData.get("thumbnail_url") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!slug || !titleKo || !category) {
    return { error: "슬러그, 제목(한국어), 카테고리는 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const tags = tagsStr
    ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title_ko: titleKo,
      title_en: titleEn || null,
      excerpt_ko: excerptKo || null,
      excerpt_en: excerptEn || null,
      content_ko: contentKo || null,
      content_en: contentEn || null,
      category,
      tags: tags.length > 0 ? tags : null,
      thumbnail_url: thumbnailUrl || null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "포트폴리오 등록에 실패했습니다." };
  }

  await logAudit({
    action: "create",
    targetTable: "posts",
    targetId: data.id,
    details: { slug, title_ko: titleKo },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/ko/posts");
  revalidatePath("/en/posts");
  redirect("/admin/posts");
}

export async function updatePost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const excerptKo = formData.get("excerpt_ko") as string;
  const excerptEn = formData.get("excerpt_en") as string;
  const contentKo = formData.get("content_ko") as string;
  const contentEn = formData.get("content_en") as string;
  const category = formData.get("category") as string;
  const tagsStr = formData.get("tags") as string;
  const thumbnailUrl = formData.get("thumbnail_url") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!id || !slug || !titleKo || !category) {
    return { error: "슬러그, 제목(한국어), 카테고리는 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: current } = await supabase
    .from("posts")
    .select("is_published, published_at")
    .eq("id", id)
    .single();

  const publishedAt =
    isPublished && !current?.is_published
      ? new Date().toISOString()
      : isPublished
        ? current?.published_at
        : null;

  const tags = tagsStr
    ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase
    .from("posts")
    .update({
      slug,
      title_ko: titleKo,
      title_en: titleEn || null,
      excerpt_ko: excerptKo || null,
      excerpt_en: excerptEn || null,
      content_ko: contentKo || null,
      content_en: contentEn || null,
      category,
      tags: tags.length > 0 ? tags : null,
      thumbnail_url: thumbnailUrl || null,
      is_published: isPublished,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "포트폴리오 수정에 실패했습니다." };
  }

  await logAudit({
    action: "update",
    targetTable: "posts",
    targetId: id,
    details: { slug, title_ko: titleKo },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/ko/posts");
  revalidatePath("/en/posts");
  redirect("/admin/posts");
}

export async function togglePostPublish(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("posts")
    .select("is_published")
    .eq("id", id)
    .single();

  if (!post) return;

  const newPublished = !post.is_published;

  await supabase
    .from("posts")
    .update({
      is_published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAudit({
    action: newPublished ? "publish" : "unpublish",
    targetTable: "posts",
    targetId: id,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/ko/posts");
  revalidatePath("/en/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Delete post error:", error);
    return;
  }

  await logAudit({
    action: "delete",
    targetTable: "posts",
    targetId: id,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/ko/posts");
  revalidatePath("/en/posts");
}
