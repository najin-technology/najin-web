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

export async function createProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const nameKo = formData.get("name_ko") as string;
  const nameEn = formData.get("name_en") as string;
  const descriptionKo = formData.get("description_ko") as string;
  const descriptionEn = formData.get("description_en") as string;
  const category = formData.get("category") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
  const isActive = formData.get("is_active") === "true";

  if (!nameKo || !category) {
    return { error: "제품명(한국어)과 카테고리는 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  // Handle image uploads
  const imageUrls: string[] = [];
  const images = formData.getAll("images") as File[];

  for (const image of images) {
    if (image.size === 0) continue;

    const ext = image.name.split(".").pop();
    const fileName = `${category}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, image);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      imageUrls.push(urlData.publicUrl);
    }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name_ko: nameKo,
      name_en: nameEn || null,
      description_ko: descriptionKo || null,
      description_en: descriptionEn || null,
      category,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "제품 등록에 실패했습니다." };
  }

  await logAudit({
    action: "create",
    targetTable: "products",
    targetId: data.id,
    details: { name_ko: nameKo, category },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const nameKo = formData.get("name_ko") as string;
  const nameEn = formData.get("name_en") as string;
  const descriptionKo = formData.get("description_ko") as string;
  const descriptionEn = formData.get("description_en") as string;
  const category = formData.get("category") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
  const isActive = formData.get("is_active") === "true";
  const existingUrls = formData.get("existing_image_urls") as string;

  if (!id || !nameKo || !category) {
    return { error: "제품명(한국어)과 카테고리는 필수 항목입니다." };
  }

  const supabase = await createSupabaseServerClient();

  // Keep existing image URLs
  let imageUrls: string[] = existingUrls ? JSON.parse(existingUrls) : [];

  // Handle new image uploads
  const images = formData.getAll("images") as File[];

  for (const image of images) {
    if (image.size === 0) continue;

    const ext = image.name.split(".").pop();
    const fileName = `${category}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, image);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      imageUrls.push(urlData.publicUrl);
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      name_ko: nameKo,
      name_en: nameEn || null,
      description_ko: descriptionKo || null,
      description_en: descriptionEn || null,
      category,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      sort_order: sortOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "제품 수정에 실패했습니다." };
  }

  await logAudit({
    action: "update",
    targetTable: "products",
    targetId: id,
    details: { name_ko: nameKo, category },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProductActive(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!product) return;

  const newActive = !product.is_active;

  await supabase
    .from("products")
    .update({
      is_active: newActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAudit({
    action: newActive ? "activate" : "deactivate",
    targetTable: "products",
    targetId: id,
  });

  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return;

  await logAudit({
    action: "delete",
    targetTable: "products",
    targetId: id,
  });

  revalidatePath("/admin/products");
}
