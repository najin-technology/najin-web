"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionState = {
  error?: string;
  success?: boolean;
};

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

  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { success: true, count: ids.length };
}
