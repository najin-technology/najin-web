import { Resend } from "resend";
import { getSupabaseAdmin } from "./supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

export type Locale = "ko" | "en" | "zh";
type Vars = Record<string, string | undefined>;

export function renderTemplate(template: string, vars: Vars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export async function sendByTemplateKey(args: {
  key: string;
  to: string;
  locale: Locale;
  vars: Vars;
}): Promise<{ ok: boolean; reason?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "service_role_unavailable" };

  const { data: t, error } = await supabase
    .from("email_templates")
    .select(
      "subject_ko, subject_en, subject_zh, body_ko, body_en, body_zh, enabled",
    )
    .eq("key", args.key)
    .single();

  if (error || !t) return { ok: false, reason: "template_not_found" };

  type Row = {
    subject_ko: string;
    subject_en: string;
    subject_zh: string;
    body_ko: string;
    body_en: string;
    body_zh: string;
    enabled: boolean;
  };
  const row = t as Row;
  if (!row.enabled) return { ok: false, reason: "disabled" };

  const subject = (row[`subject_${args.locale}` as const] || row.subject_ko) as string;
  const body = (row[`body_${args.locale}` as const] || row.body_ko) as string;
  if (!subject || !body) return { ok: false, reason: "empty_for_locale" };

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject: renderTemplate(subject, args.vars),
      text: renderTemplate(body, args.vars),
    });
    return { ok: true };
  } catch (e) {
    console.error(`sendByTemplateKey ${args.key} failed:`, e);
    return { ok: false, reason: "send_error" };
  }
}
