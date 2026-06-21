"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CACHE_TAGS } from "@/lib/queries";
import { randomUUID } from "node:crypto";

type ActionState = {
  error?: string;
  success?: boolean;
};

// ponytail: naive first-<img> extractor over the post body (ko→en→zh). Good enough
// for picking a thumbnail; swap for a DOM parser only if richer extraction is needed.
function firstImageUrl(...htmls: (string | null)[]): string | null {
  for (const html of htmls) {
    const m = html?.match(/<img[^>]+\bsrc\s*=\s*["']([^"']+)["']/i);
    if (m) return m[1];
  }
  return null;
}

export async function createPost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const excerptKo = formData.get("excerpt_ko") as string;
  const excerptEn = formData.get("excerpt_en") as string;
  const contentKo = formData.get("content_ko") as string;
  const contentEn = formData.get("content_en") as string;
  const titleZh = formData.get("title_zh") as string;
  const excerptZh = formData.get("excerpt_zh") as string;
  const contentZh = formData.get("content_zh") as string;
  const category = formData.get("category") as string;
  const processCategory = formData.get("process_category") as string;
  const featured = formData.get("featured") === "true";
  const tagsStr = formData.get("tags") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!titleKo || !category) {
    return { error: "제목(한국어), 카테고리는 필수 항목입니다." };
  }

  // 슬러그는 자동 생성(랜덤), 썸네일은 본문 첫 이미지에서 추출
  const slug = randomUUID();
  const thumbnailUrl = firstImageUrl(contentKo, contentEn, contentZh);

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
      title_zh: titleZh || null,
      excerpt_zh: excerptZh || null,
      content_zh: contentZh || null,
      category,
      process_category: processCategory || null,
      featured,
      tags: tags.length > 0 ? tags : null,
      thumbnail_url: thumbnailUrl || null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "제작사례 등록에 실패했습니다." };
  }

  await logAudit({
    action: "create",
    targetTable: "posts",
    targetId: data.id,
    details: { slug, title_ko: titleKo },
  });

  updateTag(CACHE_TAGS.posts);
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
  const titleKo = formData.get("title_ko") as string;
  const titleEn = formData.get("title_en") as string;
  const excerptKo = formData.get("excerpt_ko") as string;
  const excerptEn = formData.get("excerpt_en") as string;
  const contentKo = formData.get("content_ko") as string;
  const contentEn = formData.get("content_en") as string;
  const titleZh = formData.get("title_zh") as string;
  const excerptZh = formData.get("excerpt_zh") as string;
  const contentZh = formData.get("content_zh") as string;
  const category = formData.get("category") as string;
  const processCategory = formData.get("process_category") as string;
  const featured = formData.get("featured") === "true";
  const tagsStr = formData.get("tags") as string;
  const isPublished = formData.get("is_published") === "true";

  if (!id || !titleKo || !category) {
    return { error: "제목(한국어), 카테고리는 필수 항목입니다." };
  }

  // 슬러그는 생성 시 자동 부여된 값을 그대로 유지, 썸네일은 본문 첫 이미지에서 재추출
  const thumbnailUrl = firstImageUrl(contentKo, contentEn, contentZh);

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
      title_ko: titleKo,
      title_en: titleEn || null,
      excerpt_ko: excerptKo || null,
      excerpt_en: excerptEn || null,
      content_ko: contentKo || null,
      content_en: contentEn || null,
      title_zh: titleZh || null,
      excerpt_zh: excerptZh || null,
      content_zh: contentZh || null,
      category,
      process_category: processCategory || null,
      featured,
      tags: tags.length > 0 ? tags : null,
      thumbnail_url: thumbnailUrl || null,
      is_published: isPublished,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "제작사례 수정에 실패했습니다." };
  }

  await logAudit({
    action: "update",
    targetTable: "posts",
    targetId: id,
    details: { title_ko: titleKo },
  });

  updateTag(CACHE_TAGS.posts);
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

  const { error } = await supabase
    .from("posts")
    .update({
      is_published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return;

  await logAudit({
    action: newPublished ? "publish" : "unpublish",
    targetTable: "posts",
    targetId: id,
  });

  updateTag(CACHE_TAGS.posts);
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

  updateTag(CACHE_TAGS.posts);
  revalidatePath("/admin/posts");
  revalidatePath("/ko/posts");
  revalidatePath("/en/posts");
}
