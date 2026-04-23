"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const STATUSES = ["리드", "검토중", "견적전송", "진행중", "완료", "보류", "거절"] as const;

export async function updateCustomerStatus(id: string, status: string) {
  await requireAdmin();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return { error: "잘못된 상태값" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    targetTable: "customers",
    targetId: id,
    details: { status },
  });
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function updateCustomerTags(id: string, tags: string[]) {
  await requireAdmin();
  const cleaned = tags.map((t) => t.trim()).filter(Boolean).slice(0, 20);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").update({ tags: cleaned }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    targetTable: "customers",
    targetId: id,
    details: { tags: cleaned },
  });
  revalidatePath(`/admin/customers/${id}`);
  return { success: true };
}

export async function updateCustomerNotes(id: string, notes: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").update({ notes }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    targetTable: "customers",
    targetId: id,
    details: { notes_len: notes.length },
  });
  revalidatePath(`/admin/customers/${id}`);
  return { success: true };
}

const DISPLAY_CATEGORIES = ["automotive", "industrial", "overseas"] as const;

export async function updateCustomerDisplay(
  id: string,
  display: {
    client_slug: string | null;
    logo_url: string | null;
    name_en: string | null;
    needs_dark_bg: boolean;
    display_category: string | null;
    display_order: number;
    registered_year: number | null;
  }
) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const cleaned = {
    client_slug: display.client_slug?.trim() || null,
    logo_url: display.logo_url?.trim() || null,
    name_en: display.name_en?.trim() || null,
    needs_dark_bg: !!display.needs_dark_bg,
    display_category:
      display.display_category &&
      DISPLAY_CATEGORIES.includes(display.display_category as (typeof DISPLAY_CATEGORIES)[number])
        ? display.display_category
        : null,
    display_order: Number.isFinite(display.display_order) ? Math.max(0, display.display_order) : 0,
    registered_year:
      display.registered_year && Number.isFinite(display.registered_year)
        ? display.registered_year
        : null,
  };

  const { error } = await supabase.from("customers").update(cleaned).eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "update_display",
    targetTable: "customers",
    targetId: id,
    details: cleaned,
  });

  // Revalidate public surfaces that consume the client grid
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
  revalidatePath("/", "layout"); // home + portfolio + clients/* layouts
  return { success: true };
}
