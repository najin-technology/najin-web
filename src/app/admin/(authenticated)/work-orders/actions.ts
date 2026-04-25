"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { WORK_ORDER_STATUSES } from "@/lib/status-colors";

type ActionState = { error?: string; success?: boolean };

const PRIORITIES = ["낮음", "보통", "높음"] as const;
const STORAGE_BUCKET = "work-order-attachments";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTS = [
  "pdf", "dwg", "dxf", "step", "stp", "igs", "iges",
  "stl", "obj", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx",
];

function asString(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createWorkOrder(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const customer_name = asString(formData, "customer_name");
  const product_name = asString(formData, "product_name");
  if (!customer_name || !product_name) {
    return { error: "고객사와 제품명은 필수입니다." };
  }

  const status = asString(formData, "status") ?? "접수";
  if (!WORK_ORDER_STATUSES.includes(status as (typeof WORK_ORDER_STATUSES)[number])) {
    return { error: "잘못된 상태값입니다." };
  }
  const priority = asString(formData, "priority") ?? "보통";
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return { error: "잘못된 우선순위입니다." };
  }

  const { data: numRow, error: numErr } = await supabase.rpc("next_work_order_number");
  if (numErr || !numRow) {
    return { error: "발주번호 생성 실패: " + (numErr?.message ?? "unknown") };
  }

  const { data: created, error } = await supabase
    .from("work_orders")
    .insert({
      order_number: numRow as string,
      quote_id: asString(formData, "quote_id"),
      customer_id: asString(formData, "customer_id"),
      customer_name,
      contact_name: asString(formData, "contact_name"),
      phone: asString(formData, "phone"),
      product_name,
      processing_type: asString(formData, "processing_type"),
      material: asString(formData, "material"),
      quantity: asString(formData, "quantity"),
      deadline: asString(formData, "deadline"),
      priority,
      status,
      description: asString(formData, "description"),
      internal_memo: asString(formData, "internal_memo"),
      assignee: asString(formData, "assignee"),
      created_by_user_id: user.id,
      status_started_at: status === "가공중" ? new Date().toISOString() : null,
      status_completed_at: status === "완료" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "발주 생성 실패: " + (error?.message ?? "unknown") };
  }

  await logAudit({
    action: "create",
    targetTable: "work_orders",
    targetId: created.id,
    details: { order_number: numRow, customer_name, product_name },
  });

  revalidatePath("/admin/work-orders");
  redirect(`/admin/work-orders/${created.id}`);
}

export async function updateWorkOrder(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = asString(formData, "id");
  if (!id) return { error: "id가 필요합니다." };

  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = {
    customer_name: asString(formData, "customer_name"),
    contact_name: asString(formData, "contact_name"),
    phone: asString(formData, "phone"),
    product_name: asString(formData, "product_name"),
    processing_type: asString(formData, "processing_type"),
    material: asString(formData, "material"),
    quantity: asString(formData, "quantity"),
    deadline: asString(formData, "deadline"),
    priority: asString(formData, "priority"),
    description: asString(formData, "description"),
    internal_memo: asString(formData, "internal_memo"),
    assignee: asString(formData, "assignee"),
  };

  const { error } = await supabase.from("work_orders").update(updates).eq("id", id);
  if (error) return { error: "수정 실패: " + error.message };

  await logAudit({
    action: "update",
    targetTable: "work_orders",
    targetId: id,
    details: { fields: Object.keys(updates) },
  });

  revalidatePath("/admin/work-orders");
  revalidatePath(`/admin/work-orders/${id}`);
  return { success: true };
}

export async function updateWorkOrderStatus(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = asString(formData, "id");
  const status = asString(formData, "status");
  if (!id || !status) return { error: "필수 항목 누락" };
  if (!WORK_ORDER_STATUSES.includes(status as (typeof WORK_ORDER_STATUSES)[number])) {
    return { error: "잘못된 상태값" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: prev } = await supabase
    .from("work_orders")
    .select("status, status_started_at, status_completed_at")
    .eq("id", id)
    .maybeSingle();

  const updates: Record<string, unknown> = { status };
  if (status === "가공중" && !prev?.status_started_at) {
    updates.status_started_at = new Date().toISOString();
  }
  if (status === "완료" && !prev?.status_completed_at) {
    updates.status_completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from("work_orders").update(updates).eq("id", id);
  if (error) return { error: "상태 변경 실패: " + error.message };

  await logAudit({
    action: "update_status",
    targetTable: "work_orders",
    targetId: id,
    details: { from: prev?.status, to: status },
  });

  revalidatePath("/admin/work-orders");
  revalidatePath(`/admin/work-orders/${id}`);
  return { success: true };
}

export async function deleteWorkOrder(id: string): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("work_orders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "삭제 실패: " + error.message };

  await logAudit({
    action: "delete",
    targetTable: "work_orders",
    targetId: id,
  });

  revalidatePath("/admin/work-orders");
  return { success: true };
}

export async function getWorkOrderAttachments(workOrderId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: attachments } = await supabase
    .from("attachments")
    .select("id, file_url, file_name, file_size, mime_type, created_at")
    .eq("parent_table", "work_orders")
    .eq("parent_id", workOrderId)
    .order("created_at", { ascending: true });

  if (!attachments || attachments.length === 0) return [];

  return Promise.all(
    attachments.map(async (att) => {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(att.file_url, 3600);
      return {
        id: att.id as string,
        fileName: att.file_name as string,
        fileSize: att.file_size as number,
        mimeType: att.mime_type as string,
        filePath: att.file_url as string,
        createdAt: att.created_at as string,
        signedUrl: data?.signedUrl ?? null,
      };
    })
  );
}

export async function addWorkOrderAttachment(
  workOrderId: string,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "파일이 비어있습니다." };
  if (file.size > MAX_FILE_SIZE) return { error: "파일은 50MB 이하만 업로드할 수 있습니다." };

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTS.includes(ext)) {
    return { error: "허용되지 않는 파일 형식입니다." };
  }

  const supabase = await createSupabaseServerClient();
  const filePath = `${workOrderId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file);
  if (upErr) return { error: "업로드 실패: " + upErr.message };

  const { error: insErr } = await supabase.from("attachments").insert({
    parent_table: "work_orders",
    parent_id: workOrderId,
    file_url: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || "application/octet-stream",
  });
  if (insErr) {
    // best-effort cleanup
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    return { error: "메타데이터 저장 실패: " + insErr.message };
  }

  await logAudit({
    action: "attach",
    targetTable: "work_orders",
    targetId: workOrderId,
    details: { file_name: file.name, file_size: file.size },
  });

  revalidatePath(`/admin/work-orders/${workOrderId}`);
  return { success: true };
}

export async function removeWorkOrderAttachment(
  attachmentId: string,
  workOrderId: string
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: att } = await supabase
    .from("attachments")
    .select("file_url, file_name")
    .eq("id", attachmentId)
    .eq("parent_table", "work_orders")
    .eq("parent_id", workOrderId)
    .maybeSingle();

  if (!att) return { error: "첨부를 찾을 수 없습니다." };

  await supabase.storage.from(STORAGE_BUCKET).remove([att.file_url as string]);
  const { error } = await supabase.from("attachments").delete().eq("id", attachmentId);
  if (error) return { error: "삭제 실패: " + error.message };

  await logAudit({
    action: "detach",
    targetTable: "work_orders",
    targetId: workOrderId,
    details: { file_name: att.file_name },
  });

  revalidatePath(`/admin/work-orders/${workOrderId}`);
  return { success: true };
}

export async function getWorkOrderStatusHistory(workOrderId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, details, user_email, created_at")
    .eq("target_table", "work_orders")
    .eq("target_id", workOrderId)
    .in("action", ["update_status", "create"])
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
