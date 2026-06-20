"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendByTemplateKey, type Locale } from "@/lib/email-templates";

type ActionState = {
  error?: string;
  success?: boolean;
  warning?: string;
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

// ---- Quotation file attachments (admin-uploaded, sent with '견적발송' mail) ----
const QUOTATION_BUCKET = "quote-attachments";
const QUOTATION_MAX_BYTES = 20 * 1024 * 1024; // per file
const QUOTATION_TOTAL_BYTES = 38 * 1024 * 1024; // Resend ~40MB cap, leave headroom
const QUOTATION_EXTS = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "hwp"];

type SupaClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function fetchQuotationAttachments(
  supabase: SupaClient,
  quoteId: string,
): Promise<{ filename: string; content: string }[]> {
  const { data: rows } = await supabase
    .from("attachments")
    .select("file_url, file_name")
    .eq("parent_table", "quotes")
    .eq("parent_id", quoteId)
    .eq("kind", "quotation");
  if (!rows?.length) return [];

  const out: { filename: string; content: string }[] = [];
  let total = 0;
  for (const r of rows) {
    const { data: blob, error } = await supabase.storage
      .from(QUOTATION_BUCKET)
      .download(r.file_url as string);
    if (error || !blob) continue;
    const buf = Buffer.from(await blob.arrayBuffer());
    if (total + buf.length > QUOTATION_TOTAL_BYTES) {
      console.warn(`quotation attachments exceed size cap for quote ${quoteId}; skipping rest`);
      break;
    }
    total += buf.length;
    out.push({ filename: r.file_name as string, content: buf.toString("base64") });
  }
  return out;
}

async function notifyStatusChange(supabase: SupaClient, quote: {
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

  const attachments =
    templateKey === "quote_status_sent"
      ? await fetchQuotationAttachments(supabase, quote.id)
      : undefined;

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
      attachments,
    });
  } catch (e) {
    console.error(`status-change mail (${templateKey}) failed for ${quote.id}:`, e);
  }
}

// 고객 언어로 취소 안내 메일. 발송 실패는 취소 처리 자체를 막지 않는다.
async function sendQuoteCancelledMail(
  quote: {
    id: string;
    email: string | null;
    contact_name: string | null;
    company_name: string | null;
    locale: string | null;
  },
  reason: string,
) {
  if (!quote.email) return;
  const locale = normalizeLocale(quote.locale);
  const quoteIdShort = quote.id.slice(0, 8).toUpperCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  try {
    await sendByTemplateKey({
      key: "quote_cancelled",
      to: quote.email,
      locale,
      vars: {
        contact_name: quote.contact_name || "",
        company_name: quote.company_name || "",
        quote_id_short: quoteIdShort,
        cancel_reason: reason,
        status_url: `${siteUrl}/${locale}/quote/status?id=${quoteIdShort}`,
      },
    });
  } catch (e) {
    console.error(`quote_cancelled mail failed for ${quote.id}:`, e);
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
  let warning: string | undefined;
  if (existing && existing.status !== status) {
    await notifyStatusChange(supabase, existing, status);
    if (status === "견적발송") {
      const { count } = await supabase
        .from("attachments")
        .select("id", { count: "exact", head: true })
        .eq("parent_table", "quotes")
        .eq("parent_id", id)
        .eq("kind", "quotation");
      if (!count) warning = "견적서 파일이 없어 첨부 없이 발송되었습니다.";
    }
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);

  return { success: true, warning };
}

export async function getQuoteAttachmentUrls(quoteId: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: attachments } = await supabase
    .from("attachments")
    .select("*")
    .eq("parent_table", "quotes")
    .eq("parent_id", quoteId)
    .neq("kind", "quotation")
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
        .map((row) => notifyStatusChange(supabase, row, status)),
    );
  }

  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { success: true, count: ids.length };
}

// ---- Quotation files (admin upload, attached to '견적발송' mail) ----

export async function getQuoteQuotationUrls(quoteId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("attachments")
    .select("id, file_url, file_name, file_size, mime_type")
    .eq("parent_table", "quotes")
    .eq("parent_id", quoteId)
    .eq("kind", "quotation")
    .order("created_at", { ascending: true });
  if (!rows?.length) return [];
  return Promise.all(
    rows.map(async (att) => {
      const { data } = await supabase.storage
        .from(QUOTATION_BUCKET)
        .createSignedUrl(att.file_url as string, 3600);
      return {
        id: att.id as string,
        fileName: att.file_name as string,
        fileSize: att.file_size as number,
        mimeType: att.mime_type as string,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );
}

export async function addQuoteQuotationFile(
  quoteId: string,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "파일이 비어있습니다." };
  if (file.size > QUOTATION_MAX_BYTES) return { error: "파일은 20MB 이하만 업로드할 수 있습니다." };

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !QUOTATION_EXTS.includes(ext)) {
    return { error: "허용되지 않는 형식입니다 (PDF/DOC/XLS/HWP/이미지)." };
  }

  const supabase = await createSupabaseServerClient();
  const filePath = `${quoteId}/quotation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage.from(QUOTATION_BUCKET).upload(filePath, file);
  if (upErr) return { error: "업로드 실패: " + upErr.message };

  const { error: insErr } = await supabase.from("attachments").insert({
    parent_table: "quotes",
    parent_id: quoteId,
    file_url: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || "application/octet-stream",
    kind: "quotation",
  });
  if (insErr) {
    await supabase.storage.from(QUOTATION_BUCKET).remove([filePath]);
    return { error: "메타데이터 저장 실패: " + insErr.message };
  }

  await logAudit({
    action: "attach_quotation",
    targetTable: "quotes",
    targetId: quoteId,
    details: { file_name: file.name, file_size: file.size },
  });

  revalidatePath(`/admin/quotes/${quoteId}`);
  return { success: true };
}

export async function removeQuoteQuotationFile(
  attachmentId: string,
  quoteId: string,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: att } = await supabase
    .from("attachments")
    .select("file_url, file_name")
    .eq("id", attachmentId)
    .eq("parent_table", "quotes")
    .eq("parent_id", quoteId)
    .eq("kind", "quotation")
    .maybeSingle();
  if (!att) return { error: "첨부를 찾을 수 없습니다." };

  await supabase.storage.from(QUOTATION_BUCKET).remove([att.file_url as string]);
  const { error } = await supabase.from("attachments").delete().eq("id", attachmentId);
  if (error) return { error: "삭제 실패: " + error.message };

  await logAudit({
    action: "detach_quotation",
    targetTable: "quotes",
    targetId: quoteId,
    details: { file_name: att.file_name },
  });

  revalidatePath(`/admin/quotes/${quoteId}`);
  return { success: true };
}

// ---- 개별 견적 취소 (사유 필수 → 고객 언어 취소 메일) ----
export async function cancelQuote(
  quoteId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const trimmed = (reason ?? "").trim();
  if (!trimmed) return { ok: false, error: "취소 사유를 입력해주세요." };

  const supabase = await createSupabaseServerClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status, email, contact_name, company_name, locale")
    .eq("id", quoteId)
    .maybeSingle();

  if (!quote) return { ok: false, error: "견적을 찾을 수 없습니다." };
  if (quote.status === "취소") return { ok: false, error: "이미 취소된 견적입니다." };

  const { error } = await supabase
    .from("quotes")
    .update({
      status: "취소",
      cancel_reason: trimmed,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { ok: false, error: "취소 처리 실패: " + error.message };

  await logAudit({
    action: "cancel",
    targetTable: "quotes",
    targetId: quoteId,
    details: { reason: trimmed },
  });

  // 고객에게 취소 안내 메일 (고객 요청 언어로).
  await sendQuoteCancelledMail(quote, trimmed);

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${quoteId}`);
  return { ok: true };
}

// ---- 견적 일괄 취소 (사유 1개 공유 → 각 고객 언어로 취소 메일) ----
export async function bulkCancelQuotes(
  ids: string[],
  reason: string,
): Promise<{ error?: string; success?: boolean; count?: number }> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) return { error: "선택된 항목이 없습니다." };
  const trimmed = (reason ?? "").trim();
  if (!trimmed) return { error: "취소 사유를 입력해주세요." };

  const supabase = await createSupabaseServerClient();

  // 이미 취소됐거나 삭제된 건은 제외하고 대상만 조회.
  const { data: targets } = await supabase
    .from("quotes")
    .select("id, status, email, contact_name, company_name, locale")
    .in("id", ids)
    .neq("status", "취소")
    .is("deleted_at", null);

  if (!targets || targets.length === 0) {
    return { error: "취소할 수 있는 견적이 없습니다 (이미 취소되었거나 삭제됨)." };
  }

  const targetIds = targets.map((t) => t.id);
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("quotes")
    .update({ status: "취소", cancel_reason: trimmed, cancelled_at: now, updated_at: now })
    .in("id", targetIds);

  if (error) return { error: "일괄 취소 실패: " + error.message };

  await logAudit({
    action: "bulk_cancel",
    targetTable: "quotes",
    details: { count: targetIds.length, reason: trimmed },
  });

  // 각 고객에게 취소 안내 메일.
  await Promise.all(targets.map((t) => sendQuoteCancelledMail(t, trimmed)));

  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { success: true, count: targetIds.length };
}

// ---- 견적 기록 삭제 (소프트: deleted_at 설정 → 관리자 목록·분석·고객 조회에서 숨김) ----
// 행과 첨부는 보존되어 DB 차원 복구가 가능하다. 고객은 더 이상 상태조회 페이지에서 조회할 수 없다.
export async function softDeleteQuotes(
  ids: string[],
): Promise<{ error?: string; success?: boolean; count?: number }> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) return { error: "선택된 항목이 없습니다." };

  const supabase = await createSupabaseServerClient();

  // 감사 로그 스냅샷 — 행이 숨겨져도 누가 무엇을 지웠는지 추적 가능하게.
  const { data: targets } = await supabase
    .from("quotes")
    .select("id, company_name, contact_name, email, status")
    .in("id", ids)
    .is("deleted_at", null);

  if (!targets || targets.length === 0) return { error: "삭제할 견적이 없습니다." };

  const targetIds = targets.map((t) => t.id);
  const { error } = await supabase
    .from("quotes")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", targetIds);

  if (error) return { error: "삭제 실패: " + error.message };

  await logAudit({
    action: "soft_delete",
    targetTable: "quotes",
    details: {
      count: targetIds.length,
      quotes: targets.map((t) => ({
        id: t.id,
        company: t.company_name,
        contact: t.contact_name,
        email: t.email,
        status: t.status,
      })),
    },
  });

  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { success: true, count: targetIds.length };
}
