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

export async function getPublishedPosts(category?: string, tag?: string) {
  let query = supabase
    .from("posts")
    .select(
      "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, thumbnail_url, image_urls, tags, original_date, published_at, created_at"
    )
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("original_date", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getHomePosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, thumbnail_url, image_urls, tags, original_date, published_at, created_at"
    )
    .eq("is_published", true)
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

/**
 * 거래처 그리드용 메타데이터.
 * customers 테이블에서 client_slug 가 지정된 row 를 display_order 순으로 반환.
 */
export type ClientGridRow = {
  id: string;
  slug: string;            // client_slug
  name: string;            // company_name (표시명, 한글)
  nameEn: string | null;
  logo: string;            // logo_url
  category: string | null; // automotive / industrial / overseas
  needsDarkBg: boolean;
  registeredYear: number | null;
};

export async function getClientGrid(): Promise<ClientGridRow[]> {
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, client_slug, company_name, display_name, name_en, logo_url, display_category, needs_dark_bg, display_order, registered_year"
    )
    .not("client_slug", "is", null)
    .not("logo_url", "is", null)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data || []).map((c) => ({
    id: c.id,
    slug: c.client_slug as string,
    name: c.company_name,
    nameEn: c.name_en,
    logo: c.logo_url as string,
    category: c.display_category,
    needsDarkBg: !!c.needs_dark_bg,
    registeredYear: c.registered_year,
  }));
}

export async function getClientGridRowBySlug(
  slug: string
): Promise<ClientGridRow | null> {
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, client_slug, company_name, display_name, name_en, logo_url, display_category, needs_dark_bg, display_order, registered_year"
    )
    .eq("client_slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    slug: data.client_slug as string,
    name: data.company_name,
    nameEn: data.name_en,
    logo: data.logo_url as string,
    category: data.display_category,
    needsDarkBg: !!data.needs_dark_bg,
    registeredYear: data.registered_year,
  };
}

export async function getClientDeliveries(slug: string) {
  const { data, error } = await supabase
    .from("client_deliveries")
    .select("id, year, month, description_ko, description_en, source")
    .eq("client_slug", slug)
    .order("year", { ascending: false })
    .order("month", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data;
}

export async function getPostsForClient(slug: string) {
  // 1) Look up customer by client_slug
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("client_slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer) return [];

  // 2) Pull posts linked to that customer
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, thumbnail_url, original_date, published_at")
    .eq("customer_id", customer.id)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("original_date", { ascending: false });

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
