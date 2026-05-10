import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";

// 캐시 태그 — admin actions 에서 revalidateTag 로 정밀 무효화에 사용.
export const CACHE_TAGS = {
  history: "history",
  notices: "notices",
  jobPostings: "job-postings",
  posts: "posts",
  products: "products",
  customers: "customers",
  clientDeliveries: "client-deliveries",
  siteAbout: "site-about",
  certifications: "certifications",
} as const;

const ONE_HOUR = 3600;

export const getHistoryItems = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("history_items")
      .select("*")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
  ["history-items"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.history] },
);

export const getPublishedNotices = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title_ko, title_en, published_at, created_at")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  ["published-notices"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.notices] },
);

export async function getNoticeById(id: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .is("deleted_at", null)
        .single();
      if (error) return null;
      return data;
    },
    ["notice", id],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.notices, `notice:${id}`] },
  )();
}

export const getActiveJobPostings = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  ["active-job-postings"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.jobPostings] },
);

export async function getPublishedPosts(category?: string, tag?: string) {
  return unstable_cache(
    async () => {
      let query = supabase
        .from("posts")
        .select(
          "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, thumbnail_url, image_urls, tags, original_date, published_at, created_at",
        )
        .eq("is_published", true)
        .is("deleted_at", null)
        .order("original_date", { ascending: false });

      if (category) query = query.eq("category", category);
      if (tag) query = query.contains("tags", [tag]);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    ["published-posts", category ?? "_all", tag ?? "_any"],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.posts] },
  )();
}

export const getHomePosts = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, thumbnail_url, image_urls, tags, original_date, published_at, created_at",
      )
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("original_date", { ascending: false })
      .limit(3);
    if (error) throw error;
    return data;
  },
  ["home-posts"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.posts] },
);

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, customer:customers(id, client_slug, company_name, name_en, logo_url)",
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .is("deleted_at", null)
        .single();
      if (error) return null;
      return data;
    },
    ["post-by-slug", slug],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.posts, `post:${slug}`] },
  )();
}

export const getPostCategories = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("category")
      .eq("is_published", true)
      .is("deleted_at", null);
    if (error) throw error;
    return [...new Set(data?.map((d) => d.category) || [])];
  },
  ["post-categories"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.posts] },
);

/**
 * 거래처 그리드용 메타데이터.
 * customers 테이블에서 client_slug 가 지정된 row 를 display_order 순으로 반환.
 */
export type ClientGridRow = {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  logo: string;
  category: string | null;
  needsDarkBg: boolean;
  registeredYear: number | null;
};

export const getClientGrid = unstable_cache(
  async (): Promise<ClientGridRow[]> => {
    const { data, error } = await supabase
      .from("customers")
      .select(
        "id, client_slug, company_name, display_name, name_en, logo_url, display_category, needs_dark_bg, display_order, registered_year",
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
  },
  ["client-grid"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.customers] },
);

export async function getClientGridRowBySlug(
  slug: string,
): Promise<ClientGridRow | null> {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("customers")
        .select(
          "id, client_slug, company_name, display_name, name_en, logo_url, display_category, needs_dark_bg, display_order, registered_year",
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
    },
    ["client-grid-row", slug],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.customers, `customer:${slug}`] },
  )();
}

export async function getClientDeliveries(slug: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("client_deliveries")
        .select("id, year, month, description_ko, description_en, source")
        .eq("client_slug", slug)
        .order("year", { ascending: false })
        .order("month", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    ["client-deliveries", slug],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.clientDeliveries, `customer:${slug}`] },
  )();
}

export async function getPostsForClient(slug: string) {
  return unstable_cache(
    async () => {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("client_slug", slug)
        .is("deleted_at", null)
        .maybeSingle();
      if (!customer) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, slug, title_ko, title_en, excerpt_ko, excerpt_en, category, thumbnail_url, original_date, published_at",
        )
        .eq("customer_id", customer.id)
        .eq("is_published", true)
        .is("deleted_at", null)
        .order("original_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    ["posts-for-client", slug],
    {
      revalidate: ONE_HOUR,
      tags: [CACHE_TAGS.posts, CACHE_TAGS.customers, `customer:${slug}`],
    },
  )();
}

export const getProductsByCategory = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("category")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
  ["products-by-category"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.products] },
);

export type SiteAbout = {
  id: number;
  ceo_name_ko: string;
  ceo_name_en: string;
  ceo_name_zh: string;
  ceo_greeting_ko: string;
  ceo_greeting_en: string;
  ceo_greeting_zh: string;
  brochure_pdf_path: string | null;
  brochure_pdf_name: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

export const getSiteAbout = unstable_cache(
  async (): Promise<SiteAbout | null> => {
    const { data, error } = await supabase
      .from("site_about")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) return null;
    return data as SiteAbout;
  },
  ["site-about"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.siteAbout] },
);

export type Certification = {
  id: string;
  title_ko: string;
  title_en: string;
  title_zh: string;
  image_path: string;
  pdf_path: string | null;
  sort_order: number;
};

export const getPublishedCertifications = unstable_cache(
  async (): Promise<Certification[]> => {
    const { data, error } = await supabase
      .from("certifications")
      .select("id, title_ko, title_en, title_zh, image_path, pdf_path, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data ?? []) as Certification[];
  },
  ["certifications-published"],
  { revalidate: ONE_HOUR, tags: [CACHE_TAGS.certifications] },
);
