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
