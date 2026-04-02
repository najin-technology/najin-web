import { supabase } from "./supabase";

export async function getHistoryItems() {
  const { data, error } = await supabase
    .from("history_items")
    .select("*")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getPublishedNotices() {
  const { data, error } = await supabase
    .from("notices")
    .select("id, title_ko, title_en, published_at, created_at")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNoticeById(id: string) {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getActiveJobPostings() {
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPublishedPosts(category?: string) {
  let query = supabase
    .from("posts")
    .select(
      "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, content_type, thumbnail_url, image_urls, tags, original_date, published_at, created_at, show_on_home"
    )
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("original_date", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getHomePortfolio() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, content_type, thumbnail_url, image_urls, tags, original_date, published_at, created_at"
    )
    .eq("is_published", true)
    .eq("show_on_home", true)
    .is("deleted_at", null)
    .order("original_date", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data;
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getPostCategories() {
  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .eq("is_published", true)
    .is("deleted_at", null);

  if (error) throw error;
  const categories = [...new Set(data?.map((d) => d.category) || [])];
  return categories;
}

export async function getProductsByCategory() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("category")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}
