"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendByTemplateKey, type Locale } from "@/lib/email-templates";

type ActionState = {
  error?: string;
  success?: boolean;
};

const STATUS_TO_TEMPLATE_KEY: Record<string, string | null> = {
  접수: null,
  검토중: "quote_status_reviewing",
  견적발송: "quote_status_sent",
  완료: "quote_status_completed",
};

function normalizeLocale(value: unknown): Locale {
  return value === "en" || value === "zh" ? value : "ko";
}

async function notifyStatusChange(quote: {
  id: string;
  email: string | null;
  contact_name: string | null;
  company_name: string | null;
  locale: string | null;
}, newStatus: string) {
  const templateKey = STATUS_TO_TEMPLATE_KEY[newStatus];
  if (!templateKey || !quote.email) return;

  const locale = normalizeLocale(quote.locale);
  const quoteIdShort = quote.id.slice(0, 8).toUpperCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  try {
    await sendByTemplateKey({
      key: templateKey,
      to: quote.email,
      locale,
      vars: {
        contact_name: quote.contact_name || "",
        company_name: quote.company_name || "",
        quote_id_short: quoteIdShort,
        status_url: `${siteUrl}/${locale}/quote/status?id=${quoteIdShort}`,
      },
    });
  } catch (e) {
    console.error(`status-change mail (${templateKey}) failed for ${quote.id}:`, e);
  }
}

export async function updateQuoteStatus(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const adminMemo = formData.get("admin_memo") as string;

  if (!id || !status) {
    return { error: "필수 항목을 입력해주세요." };
  }

  const supabase = await createSupabaseServerClient();

  // Fetch current quote so we can detect status changes and have email/locale for mail.
  const { data: existing } = await supabase
    .from("quotes")
    .select("id, status, email, contact_name, company_name, locale")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("quotes")
    .update({
      status,
      admin_memo: adminMemo || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "상태 변경에 실패했습니다." };
  }

  await logAudit({
    action: "update_status",
    targetTable: "quotes",
    targetId: id,
    details: { status, admin_memo: adminMemo },
  });

  // Send status-change auto mail (only if status actually changed)
  if (existing && existing.status !== status) {
    await notifyStatusChange(existing, status);
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);

  return { success: true };
}

export async function getQuoteAttachmentUrls(quoteId: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: attachments } = await supabase
    .from("attachments")
    .select("*")
    .eq("parent_table", "quotes")
    .eq("parent_id", quoteId)
    .order("created_at", { ascending: true });

  if (!attachments || attachments.length === 0) return [];

  const results = await Promise.all(
    attachments.map(async (att) => {
      const { data } = await supabase.storage
        .from("quote-attachments")
        .createSignedUrl(att.file_url, 3600);

      return {
        id: att.id,
        fileName: att.file_name,
        fileSize: att.file_size,
        mimeType: att.mime_type,
        signedUrl: data?.signedUrl || null,
      };
    })
  );

  return results;
}

const QUOTE_STATUSES = ["접수", "검토중", "견적발송", "완료"] as const;

export async function bulkUpdateQuoteStatus(ids: string[], status: string) {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) return { error: "선택된 항목이 없습니다." };
  if (!QUOTE_STATUSES.includes(status as (typeof QUOTE_STATUSES)[number])) {
    return { error: "잘못된 상태값입니다." };
  }

  const supabase = await createSupabaseServerClient();

  // Fetch existing rows so we can send mail per-quote with their locale/email.
  const { data: existingRows } = await supabase
    .from("quotes")
    .select("id, status, email, contact_name, company_name, locale")
    .in("id", ids);

  const { error } = await supabase
    .from("quotes")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) return { error: "일괄 업데이트 실패: " + error.message };

  await logAudit({
    action: "bulk_update_status",
    targetTable: "quotes",
    details: { count: ids.length, status },
  });

  // Per-row status-change mails (only when status actually changed)
  if (existingRows && existingRows.length > 0) {
    await Promise.all(
      existingRows
        .filter((row) => row.status !== status)
        .map((row) => notifyStatusChange(row, status)),
    );
  }

  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { success: true, count: ids.length };
}
